import { create } from 'zustand';
import { conversationsAPI } from '../services/api';
import socketService from '../services/socket';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  loading: false,
  hasMore: true,
  page: 1,
  user: null,

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
      const convId = conversation._id || conversation.id;
      socketService.joinConversation(convId).then((response) => {
        if (response?.messages) {
          set({
            messages: {
              ...get().messages,
              [convId]: response.messages
            }
          });
        }
        if (response?.conversation) {
          set({ activeConversation: response.conversation });
        }
      }).catch(err => {
        console.error('Failed to join conversation:', err);
      });
      get().fetchMessages(convId);
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
      const convId = activeConversation._id || activeConversation.id;
      const tempId = `temp-${Date.now()}`;
      
      const optimisticMessage = {
        _id: tempId,
        conversationId: convId,
        content,
        type,
        sender: { _id: get().user?._id, displayName: get().user?.displayName },
        createdAt: new Date().toISOString(),
        readBy: [{ user: get().user?._id, readAt: new Date().toISOString() }],
        status: 'sending'
      };
      
      set({
        messages: {
          ...get().messages,
          [convId]: [...(get().messages[convId] || []), optimisticMessage],
        },
      });
      
      const message = await socketService.sendMessage(
        convId,
        content,
        type,
        attachmentId
      );
      
      set({
        messages: {
          ...get().messages,
          [convId]: (get().messages[convId] || []).map(m => 
            m._id === tempId ? message : m
          ),
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
    if (!convId) {
      console.log('No conversationId in message:', message);
      return;
    }
    
    const currentMessages = get().messages[convId] || [];
    const currentUserId = get().user?._id;
    
    const isFromCurrentUser = message.sender?._id === currentUserId || message.sender?.id === currentUserId;
    const existingByTemp = !isFromCurrentUser ? -1 : currentMessages.findIndex(m => 
      m._id?.startsWith?.('temp-') && 
      m.content === message.content
    );
    
    if (existingByTemp >= 0) {
      console.log('Replacing temp message with real message');
      const updated = [...currentMessages];
      updated[existingByTemp] = message;
      set({
        messages: {
          ...get().messages,
          [convId]: updated,
        },
      });
      return;
    }
    
    const existingIndex = currentMessages.findIndex(m => m._id === message._id);
    if (existingIndex >= 0) {
      console.log('Message already exists:', message._id);
      return;
    }
    
    console.log('Adding new message to conversation:', convId);
    set({
      messages: {
        ...get().messages,
        [convId]: [...currentMessages, message],
      },
    });
  },

  setTyping: (conversationId, userId, isTyping) => {
    const currentUserId = get().user?._id;
    if (userId === currentUserId) return;
    
    set({
      typingUsers: {
        ...get().typingUsers,
        [conversationId]: isTyping 
          ? [...(get().typingUsers[conversationId] || []), userId]
          : (get().typingUsers[conversationId] || []).filter(id => id !== userId),
      },
    });
  },

  typing: (conversationId) => {
    if (!conversationId) return;
    socketService.typing(conversationId);
  },

  stopTyping: (conversationId) => {
    if (!conversationId) return;
    socketService.stopTyping(conversationId);
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

  addReaction: async (messageId, emoji) => {
    const { activeConversation } = get();
    if (!activeConversation) return;
    
    const convId = activeConversation._id || activeConversation.id;
    try {
      await socketService.addReaction(convId, messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      throw error;
    }
  },

  removeReaction: async (messageId, emoji) => {
    const { activeConversation } = get();
    if (!activeConversation) return;
    
    const convId = activeConversation._id || activeConversation.id;
    try {
      await socketService.removeReaction(convId, messageId, emoji);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw error;
    }
  },

  updateMessageReactions: (conversationId, messageId, reactions) => {
    const currentMessages = get().messages[conversationId] || [];
    const updatedMessages = currentMessages.map(msg => {
      if (msg._id === messageId) {
        return { ...msg, reactions };
      }
      return msg;
    });
    set({
      messages: {
        ...get().messages,
        [conversationId]: updatedMessages
      }
    });
  },

  setUser: (user) => {
    set({ user });
  },

  setupSocketListeners: () => {
    console.log('Setting up socket listeners...');
    
    socketService.on('new-message', (message) => {
      console.log('Received new-message in store:', message);
      get().addMessage(message);
    });

    socketService.on('message', (message) => {
      console.log('Received message in store:', message);
      get().addMessage(message);
    });

    socketService.on('conversation:event', (data) => {
      console.log('Received conversation:event:', data);
      if (data.type === 'new_message') {
        get().addMessage(data.data);
      }
    });

    socketService.on('message-delivered', (data) => {
      console.log('Received message-delivered:', data);
      const { conversationId, userId } = data;
      const currentMessages = get().messages[conversationId] || [];
      const updatedMessages = currentMessages.map(msg => {
        if (!msg.readBy?.find(r => r.user === userId)) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), { user: userId, readAt: new Date().toISOString() }]
          };
        }
        return msg;
      });
      set({
        messages: {
          ...get().messages,
          [conversationId]: updatedMessages
        }
      });
    });

    socketService.on('message-read', (data) => {
      console.log('Received message-read:', data);
      const { conversationId, userId } = data;
      const currentMessages = get().messages[conversationId] || [];
      const updatedMessages = currentMessages.map(msg => {
        if (!msg.readBy?.find(r => r.user === userId)) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), { user: userId, readAt: new Date().toISOString() }]
          };
        }
        return msg;
      });
      set({
        messages: {
          ...get().messages,
          [conversationId]: updatedMessages
        }
      });
    });

    socketService.on('user-typing', ({ userId, conversationId }) => {
      get().setTyping(conversationId, userId, true);
    });

    socketService.on('user-stop-typing', ({ userId, conversationId }) => {
      get().setTyping(conversationId, userId, false);
    });

    socketService.on('message-reaction-added', ({ messageId, message }) => {
      const convId = message.conversationId;
      if (convId) {
        get().updateMessageReactions(convId, messageId, message.reactions);
      }
    });

    socketService.on('message-reaction-removed', ({ messageId, message }) => {
      const convId = message.conversationId;
      if (convId) {
        get().updateMessageReactions(convId, messageId, message.reactions);
      }
    });
  },
}));
