@echo off
echo ========================================
echo    KushalWear Site Startup Script
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo [2/4] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [3/4] Setting up database...
npm run setup-db
if %errorlevel% neq 0 (
    echo ERROR: Failed to setup database!
    pause
    exit /b 1
)

echo.
echo [4/4] Starting backend server...
echo.
echo ========================================
echo    Backend Server Starting...
echo ========================================
echo.
echo MongoDB should be running on port 27017
echo Backend will start on port 3000
echo.
echo To test the site:
echo 1. Open html/test-auth.html in browser
echo 2. Or use Live Server to serve HTML files
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause 