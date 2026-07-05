import api from '../lib/api';

export interface InvestmentPayload {
  name: string;
  value: number;
  type: string;
  date?: string;
}

export const investmentService = {
  getInvestments: async () => {
    const response = await api.get('/investments');
    return response.data;
  },

  getInvestment: async (id: string) => {
    const response = await api.get(`/investments/${id}`);
    return response.data;
  },

  createInvestment: async (data: InvestmentPayload) => {
    const response = await api.post('/investments', data);
    return response.data;
  },

  deleteInvestment: async (id: string) => {
    const response = await api.delete(`/investments/${id}`);
    return response.data;
  }
};
