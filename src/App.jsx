import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useChatStore, useRoomsStore } from './stores';

import Auth from './pages/Auth';
import Main from './pages/Main';
import ChatView from './pages/ChatView';
import RoomView from './pages/RoomView';
import SearchUsers from './pages/SearchUsers';
import CreateGroup from './pages/CreateGroup';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const setupChatSocket = useChatStore((s) => s.setupSocketListeners);
  const setupRoomsSocket = useRoomsStore((s) => s.setupSocketListeners);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    setupChatSocket();
    setupRoomsSocket();
  }, [setupChatSocket, setupRoomsSocket]);

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
