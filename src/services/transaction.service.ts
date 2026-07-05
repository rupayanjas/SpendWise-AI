import api from '../lib/api';

export interface TransactionPayload {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  userId?: string;
}

export const transactionService = {
  getAllTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  getTransactionById: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data: TransactionPayload) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  updateTransaction: async (id: string, data: Partial<TransactionPayload>) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id: string) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
};
