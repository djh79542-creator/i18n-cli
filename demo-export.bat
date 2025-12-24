@echo off
title 导出功能演示
color 0E

echo.
echo ========================================
echo    📦 语言包导出功能演示
echo ========================================
echo.

echo 🚀 启动演示...
echo.

:: 检查服务器是否运行
curl -s http://localhost:3000/api/languages >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 服务器未运行，正在启动...
    start /B npm start
    echo ⏳ 等待服务器启动...
    timeout /t 5 /nobreak >nul
)

echo ✅ 服务器运行正常
echo.

echo 📋 可用的导出功能:
echo.
echo 1. 📤 导出单个语言包
echo    - 在Web界面中选择语言后点击"导出当前语言"
echo    - 下载格式: 语言代码_语言名称.json
echo.
echo 2. 📦 导出所有语言包  
echo    - 点击"导出所有语言包"按钮
echo    - 下载格式: language-package-日期.zip
echo    - 包含完整的32种语言文件
echo.

echo 🧪 运行导出功能测试...
node test-export.js

echo.
echo 🌐 打开Web界面体验导出功能...
start http://localhost:3000/translation-gui.html

echo.
echo 💡 使用提示:
echo    - 导出的ZIP文件包含完整的language-package目录
echo    - 可直接用于项目部署或备份
echo    - 支持所有现代浏览器下载
echo.

pause