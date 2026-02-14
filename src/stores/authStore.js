import { create } from 'zustand';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true, loading: false });
      socketService.connect(data.accessToken);
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true, loading: false });
      socketService.connect(data.accessToken);
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    socketService.disconnect();
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    try {
      const { data } = await authAPI.me();
      set({ user: data, isAuthenticated: true });
      socketService.connect(token);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },
}));
