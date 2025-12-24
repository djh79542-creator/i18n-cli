# 📚 Git使用说明

## 🎯 项目Git配置

### .gitignore 说明

项目已配置完善的`.gitignore`文件，忽略以下内容：

#### Node.js相关
- `node_modules/` - 依赖包目录
- `package-lock.json` - 锁定文件（团队协作时可选择提交）
- `*.log` - 日志文件

#### 开发环境
- `.env*` - 环境变量文件
- `.vscode/`, `.idea/` - IDE配置
- `*.swp`, `*.swo` - 编辑器临时文件

#### 临时文件
- `*.tmp`, `*.temp` - 临时文件
- `test-export-*.zip` - 测试导出文件
- `*.bak`, `*.backup` - 备份文件

#### 操作系统
- `.DS_Store` - macOS系统文件
- `Thumbs.db` - Windows缩略图
- `desktop.ini` - Windows桌面配置

### .gitattributes 说明

配置了文件行尾符规范：
- **LF** (Unix风格): `.js`, `.json`, `.html`, `.css`, `.md`, `.sh`, `.yml`
- **CRLF** (Windows风格): `.bat`, `.cmd`
- **二进制**: 图片、压缩包等

## 🚀 快速开始

### 1. 初始化仓库（已完成）
```bash
git init
```

### 2. 添加文件
```bash
# 添加所有文件
git add .

# 或添加特定文件
git add README.md
git add server.js
```

### 3. 提交更改
```bash
git commit -m "feat: 初始化语言包翻译管理工具项目"
```

### 4. 连接Gitee远程仓库
```bash
# 添加远程仓库
git remote add origin https://gitee.com/你的用户名/仓库名.git

# 查看远程仓库
git remote -v
```

### 5. 推送到Gitee
```bash
# 首次推送
git push -u origin master

# 后续推送
git push
```

## 📝 提交规范

### Commit Message 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型
- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档更新
- **style**: 代码格式调整
- **refactor**: 重构代码
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建/工具链更新

### 示例
```bash
# 新功能
git commit -m "feat: 添加语言包导出功能"

# 修复bug
git commit -m "fix: 修复翻译API调用失败的问题"

# 文档更新
git commit -m "docs: 更新README使用说明"

# 样式调整
git commit -m "style: 优化界面绿蓝双主题配色"

# 重构
git commit -m "refactor: 重构语言列表渲染逻辑"
```

## 🌿 分支管理

### 主要分支
- **master/main**: 主分支，稳定版本
- **develop**: 开发分支
- **feature/***: 功能分支
- **hotfix/***: 紧急修复分支

### 分支操作
```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 切换分支
git checkout master

# 合并分支
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

## 🔄 常用命令

### 查看状态
```bash
# 查看工作区状态
git status

# 查看提交历史
git log

# 查看简洁历史
git log --oneline

# 查看分支
git branch
```

### 撤销操作
```bash
# 撤销工作区修改
git checkout -- <file>

# 撤销暂存区
git reset HEAD <file>

# 撤销最后一次提交
git reset --soft HEAD^

# 强制撤销（慎用）
git reset --hard HEAD^
```

### 远程操作
```bash
# 拉取远程更新
git pull

# 推送到远程
git push

# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <url>

# 修改远程仓库地址
git remote set-url origin <new-url>
```

## 🔐 Gitee配置

### SSH密钥配置（推荐）

1. **生成SSH密钥**
```bash
ssh-keygen -t rsa -C "your_email@example.com"
```

2. **查看公钥**
```bash
cat ~/.ssh/id_rsa.pub
```

3. **添加到Gitee**
- 登录Gitee
- 进入"设置" → "SSH公钥"
- 粘贴公钥内容
- 保存

4. **测试连接**
```bash
ssh -T git@gitee.com
```

### HTTPS方式
```bash
# 使用HTTPS克隆
git clone https://gitee.com/username/repo.git

# 推送时需要输入用户名和密码
git push
```

## 📦 发布流程

### 1. 准备发布
```bash
# 确保在master分支
git checkout master

# 拉取最新代码
git pull

# 合并开发分支
git merge develop
```

### 2. 打标签
```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0

# 推送所有标签
git push --tags
```

### 3. 发布到Gitee
```bash
# 推送代码
git push origin master

# 在Gitee上创建Release
# 访问仓库 → Releases → 新建Release
```

## 🛠️ 团队协作

### 克隆项目
```bash
git clone https://gitee.com/username/translation-tool.git
cd translation-tool
npm install
```

### 更新代码
```bash
# 拉取最新代码
git pull

# 如果有冲突，解决后
git add .
git commit -m "fix: 解决合并冲突"
```

### 提交代码
```bash
# 创建功能分支
git checkout -b feature/my-feature

# 开发完成后
git add .
git commit -m "feat: 添加新功能"

# 推送到远程
git push origin feature/my-feature

# 在Gitee上创建Pull Request
```

## 📊 项目统计

### 查看贡献统计
```bash
# 查看提交统计
git shortlog -sn

# 查看代码行数
git ls-files | xargs wc -l

# 查看文件变更统计
git diff --stat
```

## 🔍 问题排查

### 常见问题

**1. 推送失败**
```bash
# 先拉取远程更新
git pull --rebase
git push
```

**2. 合并冲突**
```bash
# 查看冲突文件
git status

# 手动解决冲突后
git add .
git commit -m "fix: 解决合并冲突"
```

**3. 忘记添加.gitignore**
```bash
# 清除已跟踪的文件
git rm -r --cached .
git add .
git commit -m "chore: 更新.gitignore"
```

## 📚 参考资源

- [Git官方文档](https://git-scm.com/doc)
- [Gitee帮助中心](https://gitee.com/help)
- [Git教程 - 廖雪峰](https://www.liaoxuefeng.com/wiki/896043488029600)

## 💡 最佳实践

1. **频繁提交**: 小步快跑，每个功能点提交一次
2. **清晰的提交信息**: 使用规范的commit message
3. **分支管理**: 使用功能分支开发，保持主分支稳定
4. **代码审查**: 使用Pull Request进行代码审查
5. **定期同步**: 经常拉取远程更新，避免大量冲突
6. **备份重要数据**: 定期备份language-package目录

通过规范的Git使用，可以更好地管理项目版本，协作开发更加高效！