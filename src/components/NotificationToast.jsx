import { useNotificationStore } from '../stores';
import { useNavigate } from 'react-router-dom';

export default function NotificationToast() {
  const notifications = useNotificationStore((s) => s.notifications);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const navigate = useNavigate();

  const handleClick = (notification) => {
    if (notification.conversationId) {
      navigate(`/chat/${notification.conversationId}`);
    }
    const index = notifications.findIndex(n => n === notification);
    if (index >= 0) {
      removeNotification(index);
    }
  };

  const visibleNotifications = notifications.slice(0, 3);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {visibleNotifications.map((notification, index) => (
        <div
          key={`${notification.conversationId}-${index}`}
          onClick={() => handleClick(notification)}
          className="bg-surface border border-primary/30 p-4 rounded-lg shadow-lg cursor-pointer hover:bg-surface/80 transition-all max-w-sm animate-slide-in"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text text-sm">
                {notification.sender?.displayName || notification.sender?.username || 'New message'}
              </p>
              <p className="text-text-muted text-sm truncate">
                {notification.message?.content || 'You have a new message'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const idx = notifications.findIndex(n => n === notification);
                if (idx >= 0) removeNotification(idx);
              }}
              className="text-text-muted hover:text-text"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
