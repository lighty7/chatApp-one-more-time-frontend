import { useNavigate } from 'react-router-dom';
import { useChatStore, usePresenceStore } from '../stores';

export default function ChatsTab() {
  const navigate = useNavigate();
  const { conversations, loading } = useChatStore();
  const onlineUsers = usePresenceStore((s) => s.onlineUsers);

  const getChatName = (conv) => {
    if (conv.displayName) return conv.displayName;
    if (conv.type === 'group') return conv.name;
    const other = conv.otherParticipant;
    return other?.displayName || other?.username || 'Unknown';
  };

  const getChatAvatar = (conv) => {
    if (conv.type === 'group') {
      return (
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-bg font-bold">
            {conv.name?.[0]?.toUpperCase()}
          </div>
        </div>
      );
    }
    const other = conv.otherParticipant;
    const initial = other?.displayName?.[0] || other?.username?.[0] || '?';
    const isOnline = other?._id && onlineUsers.has(other._id);
    
    return (
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-primary font-bold">
          {initial.toUpperCase()}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg rounded-full"></div>
        )}
      </div>
    );
  };

  const getLastMessage = (conv) => {
    const last = conv.lastMessage;
    if (!last) return 'No messages yet';
    const sender = last.sender?.isMe ? 'You: ' : '';
    const text = last.content || 'Sent an attachment';
    return sender + (text.length > 30 ? text.slice(0, 30) + '...' : text);
  };

  if (loading && !conversations.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading chats...</div>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <svg className="w-16 h-16 text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-text-muted mb-4">No conversations yet</p>
        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2 bg-primary text-bg rounded-lg font-medium"
        >
          Start a Chat
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv._id || conv.id}
          onClick={() => navigate(`/chat/${conv._id || conv.id}`)}
          className="w-full p-4 flex items-center gap-3 hover:bg-surface/50 transition-colors border-b border-bg/50"
        >
          {getChatAvatar(conv)}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">{getChatName(conv)}</span>
              {conv.lastMessage?.createdAt && (
                <span className="text-xs text-text-muted">
                  {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted truncate">{getLastMessage(conv)}</p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="px-2 py-1 bg-primary text-bg text-xs font-bold rounded-full">
              {conv.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
