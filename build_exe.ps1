# ==============================================================================
# MultiWave - Windows Executable (.exe) Build Script
# ==============================================================================
# Usage:
#   .\build_exe.ps1              -> Builds standalone portable MultiWave.exe
#   .\build_exe.ps1 -Installer   -> Builds full Windows Setup Installer (.exe)
# ==============================================================================

param(
    [switch]$Installer
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       MultiWave Windows Build Pipeline          " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Ensure Cargo is in PATH
$CargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
if (Test-Path $CargoBin) {
    if ($env:PATH -notlike "*$CargoBin*") {
        $env:PATH = "$CargoBin;$env:PATH"
        Write-Host "[+] Added Cargo to PATH: $CargoBin" -ForegroundColor Green
    }
} else {
    Write-Warning "[!] Cargo bin directory not found at $CargoBin. Ensure Rust is installed."
}

# 2. Check Prerequisites
Write-Host ""
Write-Host "[*] Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVer = & node --version
    Write-Host "    Node: $nodeVer" -ForegroundColor Gray
} catch {
    Write-Error "Node.js is not found. Please install Node.js."
}

try {
    $cargoVer = & cargo --version
    Write-Host "    Rust: $cargoVer" -ForegroundColor Gray
} catch {
    Write-Error "Rust/Cargo is not found. Please install Rust via https://rustup.rs."
}

# 3. Build Web Frontend (React + TypeScript + Vite)
Write-Host ""
Write-Host "[*] Step 1/2: Building frontend distribution (dist/)..." -ForegroundColor Yellow
& npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed. Please fix any TypeScript or Vite errors."
}
Write-Host "[OK] Frontend successfully built into dist/" -ForegroundColor Green

# 4. Build Tauri Executable
if ($Installer) {
    Write-Host ""
    Write-Host "[*] Step 2/2: Compiling release installer with Tauri (NSIS)..." -ForegroundColor Yellow
    & npx tauri build --bundles nsis
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tauri installer build failed."
    }
    
    $BundleDir = Join-Path $ScriptDir "src-tauri\target\release\bundle\nsis"
    $InstallerExe = Get-ChildItem -Path $BundleDir -Filter "*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "   SUCCESS: Installer .exe successfully built!   " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    if ($InstallerExe) {
        $PublicInstaller = Join-Path $ScriptDir "public\MultiWave_0.1.0_x64-setup.exe"
        Copy-Item -Path $InstallerExe.FullName -Destination $PublicInstaller -Force
        Write-Host "Location : $($InstallerExe.FullName)" -ForegroundColor White
        Write-Host "Public   : $PublicInstaller" -ForegroundColor Cyan
        Write-Host "File Size: $([math]::Round($InstallerExe.Length / 1MB, 2)) MB" -ForegroundColor Gray
    } else {
        Write-Host "Location : src-tauri\target\release\bundle\nsis\" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "[*] Step 2/2: Compiling standalone portable .exe with Tauri..." -ForegroundColor Yellow
    & npx tauri build --no-bundle
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tauri executable build failed."
    }
    
    $ExePath = Join-Path $ScriptDir "src-tauri\target\release\multiwave.exe"
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "   SUCCESS: Standalone .exe successfully built!  " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    if (Test-Path $ExePath) {
        $Item = Get-Item $ExePath
        $PublicExe = Join-Path $ScriptDir "public\MultiWave.exe"
        Copy-Item -Path $ExePath -Destination $PublicExe -Force
        Write-Host "Location : $($Item.FullName)" -ForegroundColor White
        Write-Host "Public   : $PublicExe" -ForegroundColor Cyan
        Write-Host "File Size: $([math]::Round($Item.Length / 1MB, 2)) MB" -ForegroundColor Gray
    } else {
        Write-Host "Location : src-tauri\target\release\multiwave.exe" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Tip: To build a full Windows Setup Installer with uninstaller and desktop shortcuts," -ForegroundColor DarkCyan
    Write-Host "     run: .\build_exe.ps1 -Installer" -ForegroundColor DarkCyan
}
