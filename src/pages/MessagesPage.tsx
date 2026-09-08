export const MessagesPage = ({ conversations = [] }: { conversations?: any[] } = {}) => {
  return (
    <div style="padding: 2rem; min-height: 100vh; background: #f5f5f5;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1>💬 Messages</h1>

        {conversations.length === 0 ? (
          <div style="background: white; padding: 2rem; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 1.1rem; color: #666;">No messages yet. Open a profile and choose Message to start a conversation.</p>
          </div>
        ) : (
          <div style="display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem;">
            {/* Conversations List */}
            <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
              {conversations.map((conv: any) => (
                <a href={`/messages/conversation/${conv.id}`} style="display: block; padding: 1rem; border-bottom: 1px solid #eee; text-decoration: none; color: black; hover:background: #f9f9f9;">
                  <h4 style="margin: 0 0 0.5rem 0;">{conv.other_user_name}</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: #666; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    {conv.last_message || 'No messages yet'}
                  </p>
                  <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #999;">{conv.last_message_date || ''}</p>
                </a>
              ))}
            </div>

            {/* Conversation View */}
            <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; flex-direction: column; min-height: 500px;">
              <div style="flex: 1; padding: 1.5rem; overflow-y: auto;">
                {/* Messages would be rendered here */}
                <div style="text-align: center; color: #999; padding: 2rem;">
                  <p>Select a conversation to view messages</p>
                </div>
              </div>

              {/* Message Input */}
              <div style="padding: 1.5rem; border-top: 1px solid #eee;">
                <a href="/providers/search" style="display: inline-block; background: #4db8ff; color: black; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; font-weight: bold;">Find a profile to message</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
