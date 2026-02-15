import { api } from './api';

export const reactionsAPI = {
  add: (messageId, emoji) => 
    api.post(`/conversations/messages/${messageId}/reactions`, { emoji }),
  
  remove: (messageId, emoji) => 
    api.delete(`/conversations/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`),
  
  get: (messageId) => 
    api.get(`/conversations/messages/${messageId}/reactions`),
};
