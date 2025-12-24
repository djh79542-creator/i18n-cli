@echo off
title 语言包翻译工具 - Docker 快速启动
color 0B

echo.
echo ========================================
echo    🐳 Docker 快速启动
echo ========================================
echo.

:: 检查Docker是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未运行，请启动 Docker Desktop
    echo 💡 启动 Docker Desktop 后重试
    pause
    exit /b 1
)

echo ✅ Docker 运行正常
echo.

:: 检查是否已有运行的容器
docker ps | findstr translation-gui-tool >nul
if %errorlevel% equ 0 (
    echo 🔄 发现运行中的容器，正在重启...
    docker-compose restart
) else (
    echo 🚀 启动新容器...
    docker-compose up -d
)

echo.
echo ⏳ 等待服务启动...
timeout /t 3 /nobreak >nul

:: 检查服务状态
docker ps | findstr translation-gui-tool >nul
if %errorlevel% equ 0 (
    echo ✅ 服务启动成功！
    echo.
    echo 📱 本地访问: http://localhost:3000/translation-gui.html
    echo 🌐 正在打开浏览器...
    start http://localhost:3000/translation-gui.html
) else (
    echo ❌ 服务启动失败
    echo 📋 查看日志:
    docker-compose logs --tail=20
)

echo.
pause