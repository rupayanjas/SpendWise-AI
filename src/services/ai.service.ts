import api from '../lib/api';

export const aiService = {
  generateAnalysis: async () => {
    const response = await api.post('/ai/analyze');
    return response.data;
  },
  getDashboardInsights: async () => {
    const response = await api.get('/ai/dashboard-insights');
    return response.data;
  },
  chat: async (message: string) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  }
};
