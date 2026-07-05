import api from '../lib/api';

export interface BudgetPayload {
  category: string;
  limit: number;
  month: number;
  year: number;
}

export const budgetService = {
  getBudgets: async () => {
    const response = await api.get('/budgets');
    return response.data;
  },

  getBudget: async (id: string) => {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  createBudget: async (data: BudgetPayload) => {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  updateBudget: async (id: string, data: Partial<BudgetPayload>) => {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data;
  },

  deleteBudget: async (id: string) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  }
};
