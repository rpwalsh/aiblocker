<#
Copyright (c) 2026 Sarah Walsh. All rights reserved.
Proprietary commercial software published for public reference only.
No license is granted to use, copy, modify, distribute, or create derivative works.
#>

<#
Build a clean ZIP of the local unpacked extension.
- Generates icon PNGs into images/
- Copies only extension files into dist/webstore/
- Produces dist/aiblocker-local.zip

Note: This does not run a bundler; the extension is plain JS/CSS/HTML.
#>

$ErrorActionPreference = 'Stop'

$Root = (Resolve-Path "$PSScriptRoot\..\").Path
$Dist = Join-Path $Root 'dist'
$OutDir = Join-Path $Dist 'local'
$ZipPath = Join-Path $Dist 'aiblocker-local.zip'

# Generate icons (ensures manifest icons exist)
Write-Host "Generating icons…"
node (Join-Path $Root 'scripts\generate-icons.js')

# Fresh dist
if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Path $OutDir | Out-Null

# Copy required extension files
Copy-Item (Join-Path $Root 'manifest.json') -Destination $OutDir
Copy-Item (Join-Path $Root 'src') -Destination (Join-Path $OutDir 'src') -Recurse
Copy-Item (Join-Path $Root 'images') -Destination (Join-Path $OutDir 'images') -Recurse

# Optional: include docs users may want in package? (Web Store doesn't need them)
# Copy-Item (Join-Path $Root 'README.md') -Destination $OutDir

# Create zip
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($OutDir, $ZipPath)

Write-Host "Created: $ZipPath"
Write-Host "For manual Chrome install, load unpacked from: $OutDir"
