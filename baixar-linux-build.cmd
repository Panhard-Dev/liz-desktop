@echo off
setlocal

set SCRIPT_DIR=%~dp0
set SCRIPT=%SCRIPT_DIR%baixar-linux-build.ps1

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%" %*
set EXIT_CODE=%ERRORLEVEL%

if NOT "%EXIT_CODE%"=="0" (
  echo.
  echo [liz] Falhou com codigo %EXIT_CODE%.
  pause
)

exit /b %EXIT_CODE%
