#!/bin/bash

# 语言包翻译工具 Docker 部署脚本

echo "🐳 开始部署语言包翻译工具..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker build -t translation-gui .

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 获取容器IP
CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' translation-gui-tool)
HOST_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "✅ 部署完成！"
echo "📱 本地访问: http://localhost:3000/translation-gui.html"
echo "🌐 局域网访问: http://${HOST_IP}:3000/translation-gui.html"
echo "🐳 容器IP: ${CONTAINER_IP}"
echo ""
echo "💡 常用命令:"
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo ""