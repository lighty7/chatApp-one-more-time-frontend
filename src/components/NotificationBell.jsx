import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../stores';

export default function NotificationBell() {
  const navigate = useNavigate();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const showNotifications = useNotificationStore((s) => s.showNotifications);
  const toggleShow = useNotificationStore((s) => s.toggleShow);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const setShow = useNotificationStore((s) => s.setShow);

  const handleNotificationClick = (notification) => {
    if (notification.conversationId) {
      navigate(`/chat/${notification.conversationId}`);
    }
    setShow(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleShow}
        className="p-2 text-text-muted hover:text-primary transition-colors relative"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-bg/50 flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-text-muted">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 10).map((notification, index) => (
                <div
                  key={`${notification.conversationId}-${index}`}
                  onClick={() => handleNotificationClick(notification)}
                  className="p-3 border-b border-bg/30 hover:bg-bg/30 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-text">
                        {notification.sender?.displayName || notification.sender?.username || 'New message'}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {notification.message?.content || 'You have a new message'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
