import { create } from 'zustand';
import { api } from '../services/api';

const useReactionStore = create((set, get) => ({
  loadingReactions: {},

  setLoading: (messageId, loading) => set(state => ({
    loadingReactions: { ...state.loadingReactions, [messageId]: loading }
  })),

  isLoading: (messageId) => get().loadingReactions[messageId] || false,

  clearLoading: (messageId) => set(state => {
    const { [messageId]: _, ...rest } = state.loadingReactions;
    return { loadingReactions: rest };
  }),
}));

export default useReactionStore;
