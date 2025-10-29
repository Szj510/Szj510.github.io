# Unsplash 自动题头图使用指南

## 📋 配置步骤

### 1. 获取 Unsplash API Key

1. 访问 https://unsplash.com/developers
2. 登录/注册账号
3. 点击 "Your apps" → "New Application"
4. 接受条款后填写应用信息：
   - Application name: `Hexo Blog Banner`
   - Description: `Auto-generate banners for blog posts`
5. 复制 **Access Key**

### 2. 配置 API Key

打开项目根目录下的 `.env` 文件，替换 `YOUR_ACCESS_KEY_HERE` 为你的实际密钥：

```env
UNSPLASH_ACCESS_KEY=你的_Access_Key_这里
```

⚠️ **重要**: `.env` 文件已加入 `.gitignore`，不会被提交到 Git，保护你的密钥安全。

---

## 🚀 使用方法

### 方式一：手动为文章添加题头图（推荐）

适合你直接复制 md 文件到 `_posts` 目录的使用习惯。

**步骤：**

1. 将 md 文件复制到 `source/_posts/` 目录
2. 撰写 front-matter（包括分类）
3. 在项目根目录执行：

```powershell
node tools/add-banner.js "文章名.md"
```

脚本会：

- 自动读取文章的 `categories` 字段
- 根据分类从 Unsplash 下载对应风格的图片
- 保存到 `source/img/banners/文章名.jpg`
- 在控制台显示需要添加的 `top_img` 路径

**示例：**

```powershell
# 自动检测文章分类
node tools/add-banner.js "dynamic programming.md"

# 或手动指定分类
node tools/add-banner.js "新文章.md" 算法
```

输出：

```
📂 从文章中检测到分类: 算法
📸 开始下载题头图...
   文章: dynamic programming.md
   分类: 算法
🔍 搜索关键词: algorithm,data structure,mathematics,abstract
📸 找到图片，作者: John Doe
✅ 题头图已保存: source\img\banners\dynamic programming.jpg

✅ 完成！请在文章 front-matter 中添加：
   top_img: /img/banners/dynamic programming.jpg
```

然后复制路径，在文章 front-matter 添加：

```yaml
---
title: 动态规划
categories: [算法]
top_img: /img/banners/dynamic programming.jpg
---
```

### 方式二：hexo new 自动添加（可选）

如果使用 `hexo new post` 创建文章，会自动下载题头图并添加到 front-matter。

```bash
hexo new post "文章标题"
```

脚本会：

1. 根据文章分类选择合适的搜索关键词
2. 从 Unsplash 下载高质量横向图片
3. 保存到 `source/img/banners/文章名.jpg`
4. 自动在文章 front-matter 添加 `top_img: /img/banners/xxx.jpg`

### 分类与关键词映射

| 分类             | Unsplash 搜索关键词                               |
| ---------------- | ------------------------------------------------- |
| 算法             | algorithm, data structure, mathematics, abstract  |
| 工具             | coding, development, programming, technology      |
| codewars         | puzzle, code, challenge, creative                 |
| cpp / C++        | modern, technology, abstract, minimal             |
| Missing Semester | terminal, command line, developer, minimal        |
| Rust             | system, performance, modern code, technology      |
| 默认             | landscape, nature, scenery, mountains（随机风景） |

💡 **自定义关键词**: 编辑 `scripts/auto-banner.js` 或 `tools/add-banner.js` 中的 `categoryKeywords` 对象。

---

## 📝 示例

### 为已有文章添加题头图

```powershell
# 已有文章 dynamic programming.md，分类为[算法]
node tools/add-banner.js "dynamic programming.md"
```

输出：

```
� 从文章中检测到分类: 算法
📸 开始下载题头图...
   文章: dynamic programming.md
   分类: 算法
🔍 搜索关键词: algorithm,data structure,mathematics,abstract
📸 找到图片，作者: Markus Spiske
   来源: https://unsplash.com/@markusspiske
✅ 题头图已保存: source\img\banners\dynamic programming.jpg

✅ 完成！请在文章 front-matter 中添加：
   top_img: /img/banners/dynamic programming.jpg
```

生成的文章 front-matter：

```yaml
---
title: Dijkstra算法详解
date: 2025-10-30 12:00:00
tags:
categories: 算法
top_img: /img/banners/dijkstra-算法详解.jpg
---
```

---

## 🔧 高级配置

### 修改图片尺寸

编辑 `tools/add-banner.js` 或 `scripts/auto-banner.js` 第 45 行（或搜索 `urls.regular`）：

```javascript
const imageUrl = searchRes.data.urls.regular; // 1080px 宽度

// 可选尺寸：
// .urls.full      - 原始尺寸
// .urls.regular   - 1080px (推荐)
// .urls.small     - 400px
// .urls.thumb     - 200px
```

### 批量为现有文章添加题头图

在项目根目录创建批处理脚本：

```powershell
# PowerShell 示例
$posts = Get-ChildItem "source\_posts\*.md"
foreach ($post in $posts) {
    node tools/add-banner.js $post.Name
    Start-Sleep -Seconds 2  # 避免 API 频率限制
}
```

---

## ⚠️ 注意事项

1. **API 限制**:

   - Demo 模式：每小时 50 次请求
   - 对个人博客完全够用

2. **网络要求**:

   - 需要能访问 Unsplash API（国内可能需要代理）
   - 如果下载失败，可稍后手动添加题头图

3. **版权**:
   - Unsplash 图片遵循 [Unsplash License](https://unsplash.com/license)
   - 可免费用于商业和非商业用途
   - 建议在文章中注明图片来源（脚本会在控制台显示作者）

---

## 🐛 故障排除

### API Key 无效

```
❌ API Key 无效，请检查 .env 文件中的 UNSPLASH_ACCESS_KEY
```

→ 确认 `.env` 文件中的密钥正确，且没有多余的空格或引号

### 网络超时

```
❌ 网络超时，请检查网络连接
```

→ 检查网络连接，或稍后重试

### 手动添加题头图

如果自动下载失败，可以：

1. 访问 https://unsplash.com/ 搜索并下载图片
2. 保存到 `source/img/banners/`
3. 手动在文章 front-matter 添加：
   ```yaml
   top_img: /img/banners/你的图片.jpg
   ```

---

## 📚 更多资源

- [Unsplash API 文档](https://unsplash.com/documentation)
- [Hexo 脚本文档](https://hexo.io/zh-cn/api/events.html)
- [Butterfly 主题文档](https://butterfly.js.org/)
