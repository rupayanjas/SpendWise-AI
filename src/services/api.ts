const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('spendwise_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Transaction endpoints
  async getTransactions(filters?: any) {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return this.request(`/transactions${query}`);
  }

  async createTransaction(transaction: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, transaction: any) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getAIInsights() {
    return this.request('/transactions/insights/ai');
  }

  // Wallet endpoints
  async connectWallet(walletAddress: string, signature: string, message: string) {
    return this.request('/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  }

  async disconnectWallet() {
    return this.request('/wallet/disconnect', {
      method: 'DELETE',
    });
  }

  async getWalletStatus() {
    return this.request('/wallet/status');
  }

  // Rewards endpoints
  async earnRewards(activity: string, amount: number) {
    return this.request('/rewards/earn', {
      method: 'POST',
      body: JSON.stringify({ activity, amount }),
    });
  }

  async getTokenBalance(address?: string) {
    if (address) {
      return this.request(`/rewards/balance/${address}`);
    }
    return this.request('/rewards/my-balance');
  }

  async getRewardOpportunities() {
    return this.request('/rewards/opportunities');
  }

  async getContractInfo() {
    return this.request('/rewards/contract-info');
  }

  // Proof endpoints
  async getTransactionProof(id: string) {
    return this.request(`/proof/transaction/${id}`);
  }

  async verifyTransaction(id: string) {
    return this.request(`/proof/verify/${id}`, {
      method: 'POST',
    });
  }

  async getProofStats() {
    return this.request('/proof/stats');
  }
}

export const apiService = new ApiService();
export default apiService;
