export const ConversationPage = ({ conversation = {}, messages = [] }: { conversation?: any, messages?: any[] } = {}) => {
  const other = conversation.other_user || { full_name: 'Conversation' }
  return (
    <div class="fleet-dashboard conversation-page">
      <div style="max-width:900px; margin:0 auto;">
        <div class="page-heading"><div><p class="eyebrow">Profile messaging</p><h1>Conversation with {other.full_name}</h1><p class="header-copy">Send a message securely to this profile.</p></div><a class="button button-secondary" href="/messages">← Messages</a></div>

        <div class="panel conversation-card">
          <div style="max-height:500px; overflow-y:auto; padding:0.5rem;">
            {messages.length === 0 ? (
              <p style="color:#666; text-align:center; padding:2rem;">No messages yet. Say hello!</p>
            ) : (
              messages.map(m => (
                <div style={`margin-bottom:0.75rem; padding:0.5rem; border-radius:6px; background:${m.sender_name === other.full_name ? '#eef' : '#f1f1f1'}`}>
                  <div style="font-weight:bold; font-size:0.9rem;">{m.sender_name}</div>
                  <div style="margin-top:0.25rem;">{m.message_text}</div>
                  <div style="font-size:0.8rem; color:#888; margin-top:0.25rem;">{m.created_at}</div>
                </div>
              ))
            )}
          </div>

          <div style="border-top:1px solid #eee; padding:1rem; margin-top:1rem;">
            <form data-conversation-form data-receiver-id={conversation.other_user?.id} style="display:flex; gap:0.5rem;">
              <input name="message_text" placeholder="Type your message..." style="flex:1; padding:0.5rem; border:1px solid #ddd; border-radius:4px;" required />
              <button type="submit" style="background:#4db8ff; color:black; border:none; padding:0.5rem 1rem; border-radius:4px; font-weight:bold; cursor:pointer;">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}