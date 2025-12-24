const fs = require('fs');
const path = require('path');

const ROOT = './language-package';
const MAIN_LANG = 'en'; // 主语言目录

function readJSON(file) {
	try {
	  return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch (error) {
	  console.error(`解析 JSON 文件时出错：${file}`);
	  console.error(error.message);
	  process.exit(1); // 退出程序
	}
  }

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function sync() {
  const mainDir = path.join(ROOT, MAIN_LANG);
  const mainFile = fs.readdirSync(mainDir).find(f => f.endsWith('.json'));
  const mainPath = path.join(mainDir, mainFile);

  const mainJson = readJSON(mainPath);

  console.log(`主语言文件：${mainPath}`);

  const languages = fs.readdirSync(ROOT).filter(dir => dir !== MAIN_LANG);

  languages.forEach(lang => {
    const langDir = path.join(ROOT, lang);
    const langFile = fs.readdirSync(langDir).find(f => f.endsWith('.json'));
    const langPath = path.join(langDir, langFile);

    let langJson = readJSON(langPath);

    let updated = false;

    // 同步所有 key
    Object.keys(mainJson).forEach(key => {
      if (!langJson.hasOwnProperty(key)) {
        // 新增的 key
        langJson[key] = "";  // 或者复制中文： mainJson[key]
        updated = true;
        console.log(`[${lang}] 添加新 key: ${key}`);
      } else {
        // 如果你想覆盖更新 value，可改这里
        // langJson[key] = langJson[key] || mainJson[key];
      }
    });

    if (updated) {
      writeJSON(langPath, langJson);
      console.log(`已更新：${langPath}`);
    }
  });

  console.log("语言包同步完成！");
}

sync();
