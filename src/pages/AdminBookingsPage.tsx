export const AdminBookingsPage = ({ bookings = [] }: { bookings?: any[] } = {}) => {
  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      in_progress: '#9c27b0',
      completed: '#4caf50',
      cancelled: '#f44336',
    }
    return colors[status] || '#999'
  }

  return (
    <div style="padding: 2rem; min-height: 100vh; background: #f5f5f5;">
      <div style="max-width: 1400px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h1>📅 All Bookings</h1>
          <a href="/admin/dashboard" style="background: #4db8ff; color: black; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; font-weight: bold;">← Back</a>
        </div>

        {/* Stats */}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">TOTAL</p>
            <p style="margin: 0; font-size: 1.8rem; font-weight: bold;">{bookings.length}</p>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">PENDING</p>
            <p style="margin: 0; font-size: 1.8rem; font-weight: bold;">{bookings.filter((b: any) => b.status === 'pending').length}</p>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">CONFIRMED</p>
            <p style="margin: 0; font-size: 1.8rem; font-weight: bold;">{bookings.filter((b: any) => b.status === 'confirmed').length}</p>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">COMPLETED</p>
            <p style="margin: 0; font-size: 1.8rem; font-weight: bold;">{bookings.filter((b: any) => b.status === 'completed').length}</p>
          </div>
          <div style="background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0; color: #999; font-size: 0.9rem;">CANCELLED</p>
            <p style="margin: 0; font-size: 1.8rem; font-weight: bold;">{bookings.filter((b: any) => b.status === 'cancelled').length}</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Booking ID</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Customer</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Provider</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Service</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Date</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Status</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Amount</th>
                <th style="text-align: left; padding: 1rem; color: #999; font-weight: bold;">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style="padding: 2rem; text-align: center; color: #999;">No bookings found</td>
                </tr>
              ) : (
                bookings.map((booking: any) => (
                  <tr style="border-bottom: 1px solid #eee; hover:background: #f9f9f9;">
                    <td style="padding: 1rem;"><strong>#{booking.id}</strong></td>
                    <td style="padding: 1rem;">{booking.customer_name}</td>
                    <td style="padding: 1rem;">{booking.provider_name}</td>
                    <td style="padding: 1rem;">{booking.service_name}</td>
                    <td style="padding: 1rem;">{booking.booking_date}</td>
                    <td style="padding: 1rem;">
                      <span style={`background: ${getStatusColor(booking.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem;`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style="padding: 1rem;">£{booking.service_price}</td>
                    <td style="padding: 1rem;">
                      <a href={`/bookings/${booking.id}`} style="background: #2196f3; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; text-decoration: none; font-size: 0.9rem;">View</a>
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
