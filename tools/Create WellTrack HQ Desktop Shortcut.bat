@echo off
setlocal
title Create WellTrack HQ Desktop Shortcut

echo Creating WellTrack HQ desktop shortcut...

set "SCRIPT=%~dp0Start WellTrack HQ.bat"
set "SHORTCUT=%USERPROFILE%\Desktop\WellTrack HQ.lnk"

if not exist "%SCRIPT%" (
  echo Could not find:
  echo %SCRIPT%
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = '%SCRIPT%'; $Shortcut.WorkingDirectory = '%~dp0..'; $Shortcut.WindowStyle = 1; $Shortcut.Description = 'Launch WellTrack HQ'; $Shortcut.Save()"

if errorlevel 1 (
  echo Failed to create shortcut.
  pause
  exit /b 1
)

echo.
echo Desktop shortcut created:
echo %SHORTCUT%
echo.
pause
