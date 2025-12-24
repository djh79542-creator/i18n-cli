# 🐳 Docker 部署指南

## 📋 概述

语言包翻译管理工具已完全容器化，支持Docker部署，让部署和管理更加简单、标准化。

## 🛠️ 环境要求

### 必需软件
- **Docker**: 20.10+ 
- **Docker Compose**: 2.0+

### 系统要求
- **内存**: 最小512MB，推荐1GB+
- **存储**: 最小1GB可用空间
- **网络**: 需要访问互联网（用于翻译API）

## 🚀 快速部署

### 方法一：一键部署（推荐）

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 方法二：手动部署

```bash
# 1. 构建镜像
docker build -t translation-gui .

# 2. 启动服务
docker-compose up -d

# 3. 查看状态
docker-compose ps
```

## 📁 项目结构

```
├── Dockerfile              # 生产环境镜像
├── Dockerfile.dev          # 开发环境镜像
├── docker-compose.yml      # 生产环境编排
├── docker-compose.dev.yml  # 开发环境编排
├── .dockerignore           # Docker忽略文件
├── healthcheck.js          # 健康检查脚本
├── deploy.sh              # Linux/Mac部署脚本
└── deploy.bat             # Windows部署脚本
```

## 🔧 配置说明

### 端口配置
- **容器端口**: 3000
- **主机端口**: 3000（可修改）

### 数据持久化
```yaml
volumes:
  - ./language-package:/app/language-package
```
语言包数据挂载到主机，确保数据不丢失。

### 环境变量
```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
```

## 📊 Docker Compose 服务

### 生产环境
```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

### 开发环境
```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up

# 后台运行
docker-compose -f docker-compose.dev.yml up -d
```

## 🎯 NPM 脚本

```bash
# Docker 相关命令
npm run docker:build    # 构建镜像
npm run docker:run      # 运行容器
npm run docker:up       # 启动服务
npm run docker:down     # 停止服务
npm run docker:dev      # 开发模式
npm run docker:logs     # 查看日志
```

## 🔍 健康检查

容器内置健康检查机制：
- **检查间隔**: 30秒
- **超时时间**: 10秒
- **重试次数**: 3次
- **启动等待**: 40秒

```bash
# 查看健康状态
docker ps
docker inspect translation-gui-tool
```

## 🌐 网络访问

### 本地访问
```
http://localhost:3000/translation-gui.html
```

### 局域网访问
```
http://[主机IP]:3000/translation-gui.html
```

### 容器间通信
容器使用自定义网络 `translation-network`，支持服务发现。

## 📦 镜像管理

### 构建镜像
```bash
# 生产镜像
docker build -t translation-gui .

# 开发镜像
docker build -f Dockerfile.dev -t translation-gui:dev .

# 指定标签
docker build -t translation-gui:v1.0.0 .
```

### 镜像优化
- 使用 `node:18-alpine` 基础镜像（体积小）
- 多阶段构建减少镜像大小
- `.dockerignore` 排除不必要文件

## 🔒 安全配置

### 用户权限
```dockerfile
# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs
```

### 网络安全
- 容器间使用内部网络通信
- 只暴露必要端口
- 支持防火墙配置

## 📈 监控和日志

### 查看日志
```bash
# 实时日志
docker-compose logs -f

# 指定服务日志
docker-compose logs -f translation-gui

# 最近100行日志
docker-compose logs --tail=100
```

### 性能监控
```bash
# 查看资源使用
docker stats translation-gui-tool

# 查看容器信息
docker inspect translation-gui-tool
```

## 🛠️ 故障排除

### 常见问题

**1. 端口被占用**
```bash
# 查看端口占用
netstat -tulpn | grep :3000
# 或者修改docker-compose.yml中的端口映射
```

**2. 容器启动失败**
```bash
# 查看详细日志
docker-compose logs translation-gui
# 检查健康状态
docker ps -a
```

**3. 数据丢失**
```bash
# 确认数据卷挂载
docker inspect translation-gui-tool | grep Mounts -A 10
```

**4. 网络连接问题**
```bash
# 测试容器网络
docker exec -it translation-gui-tool ping google.com
```

### 重置环境
```bash
# 完全清理
docker-compose down -v
docker rmi translation-gui
docker system prune -f

# 重新部署
./deploy.sh
```

## 🔄 更新升级

### 应用更新
```bash
# 1. 停止服务
docker-compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建
docker build -t translation-gui .

# 4. 启动服务
docker-compose up -d
```

### 数据备份
```bash
# 备份语言包数据
tar -czf language-package-backup.tar.gz language-package/

# 恢复数据
tar -xzf language-package-backup.tar.gz
```

## 🎨 自定义配置

### 修改端口
```yaml
# docker-compose.yml
ports:
  - "8080:3000"  # 主机端口:容器端口
```

### 添加环境变量
```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - CUSTOM_VAR=value
```

### 挂载配置文件
```yaml
volumes:
  - ./config:/app/config:ro
```

通过Docker部署，让翻译工具的部署和管理变得更加简单、可靠！