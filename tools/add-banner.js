/**
 * 手动为文章添加题头图的工具脚本
 * 使用方法：node tools/add-banner.js 文章名.md [分类]
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 分类到搜索关键词的映射
const categoryKeywords = {
  '算法': 'algorithm,data structure,mathematics,abstract',
  '工具': 'coding,development,programming,technology',
  'codewars': 'puzzle,code,challenge,creative',
  'cpp': 'modern,technology,abstract,minimal',
  'C++': 'modern,technology,abstract,minimal',
  'Missing Semester': 'terminal,command line,developer,minimal',
  'Rust': 'system,performance,modern code,technology',
  '默认': 'landscape,nature,scenery,mountains'
};

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

  try {
    console.log(`🔍 搜索关键词: ${query}`);
    
    // 随机获取一张图片
    const searchRes = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: query,
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
    
    // 下载图片
    const imageRes = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000
    });

    fs.writeFileSync(outputPath, imageRes.data);
    console.log(`✅ 题头图已保存: ${outputPath}`);
    
    return true;
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
function getCategoryFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/categories:\s*\[?([^\]|\n]+)\]?/);
    if (match) {
      return match[1].trim();
    }
  } catch (err) {
    // 文件可能还不存在或格式不对
  }
  return null;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方法：');
    console.log('  node tools/add-banner.js 文章名.md [分类]');
    console.log('');
    console.log('示例：');
    console.log('  node tools/add-banner.js "dynamic programming.md"');
    console.log('  node tools/add-banner.js "新文章.md" 算法');
    console.log('');
    console.log('支持的分类：');
    Object.keys(categoryKeywords).forEach(cat => {
      console.log(`  - ${cat}: ${categoryKeywords[cat]}`);
    });
    process.exit(0);
  }

  const fileName = args[0];
  let category = args[1];
  
  // 构建文件路径
  const postPath = path.join(process.cwd(), 'source', '_posts', fileName);
  
  // 如果没有指定分类，尝试从文件中读取
  if (!category) {
    category = getCategoryFromFile(postPath);
    if (category) {
      console.log(`📂 从文章中检测到分类: ${category}`);
    } else {
      category = '默认';
      console.log(`📂 未指定分类，使用默认（随机风景图）`);
    }
  }

  // 确定搜索关键词
  const query = categoryKeywords[category] || categoryKeywords['默认'];
  
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
  console.log(`   分类: ${category}`);
  
  const success = await downloadBanner(query, bannerPath);
  
  if (success) {
    const topImgPath = `/img/banners/${bannerFileName}`;
    console.log('\n✅ 完成！请在文章 front-matter 中添加：');
    console.log(`   top_img: ${topImgPath}`);
    console.log('');
  } else {
    console.log('\n❌ 下载失败，请稍后重试或手动添加题头图\n');
    process.exit(1);
  }
}

main();
