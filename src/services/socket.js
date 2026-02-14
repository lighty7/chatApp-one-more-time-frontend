import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  emit(event, data, callback) {
    if (!this.socket) return;
    this.socket.emit(event, data, callback);
  }

  joinConversation(conversationId) {
    return new Promise((resolve, reject) => {
      this.emit('join-conversation', { conversationId }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  leaveConversation(conversationId) {
    this.emit('leave-conversation', { conversationId });
  }

  sendMessage(conversationId, content, type = 'text', attachmentId = null) {
    return new Promise((resolve, reject) => {
      this.emit('send-message', { conversationId, content, type, attachmentId }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  markRead(conversationId, messageIds) {
    this.emit('mark-read', { conversationId, messageIds });
  }

  typing(conversationId) {
    this.emit('typing', { conversationId });
  }

  stopTyping(conversationId) {
    this.emit('stop-typing', { conversationId });
  }

  joinRoom(roomName) {
    return new Promise((resolve, reject) => {
      this.emit('join-room', { roomName }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  leaveRoom(roomName) {
    this.emit('leave-room', { roomName });
  }

  sendRoomMessage(roomName, content) {
    return new Promise((resolve, reject) => {
      this.emit('send-room-message', { roomName, content }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  getOnlineUsers() {
    return new Promise((resolve) => {
      this.emit('get-online-users', {}, (users) => {
        resolve(users || []);
      });
    });
  }
}

export const socketService = new SocketService();
export default socketService;
