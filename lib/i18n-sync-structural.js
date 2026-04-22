const fs = require('fs');
const path = require('path');
const {
  ROOT,
  MAIN_LANG,
  readJSON,
  writeJSON,
  getMainJsonPath,
  getLangJsonPath,
} = require('./i18n-utils');

/**
 * 仅同步 key 结构：新增 key 填空字符串，删除主语言中不存在的 key。不调用机器翻译 API。
 */
function syncStructural() {
  const mainPath = getMainJsonPath();
  const mainJson = readJSON(mainPath);

  const results = [];
  let updatedFileCount = 0;

  const languages = fs
    .readdirSync(ROOT)
    .filter(
      (dir) =>
        dir !== MAIN_LANG &&
        fs.statSync(path.join(ROOT, dir)).isDirectory()
    );

  for (const lang of languages) {
    let langPath;
    try {
      langPath = getLangJsonPath(lang);
    } catch {
      continue;
    }

    const langJson = readJSON(langPath);
    let updated = false;

    for (const key of Object.keys(mainJson)) {
      if (!Object.prototype.hasOwnProperty.call(langJson, key)) {
        langJson[key] = '';
        updated = true;
        results.push(`[${lang}] 添加新 key: ${key}`);
      }
    }

    for (const key of Object.keys(langJson)) {
      if (!Object.prototype.hasOwnProperty.call(mainJson, key)) {
        delete langJson[key];
        updated = true;
        results.push(`[${lang}] 删除多余 key: ${key}`);
      }
    }

    if (updated) {
      writeJSON(langPath, langJson);
      updatedFileCount++;
      results.push(`已写入：${langPath}`);
    }
  }

  return {
    mainPath,
    updatedFileCount,
    results,
  };
}

module.exports = { syncStructural };
