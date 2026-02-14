import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const usersAPI = {
  search: (q, limit = 20) => api.get(`/users?q=${q}&limit=${limit}`),
  getOnline: () => api.get('/users/online'),
  getById: (id) => api.get(`/users/${id}`),
  getByUsername: (username) => api.get(`/users/username/${username}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const conversationsAPI = {
  list: (page = 1, limit = 50) => api.get(`/conversations?page=${page}&limit=${limit}`),
  getDirect: (userId) => api.post('/conversations/direct', { userId }),
  createGroup: (data) => api.post('/conversations/group', data),
  getById: (id) => api.get(`/conversations/${id}`),
  getMessages: (id, page = 1, limit = 50) => api.get(`/conversations/${id}/messages?page=${page}&limit=${limit}`),
  join: (id, userId) => api.post(`/conversations/${id}/join`, { userId }),
  leave: (id) => api.post(`/conversations/${id}/leave`),
  markRead: (id, messageIds) => api.post(`/conversations/${id}/read`, { messageIds }),
};

export const roomsAPI = {
  list: (page = 1, limit = 50) => api.get(`/rooms?page=${page}&limit=${limit}`),
  getByName: (name) => api.get(`/rooms/${name}`),
  create: (data) => api.post('/rooms', data),
  getMessages: (name, page = 1) => api.get(`/rooms/${name}/messages?page=${page}`),
};

export const filesAPI = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getById: (id) => api.get(`/files/${id}`),
  delete: (id) => api.delete(`/files/${id}`),
  getByConversation: (id, page = 1, limit = 20) => api.get(`/files/conversation/${id}?page=${page}&limit=${limit}`),
  getByRoom: (roomId, page = 1, limit = 20) => api.get(`/files/room/${roomId}?page=${page}&limit=${limit}`),
};

export default api;
