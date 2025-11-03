@echo off
REM ================================
REM 恢复本地 backup 为干净 Git 仓库并推送远程
REM ================================

echo.
echo 清理可能存在的子模块痕迹...
rmdir /s /q backend\.git
rmdir /s /q deploy\.git
rmdir /s /q frontend\.git

echo.
echo 初始化新的 Git 仓库...
git init

echo.
echo 添加远程仓库...
git remote add origin https://github.com/yumi951357/oracle-philosophy-frontend.git

echo.
echo 添加所有文件到 Git...
git add .

echo.
echo 提交更改...
git commit -m "Restore backend from local backup and remove shadow files"

echo.
echo 强制推送到远程仓库...
git push origin main --force

echo.
echo 完成！本地 backup 已恢复为干净仓库并推送到远程。
pause
