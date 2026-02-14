import { create } from 'zustand';
import socketService from '../services/socket';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  showNotifications: false,

  initialize: () => {    
    console.log('Initializing notification store...');
    
    socketService.on('notification', (notification) => {
      console.log('Notification received in store:', notification);
      const { notifications } = get();
      const newNotifications = [notification, ...notifications].slice(0, 50);
      set({
        notifications: newNotifications,
        unreadCount: newNotifications.length
      });
    });

    socketService.on('new-message', (message) => {
      console.log('New message notification:', message);
    });
  },

  toggleShow: () => {
    set({ showNotifications: !get().showNotifications });
  },

  setShow: (show) => {
    set({ showNotifications: show });
  },

  addNotification: (notification) => {
    const { notifications } = get();
    const newNotifications = [notification, ...notifications].slice(0, 50);
    set({
      notifications: newNotifications,
      unreadCount: newNotifications.length
    });
  },

  markAsRead: (conversationId) => {
    const { notifications } = get();
    const updatedNotifications = notifications.filter(
      n => n.conversationId !== conversationId
    );
    set({
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.length
    });
  },

  markAllAsRead: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  removeNotification: (index) => {
    const { notifications } = get();
    const newNotifications = notifications.filter((_, i) => i !== index);
    set({
      notifications: newNotifications,
      unreadCount: newNotifications.length
    });
  }
}));
