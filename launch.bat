@echo off
title Fingerprint Voting System - Launcher
color 0A

echo.
echo  =====================================================
echo   FINGERPRINT VOTING SYSTEM
echo   Biometric e-Voting Platform
echo  =====================================================
echo.
echo  [*] Launching application...
echo.

REM Get the directory where this batch file is located
set "PROJECT_DIR=%~dp0"
set "INDEX_FILE=%PROJECT_DIR%index.html"

REM Check if index.html exists
if not exist "%INDEX_FILE%" (
    echo  [ERROR] index.html not found in project directory!
    echo  Expected path: %INDEX_FILE%
    echo.
    pause
    exit /b 1
)

echo  [OK] Project directory: %PROJECT_DIR%
echo  [OK] Opening index.html in your default browser...
echo.

REM Open index.html in the default browser
start "" "%INDEX_FILE%"

echo  [OK] Application launched successfully!
echo.
echo  Available pages:
echo    - index.html    (Main / Home)
echo    - vote.html     (Cast Your Vote)
echo    - register.html (Voter Registration)
echo    - admin.html    (Admin Dashboard)
echo    - results.html  (Election Results)
echo.
echo  Press any key to close this window...
pause >nul
