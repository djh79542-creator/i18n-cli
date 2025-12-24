@echo off
title 语言包翻译工具 Docker 部署
color 0A

echo.
echo ========================================
echo    🐳 语言包翻译工具 Docker 部署
echo ========================================
echo.

:: 检查Docker是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

:: 检查Docker Compose是否安装
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过
echo.

:: 停止现有容器
echo 🛑 停止现有容器...
docker-compose down

:: 构建镜像
echo 🔨 构建 Docker 镜像...
docker build -t translation-gui .

:: 启动服务
echo 🚀 启动服务...
docker-compose up -d

:: 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

:: 检查服务状态
echo 🔍 检查服务状态...
docker-compose ps

:: 获取本机IP
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do set HOST_IP=%%j
)

echo.
echo ========================================
echo ✅ 部署完成！
echo ========================================
echo 📱 本地访问: http://localhost:3000/translation-gui.html
echo 🌐 局域网访问: http://%HOST_IP%:3000/translation-gui.html
echo.
echo 💡 常用命令:
echo    查看日志: docker-compose logs -f
echo    停止服务: docker-compose down  
echo    重启服务: docker-compose restart
echo.
echo 🌐 正在打开浏览器...
start http://localhost:3000/translation-gui.html

pause