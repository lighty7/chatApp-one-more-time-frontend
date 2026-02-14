import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useChatStore, useRoomsStore } from '../stores';
import ChatsTab from '../components/ChatsTab';
import RoomsTab from '../components/RoomsTab';
import ProfileTab from '../components/ProfileTab';
import NotificationBell from '../components/NotificationBell';

function MainLayout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fetchConversations = useChatStore((s) => s.fetchConversations);
  const fetchRooms = useRoomsStore((s) => s.fetchRooms);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchRooms();
    }
  }, [user, fetchConversations, fetchRooms]);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="bg-surface px-4 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold text-primary">Chatterbox</h1>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-lg hover:bg-bg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/create-group')}
            className="p-2 rounded-lg hover:bg-bg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <nav className="bg-surface border-t border-bg">
        <div className="flex">
          <NavLink
            to="/chats"
            className={({ isActive }) =>
              `flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`
            }
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs">Chats</span>
          </NavLink>
          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`
            }
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs">Rooms</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`
            }
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

MainLayout.Tab = function MainTab({ tab }) {
  switch (tab) {
    case 'chats':
      return <ChatsTab />;
    case 'rooms':
      return <RoomsTab />;
    case 'profile':
      return <ProfileTab />;
    default:
      return null;
  }
};

export default MainLayout;
