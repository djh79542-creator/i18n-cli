---
name: i18n-ai-translate
description: >-
  在 i18n-cli 仓库中根据英文主语言与长度规则，全自动或半自动完成全语言翻译。用户给出英文键值、
  修改 language-package、或要求同步多语言时使用。默认模式：Agent 直接读写各语言 JSON，用户无需
  手动运行任何 npm/node 脚本；可选用 i18n-ai-queue / apply-i18n-batch 作离线条。须遵守占位符与
  i18n-length-rules.json 中的字符数约束；除 en 外全部语言目录须在同一轮任务中补全。
---

# i18n AI 翻译（language-package）

## 全自动模式（默认，用户无需运行脚本）

本仓库已配置 `.cursor/rules/i18n-ai-auto.mdc`：**不要**让用户去跑队列/合并脚本；由 Agent 用工具完成闭环。

### 执行步骤（由上至下）

1. **读主语言**  
   打开 `language-package/en/` 下唯一的业务语言 JSON（文件名形如 `en_英语.json`，**不要**把 `i18n-length-rules.json` 当成主文案）。  
   读 `language-package/en/i18n-length-rules.json` 获取每个 key 的长度规则（`"20"` = 各语言译文均 ≤20；`"10-20"` = 长度区间；未列出的 key 无硬性数字约束）。

2. **合并用户给的英文**  
   若用户粘贴或描述了新的英文键值：把相同 key 写入主语言 JSON（值用合法 JSON 字符串；保留/合并占位符如 `{name}`）。

3. **结构对齐（可选但推荐）**  
   在项目根目录由 Agent 执行一次：  
   `npm run i18n:sync-keys`  
   这只会给其它语言补上缺失的 key（值为 `""`）并删掉主语言里已移除的多余 key，**不调用翻译 API**。用户无需操作。

4. **枚举目标语言**  
   `language-package` 下除 `en` 外的每个子目录（且目录内存在业务 JSON）即一种目标语言；顶层目录名就是 batch/写入时用的语言代码（如 `zh`、`ja`、`de`）。

5. **翻译并写回**  
   对**每一种**目标语言打开对应 JSON，对当前任务涉及的每个 key 填入译文（或填入用户本次新增/变更 key 的译文；若用户要求「全量重译」则逐 key 处理）。  
   - 保证各文件 key 集合最终与英文主文件一致（上一步已对齐则更省事）。  
   - 遵守 `i18n-length-rules.json`；占位符逐字保留；品牌名/大小写按产品惯例。

6. **格式**  
   写回时维持各文件**现有**的缩进风格（多为 `\t` 或两个空格——以该文件当前为准），并保证 JSON 合法。

### 禁止与例外

- **禁止**在默认流程里把「请运行 `npm run i18n:queue` / `node apply-i18n-batch.js`」当作唯一交付；除非用户明确说「我只要生成 batch 文件、自己合并」。
- 若环境无法执行 `npm run i18n:sync-keys`，Agent 须**手动**对每个语言 JSON 做同样的增删 key，再继续填译文。

---

## 何时加载本 Skill

- 用户粘贴带 `,数字` / `,min-max` 后缀的伪 JSON 模板，或直接粘贴英文 key-value。
- 用户修改/准备修改 `language-package` 或讨论缺失翻译、长度限制。
- 用户提到 `i18n-length-rules.json`、全语言翻译、或本 skill 名称。

---

## 默认：一次覆盖除 `en` 外全部语言

- 除非用户明确「只要 xx 语言」，否则应为**每一种** `language-package/<code>/`（`code !== en`）写入本次涉及的 key 的译文。
- 长度规则适用于**每一种**语言的译文。

---

## 模板格式（英文源文案，供对照；不必由脚本生成）

伪 JSON 示例（规则在行尾，**不是**合法 JSON）：

```
{
  "generalSettings": "General Settings",10-20
  "speakerVolume": "Speaker Volume",20
  "microphoneVolume": "Microphone Volume",
}
```

- **`,N`**：各语言译文长度均 ≤ `N`（`.length`）。
- **`,min-max`**：各语言译文长度在 `min`～`max`（含）之间。
- **仅有行尾逗号**：无硬性数字，仍翻译得简洁自然。

---

## 翻译规则

1. **语言范围**：缺省为全部非 `en` 目录；仅当用户或队列注释限定单一语言时收窄。
2. **占位符**：`{name}`、`{0}`、`%s` 等与模板一致，不得译改或删除。
3. **长度**：优先满足 `i18n-length-rules.json`；必要时缩短措辞，不改变含义。
4. **标点与空格**：按目标语言习惯；勿在字符串首尾多留无意义空格。

---

## 可选：离线条（CI、或无 Agent 写库权限时）

以下供人工或自动化流水线使用，**不是**用户日常在 Cursor 里的默认路径：

1. `node i18n-ai-queue.js --merge-en=./x.json --out=prompt.txt` 或 `npm run i18n:queue`  
2. 将输出交给模型，得到 batch JSON  
3. `npm run i18n:apply -- ./batch.json`

全自动模式下 Agent 应**直接写各语言文件**，一般不需要此路径。

---

## 示例（规则）

`"speakerVolume": "Speaker Volume",12` → 每种语言的译文均需 `length ≤ 12`。

`"microphoneVolume": "Microphone Volume",` → 无数字上限，仍避免冗长。
