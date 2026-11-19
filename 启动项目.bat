@echo off
rem 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
chcp 936 >nul
title 星穹科技资讯站 - 张硕 24006380115
echo ================================================
echo   星穹科技资讯站 后端启动中
echo   姓名：张硕   学号：24006380115
echo ================================================
cd /d %~dp0backend
echo 当前目录：%cd%
echo 正在启动 Express 服务（端口 115）...
echo 浏览器将自动打开；若未打开，请手动执行：
echo msedge --explicitly-allowed-ports=115 --user-data-dir="%LOCALAPPDATA%\CheneyEdgeProfile" http://127.0.0.1:115/
echo.
echo 说明：Chrome/Edge 默认封锁 115 端口（ERR_UNSAFE_PORT），
echo       启动参数必须包含 --explicitly-allowed-ports=115。
echo 关闭本窗口即停止服务。
echo ------------------------------------------------
start "" /b node scripts\Cheney_openBrowser.js
node app.js
echo.
echo 服务已停止（若为异常退出，请检查端口 115 是否被占用）。
pause