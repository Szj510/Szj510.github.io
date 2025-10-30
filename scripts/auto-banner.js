/**
 * Hexo 自动题头图生成脚本
 * 使用 Unsplash API 根据文章分类自动下载相关图片作为题头图
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 改为按标题/文件名检索；若未命中则退回默认风景
const DEFAULT_QUERY = 'landscape,nature,scenery,mountains';

function buildQueryFromTitleOrSlug(title, slug) {
  const base = (title && title.trim()) || (slug && slug.trim()) || '';
  const normalized = base.replace(/[\-_]+/g, ' ').replace(/\s+/g, ', ').trim();
  return normalized || DEFAULT_QUERY;
}

/**
 * 从 Unsplash 下载图片
 * @param {string} query - 搜索关键词
 * @param {string} outputPath - 输出路径
 */
async function downloadBanner(query, outputPath) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
    console.warn('⚠️  未配置 Unsplash API Key，跳过题头图下载');
    console.warn('请在 .env 文件中配置 UNSPLASH_ACCESS_KEY');
    return false;
  }

  async function fetchOnce(q) {
    console.log(`🔍 搜索关键词: ${q}`);
    const searchRes = await axios.get('https://api.unsplash.com/photos/random', {
      params: { query: q, orientation: 'landscape', client_id: accessKey },
      timeout: 10000
    });
    const imageUrl = searchRes.data.urls.regular; // 1080px 宽度
    const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
    fs.writeFileSync(outputPath, imageRes.data);
    console.log(`✅ 题头图已保存: ${path.basename(outputPath)}`);
    console.log(`   来源: ${searchRes.data.user.name} on Unsplash`);
    return true;
  }

  try {
    try {
      return await fetchOnce(query);
    } catch (e) {
      console.warn('⚠️ 按标题/文件名检索未命中，改用默认随机风景图');
      return await fetchOnce(DEFAULT_QUERY);
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('❌ API Key 无效，请检查 .env 文件中的 UNSPLASH_ACCESS_KEY');
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ 网络超时，请检查网络连接');
    } else {
      console.error('❌ 下载题头图失败:', error.message);
    }
    return false;
  }
}

/**
 * Hexo 新建文章时的钩子
 */
hexo.on('new', async function(data) {
  // 使用标题或 slug 构建检索词
  const query = buildQueryFromTitleOrSlug(data.title, data.slug);
  
  // 生成文件名
  const slug = data.slug || path.basename(data.path, '.md');
  const bannerFileName = `${slug}.jpg`;
  const bannerPath = path.join(hexo.source_dir, 'img', 'banners', bannerFileName);
  
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
      let content = fs.readFileSync(data.path, 'utf8');
      // 在 front-matter 中插入/替换 top_img 与 cover（首页卡片使用 cover）
      if (/^---[\s\S]*?---/m.test(content)) {
        // 已有 front-matter：处理 top_img
        if (/(?:^|\r?\n)top_img\s*:/m.test(content)) {
          content = content.replace(/(?:^|\r?\n)top_img\s*:\s*.*/m, `\ntop_img: ${topImgPath}`);
        } else {
          content = content.replace(/---\s*\r?\n/, `---\n` + `top_img: ${topImgPath}\n`);
        }

        // 处理 cover（用于首页卡片）
        if (/(?:^|\r?\n)cover\s*:/m.test(content)) {
          content = content.replace(/(?:^|\r?\n)cover\s*:\s*.*/m, `\ncover: ${topImgPath}`);
        } else {
          content = content.replace(/---\s*\r?\n/, `---\n` + `cover: ${topImgPath}\n`);
        }

        fs.writeFileSync(data.path, content, 'utf8');
        console.log('✅ 已自动更新 front-matter: top_img 与 cover\n');
      }
    } catch (err) {
      console.warn('⚠️  无法自动修改文章，请手动添加以下字段到 front-matter:');
      console.warn(`   top_img: ${topImgPath}`);
      console.warn(`   cover:   ${topImgPath}`);
    }
  } else {
    console.log('💡 提示: 你可以稍后手动下载或使用默认题头图\n');
  }
});

// 导出函数供手动使用
module.exports = {
  downloadBanner
};
