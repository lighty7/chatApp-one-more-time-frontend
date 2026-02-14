import { create } from 'zustand';
import { conversationsAPI, usersAPI } from '../services/api';
import socketService from '../services/socket';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  loading: false,
  hasMore: true,
  page: 1,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const { data } = await conversationsAPI.list(1, 50);
      set({ conversations: data.conversations || data, loading: false });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      set({ loading: false });
    }
  },

  setActiveConversation: async (conversation) => {
    const prev = get().activeConversation;
    if (prev) {
      socketService.leaveConversation(prev._id || prev.id);
    }
    set({ activeConversation: conversation, messages: {}, page: 1, hasMore: true });
    if (conversation) {
      socketService.joinConversation(conversation._id || conversation.id);
      get().fetchMessages(conversation._id || conversation.id);
    }
  },

  fetchMessages: async (conversationId, loadMore = false) => {
    const { page, messages, hasMore } = get();
    if (!hasMore && !loadMore) return;

    try {
      const pageNum = loadMore ? page + 1 : 1;
      const { data } = await conversationsAPI.getMessages(conversationId, pageNum, 50);
      const newMessages = data.messages || data;
      
      set({
        messages: {
          ...messages,
          [conversationId]: loadMore 
            ? [...(messages[conversationId] || []), ...newMessages]
            : newMessages
        },
        page: pageNum,
        hasMore: newMessages.length >= 50,
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  sendMessage: async (content, type = 'text', attachmentId = null) => {
    const { activeConversation } = get();
    if (!activeConversation) return;
    
    try {
      const message = await socketService.sendMessage(
        activeConversation._id || activeConversation.id,
        content,
        type,
        attachmentId
      );
      const convId = activeConversation._id || activeConversation.id;
      set({
        messages: {
          ...get().messages,
          [convId]: [...(get().messages[convId] || []), message],
        },
      });
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  addMessage: (message) => {
    const convId = message.conversationId;
    if (!convId) return;
    const currentMessages = get().messages[convId] || [];
    if (!currentMessages.find(m => m._id === message._id)) {
      set({
        messages: {
          ...get().messages,
          [convId]: [...currentMessages, message],
        },
      });
    }
  },

  setTyping: (conversationId, userId, isTyping) => {
    set({
      typingUsers: {
        ...get().typingUsers,
        [conversationId]: isTyping 
          ? [...(get().typingUsers[conversationId] || []), userId]
          : (get().typingUsers[conversationId] || []).filter(id => id !== userId),
      },
    });
  },

  createDirectConversation: async (userId) => {
    try {
      const { data } = await conversationsAPI.getDirect(userId);
      await get().fetchConversations();
      return data;
    } catch (error) {
      console.error('Failed to create direct conversation:', error);
      throw error;
    }
  },

  createGroup: async (name, description, participantIds) => {
    try {
      const { data } = await conversationsAPI.createGroup({ name, description, participantIds });
      await get().fetchConversations();
      return data;
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  },

  markAsRead: async (conversationId, messageIds) => {
    try {
      await conversationsAPI.markRead(conversationId, messageIds);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  setupSocketListeners: () => {
    socketService.on('new-message', (message) => {
      get().addMessage(message);
    });

    socketService.on('user-typing', ({ userId, conversationId }) => {
      get().setTyping(conversationId, userId, true);
    });

    socketService.on('user-stop-typing', ({ userId, conversationId }) => {
      get().setTyping(conversationId, userId, false);
    });
  },
}));
