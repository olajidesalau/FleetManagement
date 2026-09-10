export const AdminDashboardPage = ({ stats = {} }: { stats?: any } = {}) => {
  const metrics = [
    { label: 'Active routes', value: stats.active_routes || 0, note: 'Routes not yet delivered' },
    { label: 'Vehicles online', value: stats.vehicles_online || 0, note: 'Available fleet vehicles' },
    { label: 'Registered drivers', value: stats.drivers || 0, note: 'Driver records' },
    { label: 'Open alerts', value: stats.open_alerts || 0, note: 'Requires attention' },
    { label: 'Fleet customers', value: stats.customers || 0, note: 'Active customer accounts' },
    { label: 'Completed deliveries', value: stats.completed_deliveries || 0, note: 'Delivery records completed' },
  ]

  return (
    <div class="fleet-dashboard admin-fleet-dashboard">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Fleet control centre</p>
          <h1>Admin dashboard</h1>
          <p class="header-copy">Manage the fleet operation, driver records, delivery routes, and cold-chain performance.</p>
        </div>
        <div class="header-actions"><a class="button button-primary" href="/routes/new">Allocate route</a></div>
      </div>
      <section class="metric-grid" aria-label="Fleet administration summary">
        {metrics.map(metric => <article class="metric-card"><span class="metric-label">{metric.label}</span><strong>{metric.value}</strong><span class="metric-note">{metric.note}</span></article>)}
      </section>
      <section class="panel">
        <div class="panel-heading"><div><p class="eyebrow">Fleet administration</p><h2>Operational controls</h2></div></div>
        <div class="admin-action-grid">
          <a class="button button-primary" href="/admin/drivers">Manage drivers</a>
          <a class="button button-secondary" href="/vehicles">Manage vehicles</a>
          <a class="button button-secondary" href="/routes">Manage routes</a>
          <a class="button button-secondary" href="/customers">Manage customers</a>
          <a class="button button-secondary" href="/temperature">Temperature monitor</a>
          <a class="button button-secondary" href="/monitoring">Fleet monitoring</a>
          <a class="button button-secondary" href="/traffic">Traffic manager</a>
          <a class="button button-secondary" href="/alerts">Review alerts</a>
          <a class="button button-secondary" href="/messages">Fleet messages</a>
        </div>
      </section>
    </div>
  )
}
