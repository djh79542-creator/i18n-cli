# 语言包翻译管理工具（i18n-cli）

用于管理 `language-package` 下多语言 JSON 的 **Web 图形界面**，并配套 **命令行同步、导出与批量合并**。新增或变更文案的**实际翻译**由团队在 **Cursor / 其他 AI** 中按项目内协议完成，**不再内置机器翻译 API**。

## 功能概览

- **可视化浏览与编辑**：查看各语言键值、在线修改、搜索过滤、未保存提醒。
- **键结构同步**：「同步所有语言」与 `npm run translate` 仅对齐 **key**（英文主语言为源：其它语言缺少的 key 补空字符串，主语言已删除的 key 从其它语言移除），**不自动填充译文**。
- **ZIP 导出**：单个语言 JSON 或整包 `language-package` 压缩下载。
- **AI 翻译工作流（推荐）**：仓库内含 Cursor Skill 与可拷贝到其他模型的 `reference-protocol.md`，字数与风格约束写在**对话提示词**里即可。
- **可选脚本**：导出待译列表、合并英文草稿、应用批量译文 JSON。

## 快速开始

### 环境

- Node.js 18+（本地运行）
- 可选：Docker 20.10+、Docker Compose 2.0+

### 本地运行

```bash
npm install
npm start
```

默认监听 **`http://localhost:7777`**（可通过环境变量 `PORT` 覆盖）。浏览器打开：

`http://localhost:7777/translation-gui.html`

局域网访问时，控制台会打印本机 IP 与相同端口。

### Docker

```bash
docker-compose up -d
```

镜像内默认 **`PORT=3000`**，访问 `http://localhost:3000/translation-gui.html`。

Windows 可运行仓库根目录下的 `deploy.bat`；Linux/macOS 可使用 `deploy.sh`（需可执行权限）。

## 推荐工作流：英文主语言 + AI 全语言

1. 在 **`language-package/en/`** 下维护主文案（业务 JSON 文件名形如 `en_英语.json`，不以 `i18n-` 开头）。
2. 在 GUI 点击 **「同步所有语言」**，或运行 `npm run i18n:sync-keys` / `npm run translate`，使其它语言的 key 与英文一致。
3. 在 **Cursor** 中说明要翻译的 key、目标语言范围、以及字数等要求；Agent 遵循  
   **`.cursor/skills/i18n-ai-translate/SKILL.md`** 与 **`reference-protocol.md`**（阶段 0～6），直接写回各语言 JSON。  
   若需在其他产品中复现，可复制 `SKILL.md` 中的 **「§ 最小系统提示」**Block。
4. （可选）`npm run i18n:queue` 导出待译英文草稿；`npm run i18n:apply -- ./batch.json` 应用模型给出的合并 JSON。

长度与语气**只通过提示词约定**，仓库不维护 `i18n-length-rules.json`。

## 命令行脚本

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Web 服务 |
| `npm run translate` | 与下条相同，对齐全语言 key |
| `npm run i18n:sync-keys` | 同上 |
| `npm run i18n:queue` | 导出待译 key + 英文（伪 JSON 列表） |
| `npm run i18n:apply -- <file>` | 将批量 JSON 写入各语言文件 |

`i18n-ai-queue.js` 支持 `--lang=`、`--out=`、`--only-keys=`、`--merge-en=` 等参数，详见文件头部注释。

## 项目结构（节选）

```
├── language-package/          # 各语言 JSON（en 为主语言目录）
├── lib/
│   ├── i18n-utils.js
│   └── i18n-sync-structural.js
├── .cursor/
│   ├── rules/i18n-ai-auto.mdc
│   └── skills/i18n-ai-translate/
│       ├── SKILL.md
│       └── reference-protocol.md
├── server.js                  # Express API + 静态资源
├── translation-gui.html
├── translation-gui.js
├── translate-json.js          # CLI：仅结构同步
├── i18n-ai-queue.js
├── apply-i18n-batch.js
└── package.json
```

## Web 界面操作要点

1. 左侧选择语言包，右侧编辑表格中的译文。
2. **保存当前语言**：按钮或 Ctrl+S。
3. **同步所有语言**：只更新 **key 结构**，新 key 在其它语言中为 `""`，需再通过 AI 或手工补全译文。
4. **导出**：当前语言 JSON，或全部语言 ZIP。

## HTTP API

- `GET /api/languages` — 获取所有语言包
- `PUT /api/languages/:langCode` — 保存指定语言 JSON 正文
- `POST /api/sync-languages` — 与 CLI 相同的 **key 结构同步**（非机器翻译）
- `GET /api/export-all` — 下载 `language-package` 的 ZIP

## 配置说明

- **主语言**：在 `server.js` 与 `lib/i18n-utils.js` 中均为 `en`，如需更换须两处一致并自行核对路径约定。
- **端口**：本地默认 `7777`；Docker / `PORT` 环境变量可改为 `3000` 等。

## 支持的语言

当前 `language-package` 下包含多种语言目录（如英语、简体中文、日语、韩语及欧洲主要语言等），与目录名一致；具体以仓库内子目录为准。

## 开发与定制

- 前端：`translation-gui.html`、`translation-gui.js`
- 同步与导出逻辑：`server.js`、`lib/i18n-sync-structural.js`
- AI 行为约束：`.cursor/skills/i18n-ai-translate/`（勿删除 `reference-protocol.md` 若需跨工具复用）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 与 Pull Request。
