import { create } from 'zustand';
import { aiAPI } from '../services/api';

export const useAIStore = create((set) => ({
  models: [],
  preferredModel: 'qwen2.5-coder:7b',
  loading: false,

  fetchModels: async () => {
    set({ loading: true });
    try {
      const { data } = await aiAPI.getModels();
      set({ models: data.models || [], loading: false });
    } catch (error) {
      console.error('Failed to fetch AI models:', error);
      set({ loading: false });
    }
  },

  fetchPreferredModel: async () => {
    try {
      const { data } = await aiAPI.getPreferredModel();
      set({ preferredModel: data.preferredModel });
    } catch (error) {
      console.error('Failed to fetch preferred model:', error);
    }
  },

  setPreferredModel: async (model) => {
    try {
      await aiAPI.setPreferredModel(model);
      set({ preferredModel: model });
    } catch (error) {
      console.error('Failed to set preferred model:', error);
    }
  }
}));
