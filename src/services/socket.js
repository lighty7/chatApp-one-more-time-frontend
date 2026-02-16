import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connectionPromise = null;
    this.heartbeatInterval = null;
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected:', this.socket.id);
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    const isDev = import.meta.env.DEV;
    const transports = isDev ? ['polling', 'websocket'] : ['websocket', 'polling'];
    
    this.socket = io('/', {
      auth: { token },
      transports,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.startHeartbeat();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.stopHeartbeat();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('heartbeat-ping', () => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat-pong');
      }
    });
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat-pong');
      }
    }, 10000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected === true;
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized, cannot add listener for:', event);
    }
    this.socket?.on(event, callback);
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  emit(event, data, callback) {
    if (!this.socket) {
      console.warn('Socket not initialized, cannot emit:', event);
      if (callback) callback({ success: false, error: 'Socket not connected' });
      return;
    }
    if (!this.socket.connected) {
      console.warn('Socket not connected, cannot emit:', event);
      if (callback) callback({ success: false, error: 'Socket not connected' });
      return;
    }
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

  sendMessage(conversationId, content, type = 'text', attachmentId = null, replyTo = null) {
    return new Promise((resolve, reject) => {
      this.emit('send-message', { conversationId, content, type, attachmentId, replyTo }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  markRead(conversationId, messageIds) {
    this.emit('mark-read', { conversationId, messageIds });
  }

  markReadSocket(conversationId, messageIds) {
    this.emit('mark-read', { conversationId, messageIds });
  }

  typing(conversationId) {
    this.emit('typing', { conversationId });
  }

  stopTyping(conversationId) {
    this.emit('stop-typing', { conversationId });
  }

  addReaction(conversationId, messageId, emoji) {
    return new Promise((resolve, reject) => {
      this.emit('add-reaction', { conversationId, messageId, emoji }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  removeReaction(conversationId, messageId, emoji) {
    return new Promise((resolve, reject) => {
      this.emit('remove-reaction', { conversationId, messageId, emoji }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  addParticipant(conversationId, userId) {
    return new Promise((resolve, reject) => {
      this.emit('add-participant', { conversationId, userId }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  removeParticipant(conversationId, userId) {
    return new Promise((resolve, reject) => {
      this.emit('remove-participant', { conversationId, userId }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  updateParticipantRole(conversationId, userId, role) {
    return new Promise((resolve, reject) => {
      this.emit('update-participant-role', { conversationId, userId, role }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
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

  sendAIMessage(message, conversationHistory) {
    return new Promise((resolve, reject) => {
      this.emit('ai-message', { message, conversationHistory }, (response) => {
        if (response?.error) reject(response.error);
        else resolve(response);
      });
    });
  }

  stopAIMessage() {
    this.emit('ai-stop');
  }
}

export const socketService = new SocketService();
export default socketService;
