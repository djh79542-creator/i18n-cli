# i18n-cli — AI 驱动的多语言翻译工具

管理 `language-package` 下多语言 JSON 的**命令行工具**。翻译由 **Cursor / Claude / 其他 AI** 按项目内协议完成，不内置机器翻译 API。

## 功能

- **键结构同步**：以英文（`en`）为主语言，自动对齐所有语言的 key（缺少补空串，多余删除）
- **待译模板导出**：扫描空值 key，输出英文原文供 AI 翻译
- **批量合并**：将 AI 生成的翻译 JSON 一键写入各语言文件
- **AI 翻译协议**：内置 Cursor Skill 和可复用的 `reference-protocol.md`

## 快速开始

```bash
# 无需安装依赖，纯 Node.js 标准库
npm run i18n:sync-keys    # 同步 key 结构
npm run i18n:queue        # 导出待翻译模板
npm run i18n:apply -- ./batch.json  # 合并 AI 翻译结果
```

## 推荐工作流

1. 在 `language-package/en/` 下维护英文主文案
2. 运行 `npm run i18n:sync-keys` 对齐所有语言的 key 结构
3. 在 AI 工具中翻译：
   - **Cursor**：Agent 自动遵循 `.cursor/skills/i18n-ai-translate/SKILL.md` 协议，直接写回各语言 JSON
   - **其他 AI**：复制 `reference-protocol.md` 中的系统提示，让模型输出 batch JSON
4. 如使用 batch 模式：`npm run i18n:apply -- ./batch.json` 合并结果

## CLI 命令

| 命令 | 说明 |
|------|------|
| `npm run i18n:sync-keys` | 对齐全语言 key 结构（别名 `npm run translate`） |
| `npm run i18n:queue` | 导出待译 key + 英文原文 |
| `npm run i18n:apply -- <file>` | 将批量翻译 JSON 写入各语言文件 |

### i18n:queue 参数

| 参数 | 说明 |
|------|------|
| `--lang=zh` | 仅导出指定语言的空值 key |
| `--out=pending.txt` | 输出到文件（默认 stdout） |
| `--merge-en=./new.json` | 先合并新 key 到英文主包，再导出 |
| `--only-keys=foo,bar` | 仅导出指定 key |

## 项目结构

```
├── language-package/          # 各语言 JSON（en 为主语言）
├── lib/
│   ├── i18n-utils.js          # 共享工具函数
│   └── i18n-sync-structural.js # key 结构同步逻辑
├── .cursor/
│   ├── rules/i18n-ai-auto.mdc
│   └── skills/i18n-ai-translate/
│       ├── SKILL.md            # Cursor Skill 协议
│       └── reference-protocol.md # 可复用的 AI 翻译协议
├── translate-json.js          # CLI：结构同步入口
├── i18n-ai-queue.js           # CLI：导出待译模板
├── apply-i18n-batch.js        # CLI：合并批量翻译
└── package.json
```

## 支持的语言

当前 `language-package` 下包含 32 种语言，以目录名为准（ar, bg, cs, da, de, el, en, es, et, fi, fr, he, hr, hu, is, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, tr, uk, zh）。

## 许可证

MIT
