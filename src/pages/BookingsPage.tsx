export const BookingsPage = ({ bookings = [], userRole = 'customer' }: { bookings?: any[]; userRole?: string } = {}) => {
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
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1>📅 {userRole === 'provider' ? 'My Bookings (Provider)' : 'My Bookings (Customer)'}</h1>

        {bookings.length === 0 ? (
          <div style="background: white; padding: 2rem; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 1.1rem; color: #666;">No bookings yet.</p>
            <a href="/providers/search" style="color: #4db8ff; text-decoration: none;">Search for services</a>
          </div>
        ) : (
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
            {bookings.map((booking: any) => (
              <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                  <h3 style="margin: 0;">{booking.service_name || 'Service'}</h3>
                  <span style={`background: ${getStatusColor(booking.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem;`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div style="margin: 1rem 0; padding: 1rem 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                  <p style="margin: 0.5rem 0;"><strong>📅 Date:</strong> {booking.booking_date}</p>
                  <p style="margin: 0.5rem 0;"><strong>⏰ Time:</strong> {booking.booking_time || 'TBD'}</p>
                  <p style="margin: 0.5rem 0;"><strong>📍 Location:</strong> {booking.address}</p>
                  <p style="margin: 0.5rem 0;"><strong>💷 Price:</strong> £{booking.service_price}</p>
                  <p style="margin: 0.5rem 0;"><strong>🏪 Platform Fee:</strong> £{booking.platform_fee}</p>
                  <p style="margin: 0.5rem 0;"><strong>💰 Total:</strong> £{booking.service_price + booking.platform_fee}</p>
                </div>

                {booking.special_instructions && (
                  <p style="margin: 1rem 0; padding: 0.5rem; background: #f9f9f9; border-radius: 4px; font-size: 0.9rem;">
                    <strong>Notes:</strong> {booking.special_instructions}
                  </p>
                )}

                <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                  <a href={`/bookings/${booking.id}`} style="background: #4db8ff; color: black; padding: 0.5rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold; font-size: 0.9rem;">View Details</a>
                  {booking.status === 'completed' && (
                    <a href={`/reviews/create?booking=${booking.id}`} style="background: #4caf50; color: white; padding: 0.5rem; border-radius: 4px; text-decoration: none; text-align: center; font-weight: bold; font-size: 0.9rem;">Leave Review</a>
                  )}
                  {booking.status === 'pending' && (
                    <form method="post" action={`/api/bookings/${booking.id}/cancel`} style="margin: 0;">
                      <button type="submit" style="width: 100%; background: #f44336; color: white; padding: 0.5rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.9rem;">Cancel</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
