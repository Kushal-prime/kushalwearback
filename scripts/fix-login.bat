@echo off
echo ========================================
echo    Fixing KushalWear Login Issues
echo ========================================
echo.

echo [1/5] Stopping all Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Stopped all Node processes

echo.
echo [2/5] Creating MongoDB data directory...
if not exist "data" mkdir data
if not exist "data\db" mkdir data\db
echo ✅ Created data directories

echo.
echo [3/5] Setting up database with admin user...
npm run setup-db
if %errorlevel% neq 0 (
    echo ❌ Database setup failed!
    pause
    exit /b 1
)

echo.
echo [4/5] Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath ./data/db"
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Starting backend server...
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo ✅ MongoDB is running on port 27017
echo ✅ Backend server is starting on port 3000
echo.
echo 🔑 Your Login Credentials:
echo    Email: admin@kushalwear.com
echo    Password: Admin123!
echo.
echo 🌐 To test login:
echo    1. Open html/test-auth.html in browser
echo    2. Click "Test Admin Login"
echo    3. Or open html/index.html and use Login button
echo.
echo ⏳ Waiting for server to start...
timeout /t 10 /nobreak >nul

echo.
echo 🧪 Testing server connection...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server is running and accessible!
) else (
    echo ⚠️ Server may still be starting, try again in a few seconds
)

echo.
echo 🎉 Ready to test login!
pause 