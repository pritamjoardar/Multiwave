@echo off
:: MultiWave Virtual Speaker Registry Configurator
:: Run as Administrator to rename the Virtual Audio device to MultiWave Virtual Speaker
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -NoProfile -Command "Start-Process cmd.exe -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

echo Configuring MultiWave Virtual Speaker in Windows Registry...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$regPath = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render';" ^
  "Get-ChildItem $regPath | ForEach-Object {" ^
  "  $propsPath = Join-Path $_.PSPath 'Properties';" ^
  "  if (Test-Path $propsPath) {" ^
  "    $props = Get-ItemProperty $propsPath;" ^
  "    $n1 = $props.'{a45c254e-df1c-4efd-8020-67d146a850e0},2';" ^
  "    $n2 = $props.'{b3f8fa53-0004-438e-9003-51a46e139bfc},6';" ^
  "    $n3 = $props.'{a45c254e-df1c-4efd-8020-67d146a850e0},14';" ^
  "    if (($n1 -and ($n1 -like '*Virtual*' -or $n1 -like '*AudioRelay*' -or $n1 -like '*MultiWave*' -or $n1 -like '*CABLE*' -or $n1 -like '*VB-Audio*')) -or ($n2 -and ($n2 -like '*Virtual*' -or $n2 -like '*AudioRelay*' -or $n2 -like '*MultiWave*' -or $n2 -like '*CABLE*' -or $n2 -like '*VB-Audio*'))) {" ^
  "      Write-Host 'Found audio endpoint:' $_.PSChildName;" ^
  "      Set-ItemProperty -Path $propsPath -Name '{a45c254e-df1c-4efd-8020-67d146a850e0},14' -Value 'MultiWave Virtual Speaker' -Force;" ^
  "      Set-ItemProperty -Path $propsPath -Name '{a45c254e-df1c-4efd-8020-67d146a850e0},2' -Value 'MultiWave Virtual Speaker' -Force;" ^
  "      Set-ItemProperty -Path $propsPath -Name '{b3f8fa53-0004-438e-9003-51a46e139bfc},6' -Value 'MultiWave Virtual Audio' -Force;" ^
  "      Write-Host 'Device successfully updated to MultiWave Virtual Speaker!';" ^
  "    }" ^
  "  }" ^
  "}"

echo Done! The virtual speaker will now appear as 'MultiWave Virtual Speaker' in Windows Sound Output!
timeout /t 3 >nul
