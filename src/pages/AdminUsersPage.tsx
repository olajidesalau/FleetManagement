export const AdminUsersPage = ({ users = [] }: { users?: any[] } = {}) => {
  return (
    <div style="padding: 2rem; min-height: 100vh; background: #f5f5f5;">
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h1>👥 Manage Users</h1>
          <a href="/admin/dashboard" style="background: #4db8ff; color: black; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; font-weight: bold;">← Back</a>
        </div>

        {/* Search & Filter */}
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <form method="get" action="/admin/users" style="display: grid; grid-template-columns: 1fr 200px 200px auto; gap: 1rem;">
            <div>
              <input 
                type="text" 
                name="search" 
                placeholder="Search by email or name..." 
                style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>
            <div>
              <select name="role" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <select name="status" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
            <button type="submit" style="background: #4db8ff; color: black; padding: 0.5rem 1rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Filter</button>
          </form>
        </div>

        {/* Users Table */}
        <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Email</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Name</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Role</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Status</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Phone</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Joined</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} style="padding: 2rem; text-align: center; color: #999;">No users found</td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr style="border-bottom: 1px solid #eee; hover:background: #f9f9f9;">
                    <td style="padding: 1rem;">{user.email}</td>
                    <td style="padding: 1rem;">{user.full_name}</td>
                    <td style="padding: 1rem;">
                      <span style={`background: ${['admin', 'fleet_manager', 'Fleet Manager'].includes(String(user.role || '').trim()) ? '#9c27b0' : user.role === 'provider' ? '#4caf50' : '#2196f3'}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem;`}>
                        {user.role}
                      </span>
                    </td>
                    <td style="padding: 1rem;">
                      <span style={`background: ${user.status === 'active' ? '#4caf50' : user.status === 'suspended' ? '#ff9800' : '#f44336'}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem;`}>
                        {user.status}
                      </span>
                    </td>
                    <td style="padding: 1rem;">{user.phone || '-'}</td>
                    <td style="padding: 1rem;">{user.created_at}</td>
                    <td style="padding: 1rem;">
                      <div style="display: flex; gap: 0.5rem;">
                        <a href={`/admin/users/${user.id}`} style="background: #2196f3; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; text-decoration: none; font-size: 0.9rem;">View</a>
                        {user.status === 'active' && (
                          <form method="post" action={`/admin/users/${user.id}/suspend`} style="margin: 0;">
                            <button type="submit" style="background: #ff9800; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Suspend</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
