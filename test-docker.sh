#!/bin/bash

# Docker 部署测试脚本

echo "🧪 开始测试 Docker 部署..."

# 测试Docker环境
echo "1️⃣ 检查 Docker 环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "✅ Docker 环境正常"

# 构建镜像
echo "2️⃣ 构建 Docker 镜像..."
docker build -t translation-gui-test . || {
    echo "❌ 镜像构建失败"
    exit 1
}
echo "✅ 镜像构建成功"

# 启动容器
echo "3️⃣ 启动测试容器..."
docker run -d --name translation-gui-test -p 3001:3000 translation-gui-test || {
    echo "❌ 容器启动失败"
    exit 1
}

# 等待服务启动
echo "4️⃣ 等待服务启动..."
sleep 10

# 测试健康检查
echo "5️⃣ 测试服务健康状态..."
if curl -f http://localhost:3001/api/languages > /dev/null 2>&1; then
    echo "✅ 服务健康检查通过"
else
    echo "❌ 服务健康检查失败"
    docker logs translation-gui-test
    docker rm -f translation-gui-test
    exit 1
fi

# 测试Web界面
echo "6️⃣ 测试Web界面..."
if curl -f http://localhost:3001/translation-gui.html > /dev/null 2>&1; then
    echo "✅ Web界面访问正常"
else
    echo "❌ Web界面访问失败"
    docker logs translation-gui-test
    docker rm -f translation-gui-test
    exit 1
fi

# 清理测试容器
echo "7️⃣ 清理测试环境..."
docker rm -f translation-gui-test
docker rmi translation-gui-test

echo ""
echo "🎉 Docker 部署测试完成！"
echo "✅ 所有测试通过，可以安全部署"