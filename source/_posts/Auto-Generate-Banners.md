---
top_img: /img/banners/Auto-Generate-Banners.jpg
cover: /img/banners/Auto-Generate-Banners.jpg
title: 使用 Unsplash 自动生成文章题头图（实践与实现）
date: 2025-10-30 12:30:00
tags: [Hexo, Unsplash, 题头图, 脚本, 工具]
categories: [工具]
description: 记录在 Hexo 博客中用 Unsplash API 自动为每篇文章生成题头图的实践，包含脚本、配置、使用方法与常见问题排查。
---

# 使用 Unsplash 自动生成文章题头图（实践与实现）

核心是利用一条命令实现从 unsplash 上查找图片并下载，然后放置题头图中，查找默认使用文件名（一开始尝试使用分类来找图片，感觉效果不如我意），也支持命令中加一个字符串参数来自定义图片的查找。
我自己写文章流程一般是：在某个笔记软件（Typora or Obsidian）写文章或笔记，如要发博客，则先把 md 文件复制到\_posts 目录，然后让 ai 写元数据（当然直接 hexo new post 也行，并会帮你生成默认的一些元数据，然后自己修改），之后就是运行`node tools/add-banner.js "xxx.md" "zzz,yyy"`来自动下载图片并在元数据上自动放置，`zzz,yyy`即你想要检索的图片的关键词。

## 目标

- 每篇文章都能自动获得题头图，且本地存储在仓库内；
- 既支持我常用的“复制 .md 到 \_posts”工作流，也支持 `hexo new` 的自动化；
- 文章页使用 `top_img`，首页卡片使用 `cover`，两者由脚本同时写入/替换；
- 检索策略为“按文件名/标题”，命中失败则退回默认风景图；
- 重复运行同一文章会重新随机一张并覆盖原图。

## 目录与文件

- `tools/add-banner.js`：手动为现有文章下载题头图，自动写入 front-matter 的 `top_img` 和 `cover`。
- `scripts/auto-banner.js`：`hexo new` 时自动下载并写入 `top_img` 与 `cover`。
- `.env`：存放 `UNSPLASH_ACCESS_KEY`（已加入 `.gitignore`）。
- `source/img/banners/`：本地题头图目录。

## 获取 Unsplash API Key

1. 打开 https://unsplash.com/developers
2. 登录（或注册）→ Your apps → New Application
3. 创建应用后复制 Access Key，写入项目根目录 `.env`

```env
UNSPLASH_ACCESS_KEY=你的_Access_Key
```

说明：免费配额对个人博客充足；若命中率不理想，可为命令传入自定义检索词。

## 设计与实现

- 使用 Random Photo API（/photos/random）+ `orientation=landscape`；
- 构建检索词：
  - 手动脚本按“文件名”生成关键词（将空格/连字符转为逗号分隔的关键词串）；
  - 自动钩子按“标题/slug”生成关键词；
  - 若请求失败或未命中，退回 `landscape,nature,scenery,mountains`；
- 保存路径：`source/img/banners/<slug>.jpg`；
- 自动修改文章 front‑matter：
  - 若存在则替换，若不存在则插入；
  - 一次性同时写入/替换 `top_img` 与 `cover`，保持文章页与首页卡片一致。

代码如下：
tools/add-banner.js

