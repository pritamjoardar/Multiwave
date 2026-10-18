@echo off
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

set "PS1_PATH=%SCRIPT_DIR%install_virtual_speaker.ps1"
if not exist "%PS1_PATH%" set "PS1_PATH=%SCRIPT_DIR%..\install_virtual_speaker.ps1"

net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS1_PATH%"
) else (
    echo Requesting Administrator privileges to install MultiWave Virtual Speaker...
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell.exe -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%PS1_PATH%\"\"' -Verb RunAs"
)
