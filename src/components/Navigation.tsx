export const Navigation = ({ currentUser }: { currentUser?: any } = {}) => {
  return (
    <nav class="topbar">
      <div class="nav-shell">
        <div class="brand-lockup">
          <span class="brand-mark">S</span>
          <span>Snow Fleet <em>Management</em></span>
        </div>
        <div class="primary-nav">
          <a class="active" href="/">Overview</a>
          <a href="/routes">Routes</a>
          <a href="/vehicles">Vehicles</a>
          <a href="/temperature">Temperature</a>
          <a href="/drivers">Drivers</a>
          <a href="/customers">Customers</a>
          <a href="/monitoring">Monitoring</a>
          <a href="/traffic">Traffic</a>
          <a href="/admin/dashboard" data-admin-link="true" hidden>Admin</a>
        </div>
        <div class="user-menu">
          <a class="notification-button" href="/alerts" aria-label="View alerts">●<span>4</span></a>
          {currentUser ? <a class="user-name" href="/profile">{currentUser.email}</a> : <a class="user-name" href="/profile">Fleet Manager</a>}
          <a class="avatar" href="/profile" aria-label="Open my profile">FM</a>
        </div>
      </div>
    </nav>
  )
}
