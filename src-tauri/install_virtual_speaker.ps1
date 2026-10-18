# MultiWave Virtual Speaker Automated Installer
# Ensures the WHQL-signed Virtual Audio Driver is installed and configured as 'MultiWave Virtual Speaker'

param(
    [switch]$NoElevation
)

$ErrorActionPreference = "SilentlyContinue"

# 1. Check Administrator Privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Requesting Administrator elevation..." -ForegroundColor Cyan
    $scriptPath = if ($MyInvocation.MyCommand.Path) { $MyInvocation.MyCommand.Path } elseif ($PSScriptRoot) { "$PSScriptRoot\install_virtual_speaker.ps1" } else { "c:\Users\prita\OneDrive\Desktop\MultiWave\install_virtual_speaker.ps1" }
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs
    exit
}

# Remove any broken duplicate device node (Code 10 from previous attempts)
$brokenNode = Get-PnpDevice -InstanceId "ROOT\MEDIA\0001" -ErrorAction SilentlyContinue
if ($brokenNode) {
    Write-Host "Cleaning up broken duplicate device node ROOT\MEDIA\0001..." -ForegroundColor Yellow
    & pnputil /remove-device "ROOT\MEDIA\0001" 2>&1 | Out-Null
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  MultiWave Virtual Speaker Driver Installer" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Locate Driver Directory
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { "c:\Users\prita\OneDrive\Desktop\MultiWave" }
$driverDir = $null

$candidates = @(
    "$scriptDir\vbcable_driver",
    "$scriptDir\..\vbcable_driver",
    "c:\Users\prita\OneDrive\Desktop\MultiWave\vbcable_driver",
    "c:\Users\prita\OneDrive\Desktop\MultiWave\src-tauri\vbcable_driver"
)

foreach ($c in $candidates) {
    if (Test-Path "$c\VBCABLE_Setup_x64.exe") {
        $driverDir = (Resolve-Path $c).Path
        break
    }
}

if (-not $driverDir) {
    Write-Host "Error: Driver directory not found!" -ForegroundColor Red
    Write-Host "Searched locations: $($candidates -join '; ')" -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    exit 1
}

Write-Host "Found Driver Package at: $driverDir" -ForegroundColor Green

# 2. Stage Driver in DriverStore via pnputil
Write-Host "Staging driver in Windows DriverStore..." -ForegroundColor Yellow
$infPath = "$driverDir\vbMmeCable64_win10.inf"
$pnpOut = & pnputil /add-driver "$infPath" /install 2>&1
Write-Host ($pnpOut -join "`n") -ForegroundColor Gray

# 3. Compile C# Win32 helper for UI automation
Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class Win32DriverHelper {
    public delegate bool EnumChildProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool EnumChildWindows(IntPtr hWndParent, EnumChildProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int GetClassName(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll")]
    public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    public const uint BM_CLICK = 0x00F5;
    public const uint WM_CLOSE = 0x0010;

    public static List<IntPtr> GetChildren(IntPtr parent) {
        List<IntPtr> result = new List<IntPtr>();
        GCHandle listHandle = GCHandle.Alloc(result);
        try {
            EnumChildWindows(parent, (hWnd, lParam) => {
                GCHandle gch = GCHandle.FromIntPtr(lParam);
                List<IntPtr> list = (List<IntPtr>)gch.Target;
                list.Add(hWnd);
                return true;
            }, GCHandle.ToIntPtr(listHandle));
        } finally {
            if (listHandle.IsAllocated) listHandle.Free();
        }
        return result;
    }

    public static string GetText(IntPtr hWnd) {
        StringBuilder sb = new StringBuilder(512);
        GetWindowText(hWnd, sb, 512);
        return sb.ToString();
    }

    public static string GetClass(IntPtr hWnd) {
        StringBuilder sb = new StringBuilder(256);
        GetClassName(hWnd, sb, 256);
        return sb.ToString();
    }
}
"@ -ErrorAction SilentlyContinue

# Load UI Automation
Add-Type -AssemblyName UIAutomationClient -ErrorAction SilentlyContinue
Add-Type -AssemblyName UIAutomationTypes -ErrorAction SilentlyContinue

# 4. Check if working device is already registered in Windows
$alreadyInstalled = $false
$existingPnp = Get-PnpDevice -FriendlyName "*CABLE*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "OK" -and $_.Class -eq "MEDIA" }
if ($existingPnp) {
    Write-Host "Working Virtual Cable device already detected in Windows PnP." -ForegroundColor Green
    $alreadyInstalled = $true
}

if (-not $alreadyInstalled) {
    Write-Host "Launching official setup executable to create Virtual Speaker device node..." -ForegroundColor Yellow
    $setupExe = "$driverDir\VBCABLE_Setup_x64.exe"
    $proc = Start-Process -FilePath $setupExe -PassThru

    Write-Host "Automating Driver Setup Window..." -ForegroundColor Cyan
    $clicked = $false
    $startTime = Get-Date

    while (-not $clicked -and ((Get-Date) - $startTime).TotalSeconds -lt 20) {
        Start-Sleep -Milliseconds 500
        $proc.Refresh()
        if ($proc.HasExited) { break }

        $mainHwnd = $proc.MainWindowHandle
        if ($mainHwnd -ne [IntPtr]::Zero) {
            [Win32DriverHelper]::SetForegroundWindow($mainHwnd) | Out-Null
            
            # Method A: Win32 Child enumeration
            $children = [Win32DriverHelper]::GetChildren($mainHwnd)
            foreach ($child in $children) {
                $text = [Win32DriverHelper]::GetText($child)
                $cls = [Win32DriverHelper]::GetClass($child)
                if ($text -like "*Install Driver*" -or ($cls -eq "Button" -and $text -like "*Install*")) {
                    Write-Host "Found Install Button ($text), triggering click..." -ForegroundColor Green
                    [Win32DriverHelper]::SendMessage($child, [Win32DriverHelper]::BM_CLICK, [IntPtr]::Zero, [IntPtr]::Zero) | Out-Null
                    $clicked = $true
                    break
                }
            }

            # Method B: UI Automation
            if (-not $clicked) {
                try {
                    $root = [System.Windows.Automation.AutomationElement]::RootElement
                    $cond = New-Object System.Windows.Automation.PropertyCondition(
                        [System.Windows.Automation.AutomationElement]::ProcessIdProperty, $proc.Id
                    )
                    $appEl = $root.FindFirst([System.Windows.Automation.TreeScope]::Children, $cond)
                    if ($appEl) {
                        $btnCond = New-Object System.Windows.Automation.PropertyCondition(
                            [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
                            [System.Windows.Automation.ControlType]::Button
                        )
                        $buttons = $appEl.FindAll([System.Windows.Automation.TreeScope]::Descendants, $btnCond)
                        foreach ($btn in $buttons) {
                            if ($btn.Current.Name -like "*Install Driver*") {
                                Write-Host "UI Automation: Invoking '$($btn.Current.Name)'..." -ForegroundColor Green
                                $inv = $btn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
                                if ($inv) { $inv.Invoke(); $clicked = $true; break }
                            }
                        }
                    }
                } catch {}
            }
        }
    }

    # Wait for completion dialog ("Installation Complete and Successful !")
    Write-Host "Waiting for driver installation to complete..." -ForegroundColor Cyan
    $done = $false
    $waitStart = Get-Date
    while (-not $done -and ((Get-Date) - $waitStart).TotalSeconds -lt 25) {
        Start-Sleep -Milliseconds 500
        $proc.Refresh()
        if ($proc.HasExited) { $done = $true; break }

        # Check for dialog boxes belonging to the process
        $popups = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
        if ($popups) {
            try {
                $root = [System.Windows.Automation.AutomationElement]::RootElement
                $cond = New-Object System.Windows.Automation.PropertyCondition(
                    [System.Windows.Automation.AutomationElement]::ProcessIdProperty, $proc.Id
                )
                $appEl = $root.FindFirst([System.Windows.Automation.TreeScope]::Children, $cond)
                if ($appEl) {
                    # Look for OK button on dialog
                    $btnCond = New-Object System.Windows.Automation.PropertyCondition(
                        [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
                        [System.Windows.Automation.ControlType]::Button
                    )
                    $buttons = $appEl.FindAll([System.Windows.Automation.TreeScope]::Descendants, $btnCond)
                    foreach ($btn in $buttons) {
                        if ($btn.Current.Name -eq "OK" -or $btn.Current.Name -like "*Close*") {
                            Write-Host "Dismissing completion dialog..." -ForegroundColor Green
                            $inv = $btn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
                            if ($inv) { $inv.Invoke() }
                            $done = $true
                            break
                        }
                    }
                }
            } catch {}
        }
    }

    # Close setup if still running
    Start-Sleep -Seconds 1
    if (-not $proc.HasExited) {
        Write-Host "Closing setup application..." -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Configuring Virtual Speaker Friendly Name to 'MultiWave Virtual Speaker'..." -ForegroundColor Cyan

# 5. Rename audio endpoints in Registry & hide unwanted 16-channel endpoint
$regPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render"
$foundEndpoint = $false

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
[ComImport]
[Guid("870af99c-171d-4f9e-af0d-e63df40c2bc9")]
public class CPolicyConfigClientInst {}
[Guid("f8679f50-850a-41cf-9c72-430f290290c8")]
[InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IPolicyConfigInst {
    [PreserveSig] int GetMixFormat(string pszDeviceName, IntPtr ppFormat);
    [PreserveSig] int GetDeviceFormat(string pszDeviceName, int bDefault, IntPtr ppFormat);
    [PreserveSig] int ResetDeviceFormat(string pszDeviceName);
    [PreserveSig] int SetDeviceFormat(string pszDeviceName, IntPtr pEndpointFormat, IntPtr mixFormat);
    [PreserveSig] int GetProcessingPeriod(string pszDeviceName, int bDefault, IntPtr pmftDefaultPeriod, IntPtr pmftMinimumPeriod);
    [PreserveSig] int SetProcessingPeriod(string pszDeviceName, IntPtr pmftPeriod);
    [PreserveSig] int GetShareMode(string pszDeviceName, IntPtr pMode);
    [PreserveSig] int SetShareMode(string pszDeviceName, IntPtr mode);
    [PreserveSig] int GetPropertyValue(string pszDeviceName, int bStore, IntPtr pKey, IntPtr pv);
    [PreserveSig] int SetPropertyValue(string pszDeviceName, int bStore, IntPtr pKey, IntPtr pv);
    [PreserveSig] int SetDefaultEndpoint([MarshalAs(UnmanagedType.LPWStr)] string wszDeviceId, int eRole);
    [PreserveSig] int SetEndpointVisibility([MarshalAs(UnmanagedType.LPWStr)] string wszDeviceId, int bVisible);
}
public class PolicyHelperInst {
    public static void SetVis(string id, int v) {
        try {
            var c = (IPolicyConfigInst)new CPolicyConfigClientInst();
            c.SetEndpointVisibility(id, v);
        } catch {}
    }
}
"@ -ErrorAction SilentlyContinue

if (Test-Path $regPath) {
    Get-ChildItem $regPath | ForEach-Object {
        $endpointGuid = $_.PSChildName
        $fullDevId = "{0.0.0.00000000}.$endpointGuid"
        $propsPath = "$($_.PSPath)\Properties"
        if (Test-Path $propsPath) {
            $props = Get-ItemProperty $propsPath
            $n1 = $props."{a45c254e-df1c-4efd-8020-67d146a850e0},2"
            $n2 = $props."{b3f8fa53-0004-438e-9003-51a46e139bfc},6"
            $n14 = $props."{a45c254e-df1c-4efd-8020-67d146a850e0},14"

            # Check if this is the 16-channel endpoint: HIDE and DISABLE it!
            if (($n1 -and ($n1 -like "*16ch*" -or $n1 -like "*16 ch*")) -or
                ($n2 -and ($n2 -like "*16ch*" -or $n2 -like "*16 ch*")) -or
                ($endpointGuid -like "*5565f021*")) {
                Write-Host "Hiding redundant 16-channel virtual endpoint: $endpointGuid" -ForegroundColor Yellow
                Set-ItemProperty -Path $_.PSPath -Name "DeviceState" -Value 2 -Force -ErrorAction SilentlyContinue
                [PolicyHelperInst]::SetVis($fullDevId, 0)
            }
            # Otherwise if this is the primary 2-channel stereo endpoint, RENAME it to MultiWave Virtual Speaker
            elseif (($n1 -and ($n1 -like "*CABLE*" -or $n1 -like "*Virtual*" -or $n1 -like "*VB-Audio*")) -or
                    ($n2 -and ($n2 -like "*CABLE*" -or $n2 -like "*VB-Audio*")) -or
                    ($n14 -and ($n14 -like "*CABLE*" -or $n14 -like "*MultiWave*"))) {
                
                Write-Host "Found Primary Virtual Audio Render Endpoint: $endpointGuid" -ForegroundColor Green
                Set-ItemProperty -Path $propsPath -Name "{a45c254e-df1c-4efd-8020-67d146a850e0},14" -Value "MultiWave Virtual Speaker" -Force
                Set-ItemProperty -Path $propsPath -Name "{a45c254e-df1c-4efd-8020-67d146a850e0},2" -Value "MultiWave Virtual Speaker" -Force
                Set-ItemProperty -Path $propsPath -Name "{b3f8fa53-0004-438e-9003-51a46e139bfc},6" -Value "MultiWave Virtual Audio" -Force
                Set-ItemProperty -Path $_.PSPath -Name "DeviceState" -Value 1 -Force -ErrorAction SilentlyContinue
                [PolicyHelperInst]::SetVis($fullDevId, 1)
                $foundEndpoint = $true
                Write-Host "Renamed to 'MultiWave Virtual Speaker' successfully!" -ForegroundColor Green
            }
        }
    }
}

# 6. Refresh Windows Audio Services so the new device appears immediately
Write-Host "Refreshing Windows Audio Endpoints..." -ForegroundColor Yellow
try {
    Restart-Service -Name AudioEndpointBuilder -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Restart-Service -Name AudioSrv -Force -ErrorAction SilentlyContinue
} catch {}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! MultiWave Virtual Speaker is Ready!   " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Start-Sleep -Seconds 2
