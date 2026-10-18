# Script to rename Virtual Speakers for AudioRelay to "MultiWave Virtual Speaker"
$regPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render"
$found = $false

Get-ChildItem $regPath | ForEach-Object {
    $propsPath = Join-Path $_.PSPath "Properties"
    if (Test-Path $propsPath) {
        $props = Get-ItemProperty $propsPath
        $name1 = $props."{a45c254e-df1c-4efd-8020-67d146a850e0},2"
        $name2 = $props."{b3f8fa53-0004-438e-9003-51a46e139bfc},6"
        $name3 = $props."{a45c254e-df1c-4efd-8020-67d146a850e0},14"
        
        if (($name1 -and ($name1 -like "*Virtual*" -or $name1 -like "*AudioRelay*")) -or
            ($name2 -and ($name2 -like "*Virtual*" -or $name2 -like "*AudioRelay*")) -or
            ($name3 -and ($name3 -like "*Virtual*" -or $name3 -like "*AudioRelay*"))) {
            
            Write-Host "Found virtual audio device at: $($_.PSChildName)"
            Set-ItemProperty -Path $propsPath -Name "{a45c254e-df1c-4efd-8020-67d146a850e0},14" -Value "MultiWave Virtual Speaker" -Force
            Set-ItemProperty -Path $propsPath -Name "{a45c254e-df1c-4efd-8020-67d146a850e0},2" -Value "MultiWave Virtual Speaker" -Force
            Set-ItemProperty -Path $propsPath -Name "{b3f8fa53-0004-438e-9003-51a46e139bfc},6" -Value "MultiWave Audio Engine" -Force
            Write-Host "Successfully renamed to 'MultiWave Virtual Speaker'!"
            $found = $true
        }
    }
}

if (-not $found) {
    Write-Host "No matching virtual audio device found to rename."
}
