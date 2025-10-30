/**
 * 手动为文章添加题头图的工具脚本
 * 使用方法：node tools/add-banner.js 文章名.md [分类]
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 默认随机风景关键词（找不到匹配时退回）
const DEFAULT_QUERY = 'landscape,nature,scenery,mountains';

// 从文件名生成查询词
function buildQueryFromFilename(fileName) {
  // 去除扩展名并将连字符/下划线替换为空格
  const slug = fileName.replace(/\.[^.]+$/, '');
  const normalized = slug.replace(/[\-_]+/g, ' ').trim();
  // 将连续空格替换为逗号空格，提升匹配概率
  const query = normalized.replace(/\s+/g, ', ');
  return query || DEFAULT_QUERY;
}

/**
 * 从 Unsplash 下载图片
 */
async function downloadBanner(query, outputPath) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
    console.error('❌ 未配置 Unsplash API Key');
    console.error('请在 .env 文件中配置 UNSPLASH_ACCESS_KEY');
    return false;
  }

  async function fetchOnce(q) {
    console.log(`🔍 搜索关键词: ${q}`);
    const searchRes = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: q,
        orientation: 'landscape',
        client_id: accessKey
      },
      timeout: 10000
    });
    const imageUrl = searchRes.data.urls.regular;
    const author = searchRes.data.user.name;
    const authorUrl = searchRes.data.user.links.html;
    console.log(`📸 找到图片，作者: ${author}`);
    console.log(`   来源: ${authorUrl}`);
    const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
    fs.writeFileSync(outputPath, imageRes.data);
    console.log(`✅ 题头图已保存: ${outputPath}`);
    return true;
  }

  try {
    try {
      return await fetchOnce(query);
    } catch (e) {
      console.warn('⚠️ 按文件名检索未命中，改用默认随机风景图');
      return await fetchOnce(DEFAULT_QUERY);
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('❌ API Key 无效，请检查 .env 文件');
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ 网络超时');
    } else {
      console.error('❌ 下载失败:', error.message);
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
    console.log('使用方法：');
    console.log('  node tools/add-banner.js 文章名.md [自定义检索词]');
    console.log('');
    console.log('示例：');
    console.log('  node tools/add-banner.js "dynamic programming.md"');
    console.log('  node tools/add-banner.js "最大流.md" "maximum flow, graph"');
    process.exit(0);
  }

  const fileName = args[0];
  let customQuery = args.slice(1).join(' ').trim();
  
  // 构建文件路径
  const postPath = path.join(process.cwd(), 'source', '_posts', fileName);
  
  // 确定搜索关键词：优先使用自定义，其次用文件名构建
  const query = customQuery || buildQueryFromFilename(fileName);
  
  // 生成图片文件名
  const slug = path.basename(fileName, '.md');
  const bannerFileName = `${slug}.jpg`;
  const bannerPath = path.join(process.cwd(), 'source', 'img', 'banners', bannerFileName);
  
  // 确保目录存在
  const bannerDir = path.dirname(bannerPath);
  if (!fs.existsSync(bannerDir)) {
    fs.mkdirSync(bannerDir, { recursive: true });
  }

  console.log('\n📸 开始下载题头图...');
  console.log(`   文章: ${fileName}`);
  console.log(`   检索: ${query}`);
  
  const success = await downloadBanner(query, bannerPath);
  
  if (success) {
    const topImgPath = `/img/banners/${bannerFileName}`;

    // 尝试自动写入/替换 front-matter 的 top_img 与 cover（首页卡片用）
    try {
      let content = fs.readFileSync(postPath, 'utf8');
      if (/^---[\s\S]*?---/m.test(content)) {
        // 仅在 Front-matter 区域内修改，避免误改正文/代码块
        const openMatch = content.match(/^---\s*\r?\n/);
        const openIndex = openMatch ? 0 : content.indexOf('\n---\n');
        // 更严谨地查找关闭分隔符（从开头之后起算的第一个行首 ---）
        const fmOpen = content.search(/^---\s*\r?\n/m);
        if (fmOpen === -1) {
          throw new Error('Front-matter 起始分隔符未找到');
        }
        const rest = content.slice(fmOpen + content.match(/^---\s*\r?\n/m)[0].length);
        const closeRel = rest.search(/^---\s*\r?\n/m);
        if (closeRel === -1) {
          throw new Error('Front-matter 结束分隔符未找到');
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
          .replace(/^(?:top_img|top_image|cover)\s*:\s*.*\r?\n/gm, '');

        // 确保以换行结束，便于插入
        if (!/\r?\n$/.test(newFm)) newFm += '\n';

        // 插入新的字段（靠前位置便于查看）
        newFm = `top_img: ${topImgPath}\ncover: ${topImgPath}\n` + newFm;

        const newContent = before + newFm + after;
        fs.writeFileSync(postPath, newContent, 'utf8');
        console.log('\n✅ 已自动写入 front-matter:');
        console.log(`   top_img: ${topImgPath}`);
        console.log(`   cover:   ${topImgPath}`);
      } else {
        // 不含 front-matter，不主动写入，提示手动添加
        console.log('\n⚠️ 未检测到 front-matter，请手动在文件开头添加：');
        console.log('---');
        console.log(`top_img: ${topImgPath}`);
        console.log(`cover:   ${topImgPath}`);
        console.log('---');
      }
    } catch (e) {
      console.log('\n⚠️ 写入 front-matter 失败，请手动添加：');
      console.log(`   top_img: ${topImgPath}`);
      console.log(`   cover:   ${topImgPath}`);
    }
  } else {
    console.log('\n❌ 下载失败，请稍后重试或手动添加题头图\n');
    process.exit(1);
  }
}

main();
