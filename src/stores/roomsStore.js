import { create } from 'zustand';
import { roomsAPI } from '../services/api';
import socketService from '../services/socket';

export const useRoomsStore = create((set, get) => ({
  rooms: [],
  activeRoom: null,
  roomMessages: {},
  roomUsers: {},
  loading: false,
  page: 1,
  hasMore: true,

  fetchRooms: async () => {
    set({ loading: true });
    try {
      const { data } = await roomsAPI.list(1, 50);
      set({ rooms: data.rooms || data, loading: false });
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      set({ loading: false });
    }
  },

  createRoom: async (roomData) => {
    try {
      const { data } = await roomsAPI.create(roomData);
      await get().fetchRooms();
      return data;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  },

  setActiveRoom: async (room) => {
    const prev = get().activeRoom;
    if (prev) {
      socketService.leaveRoom(prev.name);
    }
    set({ activeRoom: room, roomMessages: {}, page: 1, hasMore: true });
    if (room) {
      socketService.joinRoom(room.name);
      get().fetchRoomMessages(room.name);
    }
  },

  fetchRoomMessages: async (roomName, loadMore = false) => {
    const { page, roomMessages, hasMore } = get();
    if (!hasMore && !loadMore) return;

    try {
      const pageNum = loadMore ? page + 1 : 1;
      const { data } = await roomsAPI.getMessages(roomName, pageNum);
      const messages = data.messages || data;
      
      set({
        roomMessages: {
          ...roomMessages,
          [roomName]: loadMore 
            ? [...(roomMessages[roomName] || []), ...messages]
            : messages
        },
        page: pageNum,
        hasMore: messages.length >= 50,
      });
    } catch (error) {
      console.error('Failed to fetch room messages:', error);
    }
  },

  sendMessage: async (content) => {
    const { activeRoom } = get();
    if (!activeRoom) return;
    
    try {
      const message = await socketService.sendRoomMessage(activeRoom.name, content);
      const roomName = activeRoom.name;
      set({
        roomMessages: {
          ...get().roomMessages,
          [roomName]: [...(get().roomMessages[roomName] || []), message],
        },
      });
      return message;
    } catch (error) {
      console.error('Failed to send room message:', error);
      throw error;
    }
  },

  addRoomMessage: (message) => {
    const roomName = message.room;
    if (!roomName) return;
    const currentMessages = get().roomMessages[roomName] || [];
    if (!currentMessages.find(m => m._id === message._id)) {
      set({
        roomMessages: {
          ...get().roomMessages,
          [roomName]: [...currentMessages, message],
        },
      });
    }
  },

  updateRoomUsers: (roomName, users) => {
    set({ roomUsers: { ...get().roomUsers, [roomName]: users } });
  },

  setupSocketListeners: () => {
    socketService.on('room-message', (message) => {
      get().addRoomMessage(message);
    });

    socketService.on('user-joined-room', ({ roomName, users }) => {
      get().updateRoomUsers(roomName, users);
    });

    socketService.on('user-left-room', ({ roomName, users }) => {
      get().updateRoomUsers(roomName, users);
    });
  },
}));
