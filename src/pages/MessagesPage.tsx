export const MessagesPage = ({ conversations = [], contacts = [] }: { conversations?: any[]; contacts?: any[] } = {}) => {
  const roleLabels: Record<string, string> = {
    admin: 'Fleet Admins',
    driver: 'Drivers',
    customer: 'Customers',
    provider: 'Providers',
  }

  return (
    <div class="fleet-dashboard messages-page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Communication hub</p>
          <h1>Messages</h1>
          <p class="header-copy">Coordinate routes, deliveries, vehicles, and customer requirements.</p>
        </div>
        <div class="header-actions">
          <span class="sync-status"><span class="status-dot status-dot-live"></span>{conversations.length} conversations</span>
        </div>
      </div>
      <div class="messages-layout">
        <section class="panel conversation-list-panel">
          <div class="panel-heading">
            <div><p class="eyebrow">Inbox</p><h2>Recent conversations</h2></div>
            <span class="count-badge">{conversations.length}</span>
          </div>
          {conversations.length === 0 ? (
            <div class="messages-empty">
              <strong>Your inbox is clear.</strong>
              <span>Choose a contact to start a conversation.</span>
            </div>
          ) : (
            <div class="conversation-list">
              {conversations.map((conversation: any) => (
                <a class="conversation-list-item" href={`/messages/conversation/${conversation.id}`}>
                  <span class="conversation-avatar">{String(conversation.other_user_name || 'U').slice(0, 1).toUpperCase()}</span>
                  <span class="conversation-summary">
                    <strong>{conversation.other_user_name || 'Fleet contact'}</strong>
                    <span>{conversation.last_message || 'No messages yet'}</span>
                  </span>
                  <span class="conversation-meta"><small>{conversation.last_message_date || ''}</small></span>
                </a>
              ))}
            </div>
          )}
        </section>
        <section class="panel message-intro-panel">
          <p class="eyebrow">Available contacts</p>
          <h2>Start a conversation</h2>
          <div class="message-contact-groups">
            {Object.keys(roleLabels).map((role) => {
              const roleContacts = contacts.filter((contact: any) => contact.contact_role === role)
              if (!roleContacts.length) return null
              return (
                <div class="message-contact-group">
                  <strong>{roleLabels[role]}</strong>
                  {roleContacts.map((contact: any) => (
                    <a href={`/messages/new?to=${contact.id}`}>
                      <span class="contact-avatar">{String(contact.full_name || 'U').slice(0, 1).toUpperCase()}</span>
                      <span><b>{contact.full_name || contact.email}</b><small>{contact.driver_reference || contact.email}</small></span>
                      <span>Message</span>
                    </a>
                  ))}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
