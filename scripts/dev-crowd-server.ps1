<#
Copyright (c) 2026 Sarah Walsh. All rights reserved.
Proprietary commercial software published for public reference only.
No license is granted to use, copy, modify, distribute, or create derivative works.
#>

<#
Starts the crowd-server for local development.

SQLite-first (no Docker required):
- If DATABASE_URL is NOT set, the server uses SQLite at SQLITE_PATH (default: crowd-server/data/dev.sqlite).
- If DATABASE_URL IS set, the server uses Postgres and runs migrations before starting.

Also generates a dev RSA keypair (for model signing) into crowd-server/.dev-keys/.
#>

$ErrorActionPreference = 'Stop'

$Root = (Resolve-Path "$PSScriptRoot\..\").Path
$ServerDir = Join-Path $Root 'crowd-server'
$KeysDir = Join-Path $ServerDir '.dev-keys'
$PrivateKeyPath = Join-Path $KeysDir 'model-private.pem'
$PublicKeyPath = Join-Path $KeysDir 'model-public.pem'

function Test-CommandExists($name) {
  try {
    $null = Get-Command $name -ErrorAction Stop
    return $true
  } catch {
    return $false
  }
}

# 1) Storage mode
if (-not $Env:SQLITE_PATH) {
  $Env:SQLITE_PATH = (Join-Path $ServerDir 'data\dev.sqlite')
}

if ($Env:DATABASE_URL) {
  Write-Host "Using Postgres (DATABASE_URL is set)."
} else {
  Write-Host "Using SQLite (DATABASE_URL not set). SQLITE_PATH=$Env:SQLITE_PATH"
}

# 2) Generate dev signing keys
if (!(Test-Path $KeysDir)) { New-Item -ItemType Directory -Path $KeysDir | Out-Null }
if (!(Test-Path $PrivateKeyPath) -or !(Test-Path $PublicKeyPath)) {
  Write-Host "Generating dev RSA signing keypair…"
  if (Test-CommandExists 'openssl') {
    & openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out $PrivateKeyPath | Out-Null
    & openssl rsa -in $PrivateKeyPath -pubout -out $PublicKeyPath | Out-Null
  } else {
    # Node.js fallback (no OpenSSL dependency)
    $js = "const { generateKeyPairSync } = require('crypto');" +
      "const fs = require('fs');" +
      "const path = require('path');" +
      "const outPriv = process.argv[1];" +
      "const outPub = process.argv[2];" +
      "if (!outPriv || !outPub) throw new Error('Missing output paths');" +
      "const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });" +
      "fs.mkdirSync(path.dirname(outPriv), { recursive: true });" +
      "fs.writeFileSync(outPriv, privateKey);" +
      "fs.writeFileSync(outPub, publicKey);";
    node -e $js -- $PrivateKeyPath $PublicKeyPath | Out-Null
  }
}

$PrivatePem = Get-Content -Raw $PrivateKeyPath

# 3) Install deps + migrate + start
Write-Host "Installing crowd-server deps…"
Push-Location $ServerDir
npm install | Out-Null

$Env:MODEL_SIGNING_PRIVATE_KEY_PEM = $PrivatePem
$Env:PORT = '8787'

if ($Env:DATABASE_URL) {
  Write-Host "Running migrations (Postgres)…"
  npm run migrate | Out-Null
} else {
  Write-Host "Skipping migrations (SQLite mode auto-creates schema)."
}

Write-Host "Starting crowd-server on http://localhost:8787 …"
Write-Host "Public key (pin this into src/background.js CROWD_MODEL_PUBLIC_KEY_PEM):"
Write-Host (Get-Content -Raw $PublicKeyPath)

npm run dev
Pop-Location
