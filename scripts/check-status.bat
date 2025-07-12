@echo off
echo ========================================
echo    KushalWear Status Checker
echo ========================================
echo.

echo [1/3] Checking MongoDB...
curl -s http://localhost:27017 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running on port 27017
) else (
    echo ❌ MongoDB is not running
    echo    Start with: mongod --dbpath ./data/db
)

echo.
echo [2/3] Checking Backend Server...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend server is running on port 3000
) else (
    echo ❌ Backend server is not running
    echo    Start with: npm run dev
)

echo.
echo [3/3] Checking Database Connection...
npm run check-db >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database connection is working
) else (
    echo ❌ Database connection failed
)

echo.
echo ========================================
echo    Next Steps:
echo ========================================
echo.
echo If all services are running:
echo 1. Open html/test-auth.html in browser
echo 2. Test authentication functionality
echo 3. Open html/index.html for main site
echo.
echo If services are not running:
echo 1. Start MongoDB: mongod --dbpath ./data/db
echo 2. Start Backend: npm run dev
echo 3. Run this script again to verify
echo.

pause 