const { syncStructural } = require('./lib/i18n-sync-structural');

const { mainPath, updatedFileCount, results } = syncStructural();

console.log(`主语言文件：${mainPath}`);
results.forEach((line) => console.log(line));
console.log(
  updatedFileCount > 0
    ? `已更新 ${updatedFileCount} 个语言包文件。`
    : '无需写入（结构已一致）。'
);
console.log(
  '多语言译文：由 Cursor 按 .cursor/skills/i18n-ai-translate/SKILL.md 直接写库；可选 node i18n-ai-queue.js 导出草稿。'
);
console.log('语言包 key 同步完成。');
