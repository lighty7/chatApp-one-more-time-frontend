import { create } from 'zustand';
import socketService from '../services/socket';
import { usersAPI } from '../services/api';

export const usePresenceStore = create((set, get) => ({
  onlineUsers: new Set(),

  initialize: () => {    
    usersAPI.getOnline().then(({ data }) => {
      const onlineUserIds = data.map(u => u._id || u.id);
      set({ onlineUsers: new Set(onlineUserIds) });
    }).catch(err => console.error('Failed to fetch online users:', err));

    socketService.on('presence:update', (data) => {
      console.log('Presence update:', data);
    });

    socketService.on('presence:event', (data) => {
      console.log('Presence event:', data);
      const { onlineUsers } = get();
      const newOnlineUsers = new Set(onlineUsers);
      
      if (data.type === 'online' || data.type === 'presence') {
        newOnlineUsers.add(data.userId);
      } else if (data.type === 'offline') {
        newOnlineUsers.delete(data.userId);
      }
      
      set({ onlineUsers: newOnlineUsers });
    });

    socketService.on('user-online', (data) => {
      console.log('User online:', data);
      const { onlineUsers } = get();
      const newOnlineUsers = new Set(onlineUsers);
      newOnlineUsers.add(data.userId);
      set({ onlineUsers: newOnlineUsers });
    });

    socketService.on('user-offline', (data) => {
      console.log('User offline:', data);
      const { onlineUsers } = get();
      const newOnlineUsers = new Set(onlineUsers);
      newOnlineUsers.delete(data.userId);
      set({ onlineUsers: newOnlineUsers });
    });
  },

  setUserOnline: (userId) => {
    const { onlineUsers } = get();
    const newOnlineUsers = new Set(onlineUsers);
    newOnlineUsers.add(userId);
    set({ onlineUsers: newOnlineUsers });
  },

  setUserOffline: (userId) => {
    const { onlineUsers } = get();
    const newOnlineUsers = new Set(onlineUsers);
    newOnlineUsers.delete(userId);
    set({ onlineUsers: newOnlineUsers });
  },

  isUserOnline: (userId) => {
    return get().onlineUsers.has(userId);
  }
}));
