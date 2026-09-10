const routes = [
  { id: 'SN-204', route: 'Manchester > Leeds', driver: 'Amelia Carter', vehicle: 'SN-14', status: 'On route', temp: '4.2 C', eta: '14:35', progress: '72%' },
  { id: 'SN-205', route: 'Liverpool > Sheffield', driver: 'Marcus Green', vehicle: 'SN-08', status: 'Loading', temp: '3.8 C', eta: '16:10', progress: '28%' },
  { id: 'SN-206', route: 'Birmingham > Nottingham', driver: 'Nia Patel', vehicle: 'SN-22', status: 'On route', temp: '5.1 C', eta: '17:20', progress: '54%' },
]

export const HomePage = ({ currentUser }: { currentUser?: any } = {}) => {
  if (!currentUser) {
    return (
      <div class="public-home">
        <section class="public-home-hero">
          <p class="eyebrow">Snow Fleet Management</p>
          <h1>Coordinate every delivery with confidence.</h1>
          <p>One secure workspace for routes, vehicles, drivers, temperature-sensitive freight, and customer communication.</p>
          <div class="public-home-actions">
            <a class="button button-primary" href="/auth/login">Login</a>
            <a class="button button-secondary" href="/auth/register">Create an account</a>
          </div>
        </section>
        <section class="public-home-points" aria-label="Platform capabilities">
          <article><strong>Fleet visibility</strong><span>See routes, vehicles, and cold-chain status in one place.</span></article>
          <article><strong>Secure communication</strong><span>Keep driver, customer, and operations conversations together.</span></article>
          <article><strong>Operational control</strong><span>Manage delivery evidence, alerts, and driver information securely.</span></article>
        </section>
      </div>
    )
  }
  const firstName = currentUser?.full_name?.trim().split(/\s+/)[0] || 'Fleet Manager'
  const greeting = `Welcome back, ${firstName}`
  return (
    <div class="fleet-dashboard">
      <section class="dashboard-header">
        <div>
          <p class="eyebrow">Operations overview / <span data-current-date>Loading date...</span></p>
          <h1>{greeting}</h1>
          <p class="fleet-slogan">Snow Logistics Limited, Delivering Confidence. Preserving Quality.</p>
          <p class="header-copy">A live view of every route, vehicle and temperature-sensitive delivery.</p>
        </div>
        <div class="header-actions">
          <span class="sync-status"><span class="status-dot status-dot-live"></span>Live data · <span data-current-time>--:--</span></span>
          <a class="button button-primary" href="/routes/new">+ Allocate route</a>
        </div>
      </section>

      <section class="metric-grid" aria-label="Fleet summary">
        <article class="metric-card metric-card-accent"><span class="metric-label">Active routes</span><strong>24</strong><span class="metric-note metric-positive">+3 since yesterday</span></article>
        <article class="metric-card"><span class="metric-label">Vehicles online</span><strong>31 <small>/ 34</small></strong><span class="metric-note">91% fleet availability</span></article>
        <article class="metric-card"><span class="metric-label">Temperature alerts</span><strong class="metric-alert">02</strong><span class="metric-note metric-negative">Needs attention now</span></article>
        <article class="metric-card"><span class="metric-label">On-time delivery</span><strong>96.4%</strong><span class="metric-note metric-positive">+1.8% this week</span></article>
      </section>

      <div class="dashboard-columns">
        <section class="panel route-panel">
          <div class="panel-heading"><div><p class="eyebrow">Live operations</p><h2>Routes in progress</h2></div><a class="text-link" href="/routes">View all routes <span>→</span></a></div>
          <div class="route-list">
            {routes.map(route => (
              <a class="route-row" href={`/routes/${route.id}`}>
                <div class="route-id">{route.id}<span class="route-status"><span class="status-dot"></span>{route.status}</span></div>
                <div class="route-main"><strong>{route.route}</strong><span>{route.driver} · {route.vehicle}</span><div class="progress-track"><span style={`width: ${route.progress}`}></span></div></div>
                <div class="route-meta"><strong>{route.eta}</strong><span>{route.temp}</span></div>
              </a>
            ))}
          </div>
        </section>

        <section class="panel alert-panel">
          <div class="panel-heading"><div><p class="eyebrow">Requires attention</p><h2>Live alerts <span class="count-badge">4</span></h2></div><a class="text-link" href="/alerts">All alerts <span>→</span></a></div>
          <div class="alert-list">
            <a class="alert-item alert-critical" href="/alerts/temperature"><span class="alert-icon">!</span><span><strong>Temperature rising</strong><small>SN-19 · 8.7 C · 4 min ago</small></span><span class="alert-arrow">→</span></a>
            <a class="alert-item alert-warning" href="/alerts/traffic"><span class="alert-icon">!</span><span><strong>Traffic disruption</strong><small>M62 eastbound · Route SN-204</small></span><span class="alert-arrow">→</span></a>
            <a class="alert-item" href="/alerts/vehicle"><span class="alert-icon">i</span><span><strong>Vehicle service due</strong><small>SN-11 · service in 120 miles</small></span><span class="alert-arrow">→</span></a>
          </div>
        </section>
      </div>

      <section class="bottom-grid">
        <article class="panel temperature-panel"><div class="panel-heading"><div><p class="eyebrow">Cold chain</p><h2>Fleet temperature</h2></div><a class="text-link" href="/temperature">Open monitor <span>→</span></a></div><div class="temperature-summary"><div class="temperature-gauge"><span>4.6</span><small>average C</small></div><div class="temperature-copy"><strong>29 vehicles within range</strong><div class="mini-bar"><span></span></div><small>Target range 2 C to 8 C</small></div></div></article>
        <article class="panel activity-panel"><div class="panel-heading"><div><p class="eyebrow">Network activity</p><h2>Today at a glance</h2></div><a class="text-link" href="/monitoring">Monitoring <span>→</span></a></div><div class="activity-stats"><div><strong>18</strong><span>Deliveries complete</span></div><div><strong>07</strong><span>Routes awaiting driver</span></div><div><strong>03</strong><span>New customer requests</span></div></div></article>
      </section>
    </div>
  )
}
