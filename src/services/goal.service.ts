import api from '../lib/api';

export interface GoalPayload {
  title: string;
  targetAmount: number;
  deadline: string;
}

export const goalService = {
  getGoals: async () => {
    const response = await api.get('/goals');
    return response.data;
  },

  getGoal: async (id: string) => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  createGoal: async (data: GoalPayload) => {
    const response = await api.post('/goals', data);
    return response.data;
  },

  updateGoal: async (id: string, data: Partial<GoalPayload>) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  deleteGoal: async (id: string) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  addProgress: async (id: string, amount: number) => {
    const response = await api.patch(`/goals/${id}/progress`, { amount });
    return response.data;
  }
};
