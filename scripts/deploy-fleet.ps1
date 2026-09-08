$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$staging = Join-Path $env:TEMP "snow-fleet-pages-$([guid]::NewGuid().ToString('N'))"

try {
  if (Test-Path $staging) {
    Remove-Item $staging -Recurse -Force
  }

  New-Item -ItemType Directory -Path (Join-Path $staging 'dist') -Force | Out-Null
  Copy-Item (Join-Path $root 'dist\*') (Join-Path $staging 'dist') -Recurse -Force
  Copy-Item (Join-Path $root 'wrangler.fleet.jsonc') (Join-Path $staging 'wrangler.jsonc') -Force

  Push-Location $staging
  npx wrangler pages deploy dist --project-name snow-fleet-management
}
finally {
  Pop-Location
  if (Test-Path $staging) {
    Remove-Item $staging -Recurse -Force
  }
}
