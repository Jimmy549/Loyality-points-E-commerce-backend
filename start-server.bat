@echo off
echo Starting E-commerce Loyalty Point Backend...
echo.

cd /d "c:\Users\Jimmy\Desktop\Netixsol Intern-Projects\Week-6\Day 1 hackathon\ecom-loyalty-point-backend"

echo Checking if .env file exists...
if exist .env (
    echo .env file found
) else (
    echo ERROR: .env file not found!
    pause
    exit /b 1
)

echo.
echo Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Starting the server...
call npm run start:dev

pause