@echo off
REM =========================================
REM 修复后端文件夹 backend，清理影子模块并推送
REM =========================================

cd /d "%~dp0"

echo.
echo 正在取消 backend 子模块（如果存在）...
git submodule deinit -f backend >nul 2>&1
git rm -f backend >nul 2>&1
if exist .git\modules\backend (
    rmdir /s /q .git\modules\backend
)

echo.
echo 正在重新添加 backend 为普通文件夹...
git add backend

echo.
echo 正在提交更改...
git commit -m "Restore backend as normal folder" 

echo.
echo 正在强制推送到远程仓库...
git push origin main --force

echo.
echo 完成！backend 已恢复为普通文件夹并推送。
pause
