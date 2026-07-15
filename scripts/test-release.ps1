<#
Copyright (c) 2026 Sarah Walsh. All rights reserved.
Proprietary commercial software published for public reference only.
No license is granted to use, copy, modify, distribute, or create derivative works.
#>

param(
  [switch]$WithCrowdServerSelfTest,
  [switch]$SkipAudit
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path "$PSScriptRoot\..").Path

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Block
  )
  Write-Host "[test] $Name"
  & $Block
}

function Invoke-External {
  param(
    [string]$FilePath,
    [string[]]$Arguments = @(),
    [string]$WorkingDirectory = ''
  )

  if ($WorkingDirectory) {
    Push-Location $WorkingDirectory
    try {
      & $FilePath @Arguments | Out-Host
      if ($LASTEXITCODE -ne 0) {
        throw "$FilePath $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
      }
    } finally {
      Pop-Location
    }
  } else {
    & $FilePath @Arguments | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "$FilePath $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
  }
}

Invoke-Step "Node is available" {
  Invoke-External node @('--version')
}

Invoke-Step "JavaScript syntax" {
  $files = Get-ChildItem -LiteralPath $Root -Recurse -File |
    Where-Object { $_.Extension -eq '.js' } |
    Where-Object { $_.FullName -notmatch '\\node_modules\\|\\dist\\|\\.tmp\\|\\.chrome-profile\\' }
  foreach ($file in $files) {
    Invoke-External node @('--check', $file.FullName)
  }
}

Invoke-Step "Release gates" {
  Invoke-External node @((Join-Path $Root 'test\release-gates.test.js'))
}

Invoke-Step "Unit tests" {
  Invoke-External node @((Join-Path $Root 'test\unit.test.js'))
}

Invoke-Step "Integration tests" {
  Invoke-External node @((Join-Path $Root 'test\integration.test.js'))
}

if (-not $SkipAudit) {
  Invoke-Step "Crowd server dependency audit" {
    Invoke-External npm @('audit', '--omit=dev') (Join-Path $Root 'crowd-server')
  }
}

if ($WithCrowdServerSelfTest) {
  Invoke-Step "Crowd server selftest" {
    $serverRoot = Join-Path $Root 'crowd-server'
    $tmpDir = Join-Path $Root '.tmp'
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    Push-Location $serverRoot
    try {
      if (-not (Test-Path -LiteralPath (Join-Path $serverRoot 'node_modules'))) {
        Invoke-External npm @('ci') $serverRoot
      }

      $privateKey = node -e "const {generateKeyPairSync}=require('crypto'); const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048}); process.stdout.write(privateKey.export({type:'pkcs8',format:'pem'}).replace(/\r?\n/g, '\\n'));"
      $port = 18787
      $env:MODEL_SIGNING_PRIVATE_KEY_PEM = $privateKey
      $env:SQLITE_PATH = Join-Path $tmpDir 'crowd-test.sqlite'
      $env:PORT = [string]$port
      $env:CROWD_ENDPOINT = "http://localhost:$port"

      $stdout = Join-Path $tmpDir 'crowd-server.out.log'
      $stderr = Join-Path $tmpDir 'crowd-server.err.log'
      $proc = Start-Process -FilePath node -ArgumentList 'src/index.js' -WorkingDirectory $serverRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
      try {
        $ready = $false
        for ($i = 0; $i -lt 30; $i++) {
          Start-Sleep -Milliseconds 500
          if ($proc.HasExited) {
            $outText = if (Test-Path -LiteralPath $stdout) { Get-Content -Raw -LiteralPath $stdout } else { '' }
            $errText = if (Test-Path -LiteralPath $stderr) { Get-Content -Raw -LiteralPath $stderr } else { '' }
            throw "Crowd server exited early with code $($proc.ExitCode)`n$outText`n$errText"
          }
          try {
            Invoke-RestMethod -Uri "$($env:CROWD_ENDPOINT)/healthz" -TimeoutSec 2 | Out-Null
            $ready = $true
            break
          } catch {
            # keep waiting
          }
        }
        if (-not $ready) {
          $outText = if (Test-Path -LiteralPath $stdout) { Get-Content -Raw -LiteralPath $stdout } else { '' }
          $errText = if (Test-Path -LiteralPath $stderr) { Get-Content -Raw -LiteralPath $stderr } else { '' }
          throw "Crowd server did not become ready`n$outText`n$errText"
        }
        Invoke-External npm @('run', 'selftest') $serverRoot
      } finally {
        if ($proc -and -not $proc.HasExited) {
          Stop-Process -Id $proc.Id -Force
        }
      }
    } finally {
      Remove-Item Env:\MODEL_SIGNING_PRIVATE_KEY_PEM -ErrorAction SilentlyContinue
      Remove-Item Env:\SQLITE_PATH -ErrorAction SilentlyContinue
      Remove-Item Env:\PORT -ErrorAction SilentlyContinue
      Remove-Item Env:\CROWD_ENDPOINT -ErrorAction SilentlyContinue
      Pop-Location
    }
  }
}

Write-Host "[test] all release checks passed"
