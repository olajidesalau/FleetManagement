export const NotificationsPage = ({ notifications = [] }: { notifications?: any[] } = {}) => {
  const getNotificationIcon = (type: string) => {
    const icons: any = {
      booking_created: '📅',
      booking_confirmed: '✅',
      booking_completed: '🎉',
      payment_received: '💰',
      review_received: '⭐',
      message_received: '💬',
      provider_approved: '✨',
    }
    return icons[type] || '🔔'
  }

  const getNotificationColor = (type: string) => {
    const colors: any = {
      booking_created: '#2196f3',
      booking_confirmed: '#4caf50',
      booking_completed: '#8bc34a',
      payment_received: '#4caf50',
      review_received: '#ff9800',
      message_received: '#2196f3',
      provider_approved: '#9c27b0',
    }
    return colors[type] || '#999'
  }

  return (
    <div style="padding: 2rem; min-height: 100vh; background: #f5f5f5;">
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h1>🔔 Notifications</h1>
          {notifications.some((n: any) => !n.is_read) && (
            <form method="post" action="/api/notifications/read-all" style="margin: 0;">
              <button type="submit" style="background: #4db8ff; color: black; padding: 0.5rem 1rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Mark All as Read</button>
            </form>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style="background: white; padding: 2rem; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 1.1rem; color: #666;">No notifications yet.</p>
          </div>
        ) : (
          <div style="display: grid; gap: 1rem;">
            {notifications.map((notification: any) => (
              <div style={`background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid ${getNotificationColor(notification.type)}; opacity: ${notification.is_read ? 0.7 : 1};`}>
                <div style="display: flex; align-items: start; gap: 1rem;">
                  <span style="font-size: 1.5rem;">{getNotificationIcon(notification.type)}</span>
                  <div style="flex: 1;">
                    <h3 style="margin: 0 0 0.5rem 0;">{notification.title}</h3>
                    <p style="margin: 0; color: #666;">{notification.message}</p>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #999;">{notification.created_at}</p>
                  </div>
                  {!notification.is_read && (
                    <form method="post" action="/api/notifications/read-all" style="margin: 0;">
                      <button type="submit" style="background: #e3f2fd; color: #2196f3; padding: 0.25rem 0.75rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Mark Read</button>
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
