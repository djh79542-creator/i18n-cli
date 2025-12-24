@echo off
echo 🌍 启动语言包翻译管理工具...
echo.
echo 正在启动服务器...
start /B npm start
echo.
echo 等待服务器启动...
timeout /t 3 /nobreak >nul
echo.
echo 🚀 服务器已启动！
echo 📱 正在打开浏览器...
start http://localhost:3000/translation-gui.html
echo.
echo 💡 提示：
echo    - 本地访问: http://localhost:3000/translation-gui.html
echo    - 局域网访问: 查看上方服务器输出的IP地址
echo    - 其他设备可通过局域网IP访问此工具
echo    - 按 Ctrl+C 可以停止服务器
echo    - 关闭此窗口将停止服务器
echo.
pause