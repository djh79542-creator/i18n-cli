// 清除注释，格式化json


const fs = require('fs');
const path = require('path');

// JSON 文件根目录
const rootDir = path.join(__dirname, 'language-package');

// 递归处理目录中的所有 JSON 文件
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // 如果是子目录，递归处理
      processDirectory(itemPath);
    } else if (stats.isFile() && item.endsWith('.json')) {
      // 如果是 JSON 文件，移除注释
      let jsonContent = fs.readFileSync(itemPath, 'utf8');

	   // 删除最后一行的逗号
	   jsonContent = jsonContent.replace(/,(\s*})/g, '$1');

	   // 删除花括号后的分号
	   jsonContent = jsonContent.replace(/}\s*;/g, '}');

      // 使用正则表达式移除注释
      jsonContent = jsonContent.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

      // 写回文件
      fs.writeFileSync(itemPath, jsonContent, 'utf8');

      console.log(`已移除文件 ${itemPath} 中的所有注释！`);
    }
  });
}

// 开始处理根目录
processDirectory(rootDir);

console.log('所有 JSON 文件的注释已成功移除！');