@echo off
setlocal
title WellTrack HQ Launcher

echo ==================================================
echo WellTrack HQ
echo Control Center for WellTrack Performance
echo ==================================================
echo.

cd /d "%~dp0.."
if errorlevel 1 (
  echo Could not change to repository root.
  pause
  exit /b 1
)

echo Repository:
echo %CD%
echo.

echo Pulling latest updates...
git pull
if errorlevel 1 (
  echo.
  echo git pull failed. Review the message above.
  pause
  exit /b 1
)

echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Review the message above.
  pause
  exit /b 1
)

echo.
echo Starting server...
start "WellTrack HQ Server" cmd /k "cd /d "%CD%" && npm run studio"

echo Waiting for local server...
timeout /t 5 /nobreak >nul

echo Opening WellTrack HQ...
start "" "http://localhost:5173/tools/pitchiq-hq-live.html"

echo.
echo WellTrack HQ launcher complete.
echo Keep the server terminal open while using HQ.
echo.
pause
