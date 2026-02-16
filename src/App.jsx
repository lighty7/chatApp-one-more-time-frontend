import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useChatStore, useRoomsStore, useNotificationStore, usePresenceStore } from './stores';
import socketService from './services/socket';

import Auth from './pages/Auth';
import Main from './pages/Main';
import ChatView from './pages/ChatView';
import RoomView from './pages/RoomView';
import SearchUsers from './pages/SearchUsers';
import CreateGroup from './pages/CreateGroup';
import GroupInfo from './pages/GroupInfo';
import AIChatView from './pages/AIChatView';
import NotificationToast from './components/NotificationToast';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setupChatSocket = useChatStore((s) => s.setupSocketListeners);
  const setChatUser = useChatStore((s) => s.setUser);
  const setupRoomsSocket = useRoomsStore((s) => s.setupSocketListeners);
  const initNotifications = useNotificationStore((s) => s.initialize);
  const initPresence = usePresenceStore((s) => s.initialize);
  const initialized = useRef(false);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      setChatUser(user);
    }
  }, [user, setChatUser]);

  useEffect(() => {
    if (isAuthenticated && user && !initialized.current) {
      initialized.current = true;
      
      const setup = () => {
        setupChatSocket();
        setupRoomsSocket();
        initNotifications();
        initPresence();
      };

      if (socketService.isConnected()) {
        setup();
      } else {
        const checkConnection = setInterval(() => {
          if (socketService.isConnected()) {
            clearInterval(checkConnection);
            setup();
          }
        }, 100);
        setTimeout(() => clearInterval(checkConnection), 5000);
      }
    }
  }, [isAuthenticated, user, setupChatSocket, setupRoomsSocket, initNotifications, initPresence]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/" element={<PrivateRoute><Main /></PrivateRoute>}>
          <Route index element={<Navigate to="/chats" />} />
          <Route path="chats" element={<Main.Tab tab="chats" />} />
          <Route path="rooms" element={<Main.Tab tab="rooms" />} />
          <Route path="profile" element={<Main.Tab tab="profile" />} />
        </Route>
        <Route path="/chat/:id" element={<PrivateRoute><ChatView /></PrivateRoute>} />
        <Route path="/room/:name" element={<PrivateRoute><RoomView /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchUsers /></PrivateRoute>} />
        <Route path="/create-group" element={<PrivateRoute><CreateGroup /></PrivateRoute>} />
        <Route path="/group/:id" element={<PrivateRoute><GroupInfo /></PrivateRoute>} />
        <Route path="/ai-chat" element={<PrivateRoute><AIChatView /></PrivateRoute>} />
      </Routes>
      <NotificationToast />
    </BrowserRouter>
  );
}

export default App;
