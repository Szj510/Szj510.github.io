/**
 * Hexo 自动题头图生成脚本
 * 使用 Unsplash API 根据文章分类自动下载相关图片作为题头图
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 分类到搜索关键词的映射（根据现有文章分类定制）
const categoryKeywords = {
  '算法': 'algorithm,data structure,mathematics,abstract',
  '工具': 'coding,development,programming,technology',
  'codewars': 'puzzle,code,challenge,creative',
  'cpp': 'modern,technology,abstract,minimal',
  'C++': 'modern,technology,abstract,minimal',
  'Missing Semester': 'terminal,command line,developer,minimal',
  'Rust': 'system,performance,modern code,technology',
  '默认': 'landscape,nature,scenery,mountains'  // 随机风景图
};

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

  try {
    // 1. 随机获取一张图片信息
    const searchRes = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: query,
        orientation: 'landscape', // 横向图片
        client_id: accessKey
      },
      timeout: 10000
    });

    const imageUrl = searchRes.data.urls.regular; // 1080px 宽度
    
    // 2. 下载图片
    const imageRes = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000
    });

    // 3. 保存到本地
    fs.writeFileSync(outputPath, imageRes.data);
    
    console.log(`✅ 题头图已保存: ${path.basename(outputPath)}`);
    console.log(`   来源: ${searchRes.data.user.name} on Unsplash`);
    
    return true;
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
  // 获取文章分类（从 scaffolds 模板或命令行参数）
  const category = data.category || data.categories || '默认';
  const categoryStr = Array.isArray(category) ? category[0] : category;
  
  // 确定搜索关键词
  const query = categoryKeywords[categoryStr] || categoryKeywords['默认'];
  
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
  console.log(`   分类: ${categoryStr}`);
  console.log(`   关键词: ${query}`);
  
  const success = await downloadBanner(query, bannerPath);
  
  if (success) {
    // 在文章 front-matter 中添加题头图路径
    const topImgPath = `/img/banners/${bannerFileName}`;
    console.log(`   路径: ${topImgPath}\n`);
    
    // 读取并修改文章内容
    try {
      let content = fs.readFileSync(data.path, 'utf8');
      
      // 在 front-matter 中插入 top_img
      if (content.startsWith('---')) {
        content = content.replace(
          /---\n/,
          `---\ntop_img: ${topImgPath}\n`
        );
        fs.writeFileSync(data.path, content);
        console.log('✅ 已自动添加 top_img 到文章 front-matter\n');
      }
    } catch (err) {
      console.warn('⚠️  无法自动修改文章，请手动添加 top_img:', topImgPath);
    }
  } else {
    console.log('💡 提示: 你可以稍后手动下载或使用默认题头图\n');
  }
});

// 导出函数供手动使用
module.exports = {
  downloadBanner,
  categoryKeywords
};
