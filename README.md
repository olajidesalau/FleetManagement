# Snow Fleet Management

Snow Fleet Management is a Cloudflare Pages and D1 operations portal for Snow Logistics. It helps fleet managers coordinate cold-chain deliveries, allocate routes, monitor vehicles, manage drivers and customers, evaluate traffic, and respond to operational alerts.

## Product Scope

The portal is designed around these fleet workflows:

- Discover upcoming UK cold-chain delivery opportunities
- Prioritise route opportunities in North West England
- Allocate routes to drivers and vehicles
- Register vehicles, drivers, and affiliated customers
- Monitor refrigerated vehicle temperatures
- Track route progress, ETA, and delivery activity
- Compare Waze and Google Maps traffic conditions
- Detect disruption and recommend alternative routes
- Review alerts for temperature, traffic, vehicle, and route issues
- Monitor delivery, driver, route, and cold-chain performance
- Keep route activity history for operational review

## Main Pages

| Page | URL | Purpose |
|---|---|---|
| Overview | `/` | Live fleet operations dashboard |
| Routes | `/routes` | Scheduled routes and delivery progress |
| Route detail | `/routes/:routeId` | Timeline, driver, vehicle, and route controls |
| Route scanning | `/routes/scan` | Scan UK cold-chain opportunities with North West priority |
| Allocate route | `/routes/new` | Create a route and assign operational resources |
| Vehicles | `/vehicles` | Vehicle readiness and cold-chain status |
| Register vehicle | `/vehicles/new` | Add transport and temperature limits |
| Drivers | `/drivers` | Driver roster and assignments |
| Register driver | `/drivers/new` | Add driver licence and availability details |
| Customers | `/customers` | Affiliated customer directory |
| Register customer | `/customers/new` | Add a customer and delivery contact details |
| Alerts | `/alerts` | Active operational alerts |
| Temperature monitor | `/temperature` | Fleet temperature view |
| Traffic manager | `/traffic` | Compare Waze and Google traffic conditions |
| Monitoring | `/monitoring` | Operational performance metrics |

## Route Scanning

The route scanner checks configured cold-chain sources across the United Kingdom and prioritises North West England by default. Results include:

- Cold-chain logistics company
- Customer and service requirement
- Origin and destination
- Delivery timing and distance
- Driver or vehicle fit
- Priority region and ranking

The page runs an initial scan on load and refreshes every 10 minutes.

API endpoint:

```text
POST /api/fleet/routes/scan
```

Example request:

```json
{
  "source": "all",
  "region": "north_west",
  "window": "7"
}
```

## Traffic Management

Traffic Manager evaluates selected routes against Waze and Google Maps adapters. It reports delays, incidents, disruption severity, and the fastest available alternative route. Traffic evaluations refresh every 10 minutes while the page is open.

API endpoint:

```text
POST /api/fleet/traffic/scan
```

Provider configuration is optional. Without credentials, the application uses its safe demo evaluation mode. Configure live providers with:

```powershell
npm run configure:traffic
```

The supported Cloudflare secrets are:

- `WAZE_TRAFFIC_URL`
- `WAZE_API_KEY`
- `GOOGLE_ROUTES_URL`
- `GOOGLE_MAPS_API_KEY`

The default Google Routes endpoint is:

```text
https://routes.googleapis.com/directions/v2:computeRoutes
```

## Fleet Registration

The following forms write to the isolated fleet D1 database:

- `POST /api/fleet/routes`
- `POST /api/fleet/vehicles`
- `POST /api/fleet/drivers`
- `POST /api/fleet/customers`

Route creation also records a `created` event in `route_activity_history`.

## Database

The fleet database is Cloudflare D1 database `snow-fleet-management-data`. The fleet migration creates:

- `drivers`
- `vehicles`
- `fleet_routes`
- `temperature_readings`
- `alerts`
- `route_activity_history`

The active fleet binding is defined in `wrangler.fleet.jsonc`.

## Local Development

Install dependencies:

```powershell
npm install
```

Build the application:

```powershell
npm run build
```

Run the Pages app locally:

```powershell
npm run dev:fleet
```

Run locally with the fleet D1 binding:

```powershell
npm run dev:fleet:d1
```

Apply local fleet migrations:

```powershell
npm run db:migrate:fleet:local
```

Apply fleet migrations to the remote fleet D1 database:

```powershell
npm run db:migrate:fleet
```

## Deployment

The fleet application is deployed as its own Cloudflare Pages project:

```text
snow-fleet-management
```

Deploy it with:

```powershell
npm run deploy:fleet
```

The deployment script uses `scripts/deploy-fleet.ps1` and `wrangler.fleet.jsonc` so the fleet project and fleet database remain isolated from other Cloudflare applications.

## Repository

GitHub repository:

```text
https://github.com/olajidesalau/FleetManagement
```
