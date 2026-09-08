export const AdminDashboardPage = ({ stats = {} }: { stats?: any } = {}) => {
  return (
    <div style="padding: 2rem; min-height: 100vh; background: #f5f5f5;">
      <div style="max-width: 1400px; margin: 0 auto;">
        <h1>📊 Admin Dashboard</h1>

        {/* Stats Grid */}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #2196f3;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">TOTAL USERS</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">{stats.total_users || 0}</p>
            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">Customers, Providers, Admins</p>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">APPROVED PROVIDERS</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">{stats.approved_providers || 0}</p>
            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">Active service providers</p>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #ff9800;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">PENDING APPROVALS</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">{stats.pending_approvals || 0}</p>
            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">Awaiting review</p>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #9c27b0;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">TOTAL BOOKINGS</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">{stats.total_bookings || 0}</p>
            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">All time</p>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">COMPLETED BOOKINGS</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">{stats.completed_bookings || 0}</p>
            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">Finished jobs</p>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #2196f3;">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">PLATFORM REVENUE</p>
            <p style="margin: 0; font-size: 2.5rem; font-weight: bold;">£{stats.platform_revenue || 0}</p>
            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">15% commission</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <h2 style="margin: 0 0 1rem 0;">⚡ Quick Actions</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <a href="/admin/users" style="background: #2196f3; color: white; padding: 1rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold;">👥 Manage Users</a>
            <a href="/admin/providers" style="background: #4caf50; color: white; padding: 1rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold;">🏢 Approve Providers</a>
            <a href="/admin/bookings" style="background: #ff9800; color: white; padding: 1rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold;">📅 View All Bookings</a>
            <a href="/admin/stats" style="background: #9c27b0; color: white; padding: 1rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold;">📈 Detailed Stats</a>
            <a href="/temperature" style="background: #007f82; color: white; padding: 1rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold;">🌡 Temperature Monitor</a>
          </div>
        </div>

        {/* Recent Activity */}
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 1rem 0;">📋 Recent Activity</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #eee;">
                <th style="text-align: left; padding: 0.5rem; color: #999;">Type</th>
                <th style="text-align: left; padding: 0.5rem; color: #999;">User</th>
                <th style="text-align: left; padding: 0.5rem; color: #999;">Details</th>
                <th style="text-align: left; padding: 0.5rem; color: #999;">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.75rem 0.5rem;">✨ Provider Approved</td>
                <td style="padding: 0.75rem 0.5rem;">Sarah Johnson</td>
                <td style="padding: 0.75rem 0.5rem;">Cleaning Services</td>
                <td style="padding: 0.75rem 0.5rem;">Today 10:30 AM</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.75rem 0.5rem;">📅 Booking Completed</td>
                <td style="padding: 0.75rem 0.5rem;">John Smith</td>
                <td style="padding: 0.75rem 0.5rem;">Plumbing Service</td>
                <td style="padding: 0.75rem 0.5rem;">Yesterday 3:15 PM</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.75rem 0.5rem;">👤 New User</td>
                <td style="padding: 0.75rem 0.5rem;">Mary Jones</td>
                <td style="padding: 0.75rem 0.5rem;">Customer Account</td>
                <td style="padding: 0.75rem 0.5rem;">2 days ago</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.75rem 0.5rem;">💳 Payment Received</td>
                <td style="padding: 0.75rem 0.5rem;">Platform</td>
                <td style="padding: 0.75rem 0.5rem;">Commission: £10.50</td>
                <td style="padding: 0.75rem 0.5rem;">3 days ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
