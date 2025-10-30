/**
 * 为已有文章补充 cover 字段（若缺失则复用 top_img）
 * 用法：node tools/backfill-cover.js
 */

const fs = require('fs');
const path = require('path');

function processPost(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 仅处理含有 front-matter 的 Markdown
  if (!/^---[\s\S]*?---/m.test(content)) return { changed: false };

  const hasTopImg = /(?:^|\r?\n)top_img\s*:\s*([^\r\n]+)/m.test(content);
  const hasCover = /(?:^|\r?\n)cover\s*:\s*([^\r\n]+)/m.test(content);

  if (!hasTopImg || hasCover) return { changed: false };

  // 取出 top_img 的值
  const topMatch = content.match(/(?:^|\r?\n)top_img\s*:\s*([^\r\n]+)/m);
  const imgPath = topMatch && topMatch[1] ? topMatch[1].trim() : null;
  if (!imgPath) return { changed: false };

  // 在 top_img 下一行插入 cover
  const newContent = content.replace(/((?:^|\r?\n)top_img\s*:\s*[^\r\n]+)/m, `$1\ncover: ${imgPath}`);
  fs.writeFileSync(filePath, newContent, 'utf8');
  return { changed: true };
}

function main() {
  const postsDir = path.join(process.cwd(), 'source', '_posts');
  const files = fs.readdirSync(postsDir).filter(f => f.toLowerCase().endsWith('.md'));

  let changedCount = 0;
  for (const f of files) {
    const p = path.join(postsDir, f);
    const { changed } = processPost(p);
    if (changed) {
      console.log(`✅ 已补充 cover: ${f}`);
      changedCount++;
    }
  }

  if (changedCount === 0) {
    console.log('没有需要补充 cover 的文章');
  } else {
    console.log(`完成：共补充 ${changedCount} 篇文章的 cover`);
  }
}

main();
