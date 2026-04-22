const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'language-package');
const MAIN_LANG = 'en';
const RULES_FILENAME = 'i18n-length-rules.json';

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`解析 JSON 失败：${file}`);
    console.error(error.message);
    process.exit(1);
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function getMainDir() {
  return path.join(ROOT, MAIN_LANG);
}

function findLocaleJsonInDir(dir) {
  const files = fs.readdirSync(dir).filter(
    (f) =>
      f.endsWith('.json') &&
      !f.startsWith('i18n-') &&
      f !== RULES_FILENAME
  );
  if (!files.length) {
    throw new Error(`未找到语言 JSON：${dir}`);
  }
  return path.join(dir, files[0]);
}

function getMainJsonPath() {
  return findLocaleJsonInDir(getMainDir());
}

function getRulesPath() {
  return path.join(getMainDir(), RULES_FILENAME);
}

function loadRules() {
  const p = getRulesPath();
  if (!fs.existsSync(p)) {
    return {};
  }
  return readJSON(p);
}

function getLangJsonPath(langCode) {
  const dir = path.join(ROOT, langCode);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`语言目录不存在：${dir}`);
  }
  return findLocaleJsonInDir(dir);
}

function isPendingValue(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

/** `language-package` 下除主语言外、且存在合法语言 JSON 的目录名，字典序 */
function listTargetLanguageCodes() {
  if (!fs.existsSync(ROOT)) {
    return [];
  }
  return fs
    .readdirSync(ROOT)
    .filter(
      (dir) =>
        dir !== MAIN_LANG &&
        fs.statSync(path.join(ROOT, dir)).isDirectory()
    )
    .filter((dir) => {
      try {
        getLangJsonPath(dir);
        return true;
      } catch {
        return false;
      }
    })
    .sort();
}

module.exports = {
  ROOT,
  MAIN_LANG,
  RULES_FILENAME,
  readJSON,
  writeJSON,
  getMainDir,
  getMainJsonPath,
  getRulesPath,
  loadRules,
  getLangJsonPath,
  isPendingValue,
  listTargetLanguageCodes,
};
