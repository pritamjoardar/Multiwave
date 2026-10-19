@echo off
title MultiWave - Windows Executable Builder
echo ==================================================
echo         MultiWave Windows Executable Builder
echo ==================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build_exe.ps1"

echo.
echo Press any key to exit...
pause >nul
