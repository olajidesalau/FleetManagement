module.exports = {
  apps: [
    {
      name: 'snow-fleet-management',
      script: 'npx',
      args: 'wrangler pages dev dist --config wrangler.fleet.jsonc --d1=snow-fleet-management-data --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
