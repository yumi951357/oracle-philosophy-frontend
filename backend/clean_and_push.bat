@echo off
REM ================================
REM 安全清理影子文件并推送本地后端
REM ================================

cd /d "C:\Users\Administrator\Desktop\oracle-philosophy-system"

echo.
echo 正在删除他新增的影子文件和目录...

REM 删除 deploy 相关文件
if exist deploy\.env.example del /f /q deploy\.env.example
if exist deploy\backend.Dockerfile del /f /q deploy\backend.Dockerfile
if exist deploy\docker-compose.yml del /f /q deploy\docker-compose.yml
if exist deploy\frontend.Dockerfile del /f /q deploy\frontend.Dockerfile
if exist deploy\nginx.conf del /f /q deploy\nginx.conf
if exist deploy\vercel.json del /f /q deploy\vercel.json

REM 删除 docs 相关文件
if exist docs\README.md del /f /q docs\README.md
if exist docs\RITUALS.md del /f /q docs\RITUALS.md
if exist docs\WHITEPAPER.md del /f /q docs\WHITEPAPER.md

REM 删除 frontend 目录
if exist frontend rmdir /s /q frontend

echo.
echo 删除完成，正在提交更改...

git add -u
git add .
git commit -m "Remove shadow files, keep my backend"

echo.
echo 正在推送到远程仓库...
git push origin main

echo.
echo 完成！你的后端安全已推送。
pause
