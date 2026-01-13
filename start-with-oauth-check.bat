@echo off
echo ========================================
echo   OAuth Configuration Test
echo ========================================
echo.

cd /d "c:\Users\Jimmy\Desktop\Netixsol Intern-Projects\Week-6\Day 1 hackathon\ecom-loyalty-point-backend"

echo Running verification script...
echo.
node verify-oauth.js

echo.
echo ========================================
echo   Starting Backend Server
echo ========================================
echo.
echo Backend will start on: http://localhost:5000
echo.
echo OAuth Login URLs:
echo   Google:  http://localhost:5000/auth/google
echo   GitHub:  http://localhost:5000/auth/github
echo   Discord: http://localhost:5000/auth/discord
echo.
echo Frontend Login: http://localhost:3000/auth/login
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run start:dev
