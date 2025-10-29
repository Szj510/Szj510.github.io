# 题头图快速使用指南

## 🚀 一键使用（推荐）

### 1. 为已有文章添加题头图

```powershell
# 自动检测分类
node tools/add-banner.js "文章名.md"

# 手动指定分类
node tools/add-banner.js "文章名.md" 算法
```

### 2. 复制输出的路径

脚本会输出：

```
✅ 完成！请在文章 front-matter 中添加：
   top_img: /img/banners/文章名.jpg
```

### 3. 添加到文章

在文章 front-matter 中粘贴：

```yaml
---
title: 文章标题
categories: [算法]
top_img: /img/banners/文章名.jpg  ← 粘贴这里
---
```

---

## 📋 支持的分类

| 分类             | 图片风格                     |
| ---------------- | ---------------------------- |
| 算法             | 算法、数据结构、数学、抽象图 |
| 工具             | 代码、开发、编程、科技       |
| codewars         | 拼图、代码、挑战、创意       |
| cpp / C++        | 现代、科技、抽象、简约       |
| Missing Semester | 终端、命令行、开发、简约     |
| Rust             | 系统、性能、现代代码         |
| 默认             | **随机风景图**（山、自然）   |

---

## 💡 小技巧

### 批量处理多篇文章

```powershell
# 为所有文章添加题头图
node tools/add-banner.js "最大流.md"
node tools/add-banner.js "Kmp算法.md"
node tools/add-banner.js "单源最短路径.md"
```

### 不满意？重新下载

直接再运行一次，会覆盖原图片（随机获取新图片）：

```powershell
node tools/add-banner.js "文章名.md"
```

---

## 🔧 故障排除

### 问题：网络超时

→ 检查网络连接或稍后重试

### 问题：API Key 无效

→ 确认 `.env` 文件中的 `UNSPLASH_ACCESS_KEY` 正确

### 问题：未检测到分类

→ 脚本会使用"默认"分类（随机风景图）

---

详细文档见 `UNSPLASH_GUIDE.md`
