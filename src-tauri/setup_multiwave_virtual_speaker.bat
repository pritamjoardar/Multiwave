@echo off
:: MultiWave Virtual Speaker Automated Setup & Driver Configurator
:: Installs the bundled MultiWave driver and registers it in Windows
setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges to setup MultiWave Virtual Speaker...
    powershell -NoProfile -Command "Start-Process cmd.exe -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

echo ========================================================
echo   MultiWave Virtual Speaker Automated Driver Setup
echo ========================================================

set "PS1_PATH=%SCRIPT_DIR%install_virtual_speaker.ps1"
if not exist "%PS1_PATH%" set "PS1_PATH=%SCRIPT_DIR%..\install_virtual_speaker.ps1"
if not exist "%PS1_PATH%" set "PS1_PATH=%SCRIPT_DIR%src-tauri\install_virtual_speaker.ps1"

if exist "%PS1_PATH%" (
    echo Launching MultiWave Driver Engine installer...
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS1_PATH%"
) else (
    echo Error: install_virtual_speaker.ps1 not found in %SCRIPT_DIR%
)

echo.
echo Setup complete. MultiWave Virtual Speaker is ready!
timeout /t 3 >nul

