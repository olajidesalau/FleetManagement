export const Navigation = ({ currentUser }: { currentUser?: any } = {}) => {
  const normalizedRole = String(currentUser?.role || '').trim().toLowerCase().replace(/\s+/g, '_')
  const canAccessAdmin = ['admin', 'fleet_manager'].includes(normalizedRole)
  return (
    <nav class="topbar">
      <div class="nav-shell">
        <div class="brand-lockup">
          <span class="brand-mark">S</span>
          <span>Snow Fleet <em>Management</em></span>
        </div>
        <div class="primary-nav">
          {currentUser ? <>
            <a class="active" href="/">Overview</a>
            <a href="/routes">Routes</a>
            <a href="/vehicles">Vehicles</a>
            <a href="/temperature">Temperature</a>
            <a href="/drivers">Drivers</a>
            <a href="/customers">Customers</a>
            <a href="/alerts">Alerts</a>
            <a href="/monitoring">Monitoring</a>
            <a href="/traffic">Traffic</a>
            <a href="/messages">Messages</a>
            {canAccessAdmin && <a href="/admin/dashboard">Admin</a>}
          </> : <a class="active" href="/">Home</a>}
        </div>
        <div class="user-menu">
          {currentUser ? <>
            <a class="notification-button" href="/alerts" aria-label="View alerts">●<span>4</span></a>
            <a class="user-name" href="/profile">{currentUser.email}</a>
            <a class="avatar" href="/profile" aria-label="Open my profile">FM</a>
          </> : <><a class="user-name" href="/auth/login">Login</a><a class="button button-primary" href="/auth/register">Register</a></>}
        </div>
      </div>
    </nav>
  )
}
