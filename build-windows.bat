@echo off
chcp 65001 >nul
echo ========================================
echo   爱的教育 - Windows打包工具
echo ========================================
echo.

:: 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未安装Node.js，请先安装Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查是否在项目目录
if not exist "package.json" (
    echo [错误] 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [1/5] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/5] 生成Prisma客户端...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [错误] Prisma生成失败
    pause
    exit /b 1
)

echo.
echo [3/5] 构建Next.js项目...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 构建失败
    pause
    exit /b 1
)

echo.
echo [4/5] 初始化数据库...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [警告] 数据库初始化可能有问题，继续尝试打包...
)

echo.
echo [5/5] 打包Windows应用...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
    echo [错误] 打包失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo   打包完成！
echo ========================================
echo.
echo 安装包位置: release\爱的教育 Setup 1.0.0.exe
echo 便携版位置: release\爱的教育-1.0.0-Portable.exe
echo.

:: 打开输出目录
explorer release

pause
