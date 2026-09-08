export const Navigation = ({ currentUser }: { currentUser?: any } = {}) => {
  return (
    <nav class="topbar">
      <div class="brand-lockup">
        <span class="brand-mark">S</span>
        <span>Snow Fleet <em>Management</em></span>
      </div>
      <div class="primary-nav">
        <a class="active" href="/">Overview</a>
        <a href="/routes">Routes</a>
        <a href="/vehicles">Vehicles</a>
        <a href="/drivers">Drivers</a>
        <a href="/customers">Customers</a>
        <a href="/monitoring">Monitoring</a>
        <a href="/traffic">Traffic</a>
      </div>
      <div class="user-menu">
        <a class="notification-button" href="/alerts" aria-label="View alerts">●<span>4</span></a>
        {currentUser ? <span class="user-name">{currentUser.email}</span> : <span class="user-name">Fleet Manager</span>}
        <span class="avatar">FM</span>
      </div>
    </nav>
  )
}