```javascript
/**
 * 手动为文章添加题头图的工具脚本
 * 使用方法：node tools/add-banner.js 文章名.md [分类]
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 默认随机风景关键词（找不到匹配时退回）
const DEFAULT_QUERY = "landscape,nature,scenery,mountains";

// 从文件名生成查询词
function buildQueryFromFilename(fileName) {
  // 去除扩展名并将连字符/下划线替换为空格
  const slug = fileName.replace(/\.[^.]+$/, "");
  const normalized = slug.replace(/[\-_]+/g, " ").trim();
  // 将连续空格替换为逗号空格，提升匹配概率
  const query = normalized.replace(/\s+/g, ", ");
  return query || DEFAULT_QUERY;
}

/**
 * 从 Unsplash 下载图片
 */
async function downloadBanner(query, outputPath) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey || accessKey === "YOUR_ACCESS_KEY_HERE") {
    console.error("❌ 未配置 Unsplash API Key");
    console.error("请在 .env 文件中配置 UNSPLASH_ACCESS_KEY");
    return false;
  }

  async function fetchOnce(q) {
    console.log(`🔍 搜索关键词: ${q}`);
    const searchRes = await axios.get(
      "https://api.unsplash.com/photos/random",
      {
        params: {
          query: q,
          orientation: "landscape",
          client_id: accessKey,
        },
        timeout: 10000,
      }
    );
    const imageUrl = searchRes.data.urls.regular;
    const author = searchRes.data.user.name;
    const authorUrl = searchRes.data.user.links.html;
    console.log(`📸 找到图片，作者: ${author}`);
    console.log(`   来源: ${authorUrl}`);
    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });
    fs.writeFileSync(outputPath, imageRes.data);
    console.log(`✅ 题头图已保存: ${outputPath}`);
    return true;
  }

  try {
    try {
      return await fetchOnce(query);
    } catch (e) {
      console.warn("⚠️ 按文件名检索未命中，改用默认随机风景图");
      return await fetchOnce(DEFAULT_QUERY);
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("❌ API Key 无效，请检查 .env 文件");
    } else if (error.code === "ECONNABORTED") {
      console.error("❌ 网络超时");
    } else {
      console.error("❌ 下载失败:", error.message);
    }
    return false;
  }
}

/**
 * 读取文章 front-matter 中的分类
 */
// 已不再依赖分类，改为以文件名作为查询

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法：");
    console.log("  node tools/add-banner.js 文章名.md [自定义检索词]");
    console.log("");
    console.log("示例：");
    console.log('  node tools/add-banner.js "dynamic programming.md"');
    console.log('  node tools/add-banner.js "最大流.md" "maximum flow, graph"');
    process.exit(0);
  }

  const fileName = args[0];
  let customQuery = args.slice(1).join(" ").trim();

  // 构建文件路径
  const postPath = path.join(process.cwd(), "source", "_posts", fileName);

  // 确定搜索关键词：优先使用自定义，其次用文件名构建
  const query = customQuery || buildQueryFromFilename(fileName);

  // 生成图片文件名
  const slug = path.basename(fileName, ".md");
  const bannerFileName = `${slug}.jpg`;
  const bannerPath = path.join(
    process.cwd(),
    "source",
    "img",
    "banners",
    bannerFileName
  );

  // 确保目录存在
  const bannerDir = path.dirname(bannerPath);
  if (!fs.existsSync(bannerDir)) {
    fs.mkdirSync(bannerDir, { recursive: true });
  }

  console.log("\n📸 开始下载题头图...");
  console.log(`   文章: ${fileName}`);
  console.log(`   检索: ${query}`);

  const success = await downloadBanner(query, bannerPath);

  if (success) {
    const topImgPath = `/img/banners/${bannerFileName}`;

    // 尝试自动写入/替换 front-matter 的 top_img 与 cover（首页卡片用）
    try {
      let content = fs.readFileSync(postPath, "utf8");
      if (/^---[\s\S]*?---/m.test(content)) {
        // 仅在 Front-matter 区域内修改，避免误改正文/代码块
        const openMatch = content.match(/^---\s*\r?\n/);
        const openIndex = openMatch ? 0 : content.indexOf("\n---\n");
        // 更严谨地查找关闭分隔符（从开头之后起算的第一个行首 ---）
        const fmOpen = content.search(/^---\s*\r?\n/m);
        if (fmOpen === -1) {
          throw new Error("Front-matter 起始分隔符未找到");
        }
        const rest = content.slice(
          fmOpen + content.match(/^---\s*\r?\n/m)[0].length
        );
        const closeRel = rest.search(/^---\s*\r?\n/m);
        if (closeRel === -1) {
          throw new Error("Front-matter 结束分隔符未找到");
        }
        const fmStart = fmOpen;
        const fmOpenEnd = fmOpen + content.match(/^---\s*\r?\n/m)[0].length;
        const fmCloseStart = fmOpenEnd + closeRel;

        const before = content.slice(0, fmOpenEnd);
        const fmBody = content.slice(fmOpenEnd, fmCloseStart);
        const after = content.slice(fmCloseStart);

        // 在 fmBody 内部替换/插入
        let newFm = fmBody
          // 去掉已有的 top_img/top_image/cover 行
          .replace(/^(?:top_img|top_image|cover)\s*:\s*.*\r?\n/gm, "");

        // 确保以换行结束，便于插入
        if (!/\r?\n$/.test(newFm)) newFm += "\n";

        // 插入新的字段（靠前位置便于查看）
        newFm = `top_img: ${topImgPath}\ncover: ${topImgPath}\n` + newFm;

        const newContent = before + newFm + after;
        fs.writeFileSync(postPath, newContent, "utf8");
        console.log("\n✅ 已自动写入 front-matter:");
        console.log(`   top_img: ${topImgPath}`);
        console.log(`   cover:   ${topImgPath}`);
      } else {
        // 不含 front-matter，不主动写入，提示手动添加
        console.log("\n⚠️ 未检测到 front-matter，请手动在文件开头添加：");
        console.log("---");
        console.log(`top_img: ${topImgPath}`);
        console.log(`cover:   ${topImgPath}`);
        console.log("---");
      }
    } catch (e) {
      console.log("\n⚠️ 写入 front-matter 失败，请手动添加：");
      console.log(`   top_img: ${topImgPath}`);
      console.log(`   cover:   ${topImgPath}`);
    }
  } else {
    console.log("\n❌ 下载失败，请稍后重试或手动添加题头图\n");
    process.exit(1);
  }
}

main();
```

