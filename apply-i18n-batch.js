/**
 * 将 AI 输出的批量译文合并进 language-package。
 * 文件格式示例：
 * {
 *   "zh": { "newKey": "译文" },
 *   "de": { "newKey": "..." }
 * }
 * 语言代码为目录名（与 language-package/zh 一致）。
 *
 * 用法：node apply-i18n-batch.js ./translations-batch.json
 */
const path = require('path');
const {
  MAIN_LANG,
  readJSON,
  writeJSON,
  getMainJsonPath,
  getLangJsonPath,
} = require('./lib/i18n-utils');

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('用法: node apply-i18n-batch.js <batch.json>');
    process.exit(1);
  }

  const batchPath = path.resolve(file);
  const batch = readJSON(batchPath);
  const mainJson = readJSON(getMainJsonPath());
  const mainKeys = new Set(Object.keys(mainJson));

  for (const [lang, map] of Object.entries(batch)) {
    if (lang === MAIN_LANG || typeof map !== 'object' || map === null) {
      continue;
    }

    const langPath = getLangJsonPath(lang);
    const langJson = readJSON(langPath);

    for (const [k, v] of Object.entries(map)) {
      if (!mainKeys.has(k)) {
        console.warn(`[${lang}] 忽略未知 key: ${k}`);
        continue;
      }
      langJson[k] = v;
    }

    writeJSON(langPath, langJson);
    console.log(`已更新 ${langPath}`);
  }

  console.log('合并完成。');
}

main();
