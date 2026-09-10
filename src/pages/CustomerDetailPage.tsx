export const CustomerDetailPage = ({ customer, routes = [], isAdmin = false }: { customer?: any; routes?: any[]; isAdmin?: boolean }) => {
  const routeCount = routes.length
  const activeRoutes = routes.filter(route => !['delivered', 'cancelled'].includes(route.status)).length
  return (
    <div class="fleet-dashboard customer-detail-page">
      <div class="page-heading">
        <div><p class="eyebrow">Fleet management / customer detail</p><h1>{customer?.full_name || customer?.email || 'Customer'}</h1><p class="header-copy">Review customer contact information, delivery requirements, and route history.</p></div>
        <div class="header-actions"><a class="button button-secondary" href="/customers">All customers</a>{isAdmin && <a class="button button-primary" href={`/customers/${encodeURIComponent(customer.reference)}/edit`}>Edit customer</a>}</div>
      </div>
      <section class="metric-grid">
        <article class="metric-card metric-card-accent"><span class="metric-label">Customer status</span><strong>{customer?.status || 'active'}</strong><span class="metric-note">Account status</span></article>
        <article class="metric-card"><span class="metric-label">Total routes</span><strong>{routeCount}</strong><span class="metric-note">Linked delivery routes</span></article>
        <article class="metric-card"><span class="metric-label">Active routes</span><strong>{activeRoutes}</strong><span class="metric-note">Not yet delivered</span></article>
        <article class="metric-card"><span class="metric-label">Postcode</span><strong>{customer?.postcode || 'N/A'}</strong><span class="metric-note">Delivery area</span></article>
      </section>
      <div class="detail-grid">
        <section class="panel detail-panel"><div class="panel-heading"><div><p class="eyebrow">Customer record</p><h2>Contact details</h2></div><span class="pill pill-green">{customer?.role || 'customer'}</span></div><div class="detail-facts"><div><span>Organisation</span><strong>{customer?.full_name || 'Not recorded'}</strong></div><div><span>Email</span><strong>{customer?.email || 'Not recorded'}</strong></div><div><span>Phone</span><strong>{customer?.phone || 'Not recorded'}</strong></div><div><span>Postcode</span><strong>{customer?.postcode || 'Not recorded'}</strong></div><div><span>Registered</span><strong>{customer?.created_at || 'Not recorded'}</strong></div></div></section>
        <section class="panel detail-panel"><div class="panel-heading"><div><p class="eyebrow">Delivery requirements</p><h2>Route history</h2></div></div>{routes.length ? <div class="conversation-list">{routes.map(route => <a class="conversation-list-item" href={`/routes/${route.route_reference}`}><span class="conversation-avatar">R</span><span class="conversation-summary"><strong>{route.route_reference}</strong><span>{route.origin} to {route.destination}</span></span><span class="conversation-meta"><small>{route.status}</small></span></a>)}</div> : <div class="messages-empty"><strong>No routes linked</strong><span>Routes allocated to this customer will appear here.</span></div>}</section>
      </div>
    </div>
  )
}