scripts/auto-banner.js

```javascript
/**
 * Hexo 自动题头图生成脚本
 * 使用 Unsplash API 根据文章分类自动下载相关图片作为题头图
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 改为按标题/文件名检索；若未命中则退回默认风景
const DEFAULT_QUERY = "landscape,nature,scenery,mountains";

function buildQueryFromTitleOrSlug(title, slug) {
  const base = (title && title.trim()) || (slug && slug.trim()) || "";
  const normalized = base
    .replace(/[\-_]+/g, " ")
    .replace(/\s+/g, ", ")
    .trim();
  return normalized || DEFAULT_QUERY;
}

/**
 * 从 Unsplash 下载图片
 * @param {string} query - 搜索关键词
 * @param {string} outputPath - 输出路径
 */
async function downloadBanner(query, outputPath) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey || accessKey === "YOUR_ACCESS_KEY_HERE") {
    console.warn("⚠️  未配置 Unsplash API Key，跳过题头图下载");
    console.warn("请在 .env 文件中配置 UNSPLASH_ACCESS_KEY");
    return false;
  }

  async function fetchOnce(q) {
    console.log(`🔍 搜索关键词: ${q}`);
    const searchRes = await axios.get(
      "https://api.unsplash.com/photos/random",
      {
        params: { query: q, orientation: "landscape", client_id: accessKey },
        timeout: 10000,
      }
    );
    const imageUrl = searchRes.data.urls.regular; // 1080px 宽度
    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });
    fs.writeFileSync(outputPath, imageRes.data);
    console.log(`✅ 题头图已保存: ${path.basename(outputPath)}`);
    console.log(`   来源: ${searchRes.data.user.name} on Unsplash`);
    return true;
  }

  try {
    try {
      return await fetchOnce(query);
    } catch (e) {
      console.warn("⚠️ 按标题/文件名检索未命中，改用默认随机风景图");
      return await fetchOnce(DEFAULT_QUERY);
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error(
        "❌ API Key 无效，请检查 .env 文件中的 UNSPLASH_ACCESS_KEY"
      );
    } else if (error.code === "ECONNABORTED") {
      console.error("❌ 网络超时，请检查网络连接");
    } else {
      console.error("❌ 下载题头图失败:", error.message);
    }
    return false;
  }
}

/**
 * Hexo 新建文章时的钩子
 */
hexo.on("new", async function (data) {
  // 使用标题或 slug 构建检索词
  const query = buildQueryFromTitleOrSlug(data.title, data.slug);

  // 生成文件名
  const slug = data.slug || path.basename(data.path, ".md");
  const bannerFileName = `${slug}.jpg`;
  const bannerPath = path.join(
    hexo.source_dir,
    "img",
    "banners",
    bannerFileName
  );

  // 确保目录存在
  const bannerDir = path.dirname(bannerPath);
  if (!fs.existsSync(bannerDir)) {
    fs.mkdirSync(bannerDir, { recursive: true });
  }

  console.log(`\n📸 正在为文章 "${data.title}" 下载题头图...`);
  console.log(`   关键词: ${query}`);

  const success = await downloadBanner(query, bannerPath);

  if (success) {
    // 在文章 front-matter 中添加题头图路径
    const topImgPath = `/img/banners/${bannerFileName}`;
    console.log(`   路径: ${topImgPath}\n`);

    // 读取并修改文章内容
    try {
      let content = fs.readFileSync(data.path, "utf8");
      // 在 front-matter 中插入/替换 top_img 与 cover（首页卡片使用 cover）
      if (/^---[\s\S]*?---/m.test(content)) {
        // 已有 front-matter：处理 top_img
        if (/(?:^|\r?\n)top_img\s*:/m.test(content)) {
          content = content.replace(
            /(?:^|\r?\n)top_img\s*:\s*.*/m,
            `\ntop_img: ${topImgPath}`
          );
        } else {
          content = content.replace(
            /---\s*\r?\n/,
            `---\n` + `top_img: ${topImgPath}\n`
          );
        }

        // 处理 cover（用于首页卡片）
        if (/(?:^|\r?\n)cover\s*:/m.test(content)) {
          content = content.replace(
            /(?:^|\r?\n)cover\s*:\s*.*/m,
            `\ncover: ${topImgPath}`
          );
        } else {
          content = content.replace(
            /---\s*\r?\n/,
            `---\n` + `cover: ${topImgPath}\n`
          );
        }

        fs.writeFileSync(data.path, content, "utf8");
        console.log("✅ 已自动更新 front-matter: top_img 与 cover\n");
      }
    } catch (err) {
      console.warn("⚠️  无法自动修改文章，请手动添加以下字段到 front-matter:");
      console.warn(`   top_img: ${topImgPath}`);
      console.warn(`   cover:   ${topImgPath}`);
    }
  } else {
    console.log("💡 提示: 你可以稍后手动下载或使用默认题头图\n");
  }
});

// 导出函数供手动使用
module.exports = {
  downloadBanner,
};
```

## 使用方法

### A. 手动（推荐给现有文章）

将文章复制到 `source/_posts/` 后，执行：

```powershell
# 按文件名检索，自动写入 top_img & cover
node tools/add-banner.js "你的文章.md"

# 指定自定义检索词（更容易命中对应风格）
node tools/add-banner.js "你的文章.md" "maximum flow, graph"
```

运行后脚本会：

- 下载图片到 `source/img/banners/你的文章.jpg`；
- 在该文章的 front‑matter 中写入或替换：

```
top_img: /img/banners/Auto-Generate-Banners.jpg
cover: /img/banners/Auto-Generate-Banners.jpg
```

如果文章没有 front‑matter，会在控制台提示你要粘贴的字段。

### B. 自动（配合 hexo new）

使用 Hexo 新建文章：

```powershell
hexo new "我的新文章"
```

触发 `scripts/auto-banner.js`：

- 按标题/slug 检索并下载到 `source/img/banners/我的新文章.jpg`；
- 自动在新文章 front‑matter 写入 `top_img` 与 `cover`。

## 总结

上面的代码如果不适用的话可以用 ai 修改一下，我不敢打包票一定成功，主要是提出这个方案，仅供参考。
