// Gemini AI Service for SpendWise AI
// Note: You'll need to add VITE_GEMINI_API_KEY to your .env file

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    console.log('GeminiService initialized with API key:', this.apiKey ? 'Present' : 'Missing');
  }

  private async makeRequest(prompt: string) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    try {
      console.log('Making Gemini request with prompt length:', prompt.length);

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini response received');

      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('budget')) {
      return 'Based on your spending patterns, I recommend following the 50-30-20 rule: 50% for needs, 30% for wants, and 20% for savings. Consider setting a monthly budget that aligns with your income and financial goals.';
    }

    if (lowerPrompt.includes('save') || lowerPrompt.includes('saving')) {
      return 'Great question about saving! Start by tracking your expenses for a month to identify areas where you can cut back. Consider automating your savings by setting up automatic transfers to a separate savings account.';
    }

    if (lowerPrompt.includes('invest')) {
      return 'For investment advice, consider starting with low-risk options like index funds or SIPs. Always do your research and consider consulting with a financial advisor for personalized investment strategies.';
    }

    if (lowerPrompt.includes('expense') || lowerPrompt.includes('spending')) {
      return 'To better manage your expenses, categorize them into needs vs wants. Focus on reducing unnecessary spending while maintaining your quality of life. Use the expense tracking features in SpendWise AI to monitor your patterns.';
    }

    
    return 'I\'m here to help with your financial questions! Ask me about budgeting, saving, investing, or expense management. You can also ask for analysis of your spending patterns.';
  }

  async getChatResponse(message: string, transactions?: Transaction[]): Promise<string> {
    let context = '';
    
    if (transactions && transactions.length > 0) {
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;
      
      const categoryBreakdown = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      context = `
User's Financial Context:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Current Balance: ₹${balance}
- Top Expense Categories: ${Object.entries(categoryBreakdown)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 3)
  .map(([cat, amt]) => `${cat}: ₹${amt}`)
  .join(', ')}
- Recent Transactions: ${transactions.slice(0, 5).map(t => `${t.description}: ₹${t.amount} (${t.type})`).join(', ')}
`;
    }

    const prompt = `
You are a helpful AI financial assistant for SpendWise AI, a personal finance tracking app. 
Provide practical, actionable financial advice in a friendly and encouraging tone.
Keep responses concise (2-3 sentences) and focused on the user's question.

${context}

User Question: ${message}

Please provide helpful financial advice based on the context above. If you don't have enough information, ask clarifying questions.
`;

    return await this.makeRequest(prompt);
  }

  async getBudgetSuggestions(transactions: Transaction[], monthlyIncome: number): Promise<string> {
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const prompt = `
As a financial advisor, analyze this user's spending and provide smart budget recommendations:

Monthly Income: ₹${monthlyIncome}
Total Monthly Expenses: ₹${totalExpenses}
Expense Breakdown: ${Object.entries(categoryBreakdown).map(([cat, amt]) => `${cat}: ₹${amt}`).join(', ')}

Provide 3 specific, actionable budget recommendations with amounts. Focus on:
1. Emergency fund target
2. Spending optimization 
3. Savings/investment goals

Keep it concise and practical.
`;

    return await this.makeRequest(prompt);
  }

  async getSpendingInsights(transactions: Transaction[]): Promise<string> {
    if (transactions.length === 0) {
      return 'Start tracking your expenses to get personalized insights! Add a few transactions to see patterns and recommendations.';
    }

    const recentTransactions = transactions.slice(0, 10);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const prompt = `
Analyze these recent financial transactions and provide insights:

Recent Transactions: ${recentTransactions.map(t => `${t.description}: ₹${t.amount} (${t.category})`).join(', ')}
Total Expenses: ₹${totalExpense}

Provide 2-3 key insights about spending patterns, potential savings opportunities, or financial habits. 
Be specific and actionable. Keep it under 100 words.
`;

    return await this.makeRequest(prompt);
  }

  async categorizeExpense(description: string, amount: number): Promise<string> {
    const categories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Health & Fitness', 'Bills & Utilities', 'Education', 'Others'
    ];

    const prompt = `
Categorize this expense into one of these categories: ${categories.join(', ')}

Expense: ${description} - ₹${amount}

Return only the category name that best fits this expense.
`;

    const response = await this.makeRequest(prompt);
    
    // Validate response is a valid category
    const category = categories.find(cat => 
      response.toLowerCase().includes(cat.toLowerCase())
    );
    
    return category || 'Others';
  }
}

export const geminiService = new GeminiService();
export default geminiService;
