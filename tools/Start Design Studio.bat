@echo off
title WellTrackIQ Design Studio
cd /d "%~dp0.."
echo Starting WellTrackIQ Design Studio...
echo.
echo If dependencies are missing, run npm install first.
echo.
npm run studio
echo.
echo Design Studio stopped or failed to start.
echo Press any key to close this window.
pause >nul
