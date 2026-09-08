$ErrorActionPreference = 'Stop'

$project = 'snow-fleet-management'
$secrets = @(
  'WAZE_TRAFFIC_URL',
  'WAZE_API_KEY',
  'GOOGLE_ROUTES_URL',
  'GOOGLE_MAPS_API_KEY'
)

Write-Host "Configuring traffic provider secrets for $project. Values are entered directly into Wrangler prompts."
foreach ($secret in $secrets) {
  Write-Host "Setting $secret"
  npx wrangler pages secret put $secret --project-name $project
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to configure $secret"
  }
}

Write-Host 'Traffic provider secrets configured. Run npm run deploy:fleet to publish the updated worker.'
