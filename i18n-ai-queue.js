/**
 * 导出待 AI 翻译的英文模板（含 key、主文案、可选长度规则）。
 * 用法：
 *   node i18n-ai-queue.js
 *   node i18n-ai-queue.js --lang=zh
 *   node i18n-ai-queue.js --out=pending.txt
 *   node i18n-ai-queue.js --only-keys=foo,bar
 *   node i18n-ai-queue.js --merge-en=./new-en-strings.json --out=prompt.txt
 *
 * --merge-en：将 JSON 对象合并进英文主语言包并结构同步，再仅就这些 key 导出模板（适合「只带英文键值」）。
 */
const fs = require('fs');
const path = require('path');
const {
  readJSON,
  writeJSON,
  getMainJsonPath,
  getLangJsonPath,
  loadRules,
  isPendingValue,
  listTargetLanguageCodes,
} = require('./lib/i18n-utils');
const { syncStructural } = require('./lib/i18n-sync-structural');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    lang: null,
    out: null,
    mergeEn: null,
    onlyKeys: null,
  };
  for (const a of args) {
    if (a.startsWith('--lang=')) opts.lang = a.slice('--lang='.length);
    else if (a.startsWith('--out=')) opts.out = a.slice('--out='.length);
    else if (a.startsWith('--merge-en=')) opts.mergeEn = a.slice('--merge-en='.length);
    else if (a.startsWith('--only-keys=')) opts.onlyKeys = a.slice('--only-keys='.length);
  }
  return opts;
}

function needsTranslation(langJson, key) {
  if (!Object.prototype.hasOwnProperty.call(langJson, key)) return true;
  return isPendingValue(langJson[key]);
}

function collectPendingKeySet(filterLang) {
  const mainJson = readJSON(getMainJsonPath());
  const mainKeys = Object.keys(mainJson);

  const langs = listTargetLanguageCodes();

  const keySet = new Set();

  for (const lang of langs) {
    if (filterLang && lang !== filterLang) continue;
    let langJson;
    try {
      langJson = readJSON(getLangJsonPath(lang));
    } catch {
      continue;
    }
    for (const key of mainKeys) {
      if (needsTranslation(langJson, key)) keySet.add(key);
    }
  }

  return { mainJson, keys: [...keySet].sort() };
}

function mergeEnKeys(mergePath) {
  const abs = path.resolve(mergePath);
  if (!fs.existsSync(abs)) {
    console.error(`文件不存在：${abs}`);
    process.exit(1);
  }
  const partial = readJSON(abs);
  if (typeof partial !== 'object' || partial === null || Array.isArray(partial)) {
    console.error('--merge-en 文件须为 JSON 对象（键为 i18n key，值为英文字符串）');
    process.exit(1);
  }
  const mainPath = getMainJsonPath();
  const mainJson = readJSON(mainPath);
  for (const [k, v] of Object.entries(partial)) {
    mainJson[k] = v;
  }
  writeJSON(mainPath, mainJson);
  const keys = Object.keys(partial).sort();
  syncStructural();
  return { mainJson, keys };
}

function resolveKeysFromOnlyKeys(onlyKeysStr) {
  const requested = onlyKeysStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const mainJson = readJSON(getMainJsonPath());
  const keys = [];
  const missing = [];
  for (const k of requested) {
    if (Object.prototype.hasOwnProperty.call(mainJson, k)) keys.push(k);
    else missing.push(k);
  }
  for (const k of missing) {
    console.warn(`略过未知 key（主语言中不存在）：${k}`);
  }
  keys.sort();
  return { mainJson, keys };
}

function formatBlock(mainJson, rules, keys) {
  const lines = ['{'];
  for (const key of keys) {
    const raw = mainJson[key];
    const valueStr = raw === undefined ? '' : JSON.stringify(String(raw));
    const rule = rules[key];
    const suffix = rule != null && rule !== '' ? `,${rule}` : ',';
    lines.push(`  ${JSON.stringify(key)}: ${valueStr}${suffix}`);
  }
  lines.push('}');
  return lines.join('\n');
}

function buildHeader({ keysLength, lang, mergeEn, allTargets }) {
  const lines = [
    `// 待翻译条目：${keysLength} 个 key`,
  ];
  if (lang != null) {
    lines.push(
      `// 筛选：仅在「${lang}」中为空的 key（输出 batch 时顶层只需包含 "${lang}" 键）`
    );
  } else {
    lines.push(
      `// 全语言：请在同一份 batch JSON 中为下列每一种语言各写完整对象（顶层键须与列表一致、缺一不可）：`
    );
    lines.push(`// ${allTargets.join(', ')}`);
  }
  if (mergeEn) {
    lines.push(`// 说明：已通过 --merge-en 写入英文主语言包并完成 key 结构同步。`);
  }
  lines.push(
    '// 规则后缀：单个数字 = 该 key 在各语言译文中均不得超过的字符数；min-max = 各语言译文长度区间。字符数按 JavaScript .length 计。'
  );
  lines.push(
    '// 将本块交给 Cursor（i18n-ai-translate skill）生成合法 JSON，再用 apply-i18n-batch.js 合并。'
  );
  lines.push('');
  return lines.join('\n');
}

function main() {
  const { lang, out, mergeEn, onlyKeys } = parseArgs();
  const rules = loadRules();
  const allTargets = listTargetLanguageCodes();

  let mainJson;
  let keys;

  if (mergeEn && onlyKeys) {
    console.error('请勿同时使用 --merge-en 与 --only-keys');
    process.exit(1);
  }

  if (mergeEn) {
    const merged = mergeEnKeys(mergeEn);
    mainJson = merged.mainJson;
    keys = merged.keys;
  } else if (onlyKeys) {
    const r = resolveKeysFromOnlyKeys(onlyKeys);
    mainJson = r.mainJson;
    keys = r.keys;
    if (keys.length === 0) {
      console.error('没有可导出的 key（请检查主语言包是否包含这些键）');
      process.exit(1);
    }
  } else {
    const c = collectPendingKeySet(lang);
    mainJson = c.mainJson;
    keys = c.keys;
    if (keys.length === 0) {
      const msg =
        lang != null
          ? `没有待翻译条目（语言：${lang}，均已填写）。`
          : '没有待翻译条目（各语言均已填写）。';
      console.log(msg);
      process.exit(0);
    }
  }

  const block = formatBlock(mainJson, rules, keys);
  const header = buildHeader({
    keysLength: keys.length,
    lang,
    mergeEn: Boolean(mergeEn),
    allTargets,
  });

  const text = `${header}${block}\n`;

  if (out) {
    const target = path.resolve(out);
    fs.writeFileSync(target, text, 'utf8');
    console.log(`已写入 ${target}`);
  } else {
    process.stdout.write(text);
  }
}

main();
