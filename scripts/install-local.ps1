<#
Copyright (c) 2026 Ryan Walsh. All rights reserved.
Proprietary commercial software published for public reference only.
No license is granted to use, copy, modify, distribute, or create derivative works.
#>

param(
  [switch]$LaunchChrome,
  [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path "$PSScriptRoot\..").Path
$Dist = Join-Path $Root 'dist'
$OutDir = Join-Path $Dist 'local'

function Assert-InRoot {
  param([string]$PathToCheck)
  $resolvedRoot = (Resolve-Path $Root).Path
  $parent = Split-Path -Parent $PathToCheck
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
  $resolvedParent = (Resolve-Path $parent).Path
  if (-not $resolvedParent.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to write outside project root: $PathToCheck"
  }
}

if (-not $SkipTests) {
  & (Join-Path $PSScriptRoot 'test-release.ps1')
}

Write-Host "[install] Generating icons"
node (Join-Path $Root 'scripts\generate-icons.js') | Out-Host

Assert-InRoot $OutDir
if (Test-Path -LiteralPath $OutDir) {
  $resolvedOut = (Resolve-Path $OutDir).Path
  if (-not $resolvedOut.StartsWith((Resolve-Path $Root).Path, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove unexpected path: $resolvedOut"
  }
  Remove-Item -LiteralPath $OutDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $Root 'manifest.json') -Destination $OutDir -Force
Copy-Item -LiteralPath (Join-Path $Root 'src') -Destination (Join-Path $OutDir 'src') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $Root 'images') -Destination (Join-Path $OutDir 'images') -Recurse -Force

Write-Host "[install] Built local extension folder:"
Write-Host "  $OutDir"
Write-Host ""
Write-Host "Manual Chrome install:"
Write-Host "  1. Open chrome://extensions"
Write-Host "  2. Enable Developer mode"
Write-Host "  3. Click Load unpacked"
Write-Host "  4. Select $OutDir"

if ($LaunchChrome) {
  $chromeCandidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
  )
  $chrome = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if (-not $chrome) {
    throw "Chrome executable not found. Load $OutDir manually from chrome://extensions."
  }
  $profile = Join-Path $Root '.chrome-profile'
  New-Item -ItemType Directory -Path $profile -Force | Out-Null
  Start-Process -FilePath $chrome -ArgumentList @(
    "--user-data-dir=$profile",
    "--load-extension=$OutDir",
    "--no-first-run",
    "chrome://extensions"
  )
}

