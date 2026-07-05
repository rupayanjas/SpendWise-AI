import { GoogleGenAI } from '@google/genai';
import prisma from '../config/prisma';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface CachedAnalysis {
  result: string;
  timestamp: number;
}

class AIService {
  private cache: Map<string, CachedAnalysis> = new Map();
  private insightsCache: Map<string, CachedAnalysis> = new Map();
  private CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

  async generateFinancialAnalysis(userId: string): Promise<string> {
    // 1. Check Cache
    const cached = this.cache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION_MS) {
      return cached.result;
    }

    // 2. Fetch User Data from Postgres via Prisma
    const [user, transactions, budgets, goals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } })
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    // 3. Aggregate Financial Data
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    const largestExpense = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)[0];

    // Group spending by category
    const categorySpending: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    // 4. Construct Context for Gemini
    const financialContext = JSON.stringify({
      name: user.name,
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate: savingsRate.toFixed(1) + '%',
      largestExpense: largestExpense ? { description: largestExpense.description, amount: largestExpense.amount } : null,
      topCategories: categorySpending,
      budgets: budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })),
      goals: goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount, completed: g.completed })),
      recentTransactions: transactions.slice(0, 10).map(t => ({ date: t.date, type: t.type, amount: t.amount, category: t.category }))
    }, null, 2);

    const systemInstruction = `You are a Senior Certified Personal Financial Advisor.
Your objective is to provide professional, actionable, and highly analytical financial advice based strictly on the user's provided data.
DO NOT hallucinate numbers. Use only the supplied financial data.
Analyze the data to identify overspending, suggest budgets, recommend savings strategies, warn about unhealthy spending patterns, and discuss goal progress.

Your response MUST be formatted in structured Markdown and MUST contain exactly the following sections (use these exact H2 headers):
## Overall Financial Health
## Spending Analysis
## Budget Review
## Goal Progress
## Recommendations
## Immediate Actions`;

    const prompt = `Here is the user's current financial data:\n\n${financialContext}\n\nPlease generate the financial analysis report following the system instructions.`;

    // 5. Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for more analytical and deterministic responses
      }
    });

    const resultText = response.text || "Unable to generate analysis at this time.";

    // 6. Cache the result
    this.cache.set(userId, {
      result: resultText,
      timestamp: Date.now()
    });

    return resultText;
  }

  async generateDashboardInsights(userId: string): Promise<any> {
    // 1. Check Cache
    const cached = this.insightsCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION_MS) {
      return JSON.parse(cached.result);
    }

    // 2. Fetch User Data
    const [user, transactions, budgets, goals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } })
    ]);

    if (!user) throw new Error('User not found');

    // 3. Aggregate
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const financialContext = JSON.stringify({
      totalIncome,
      totalExpenses,
      budgets: budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })),
      goals: goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount })),
      recentTransactions: transactions.slice(0, 30).map(t => ({ date: t.date, type: t.type, amount: t.amount, category: t.category }))
    });

    const systemInstruction = `You are a financial AI. Analyze the user's transaction patterns (specifically noticing if early-month spending is high).
Generate JSON output exactly matching this schema, with no markdown formatting around it:
{
  "investmentSuggestion": "string (one short sentence)",
  "budgetOptimization": "string (one short sentence)",
  "savingsGoal": "string (one short sentence)",
  "projectedMonthEndSpending": number (calculated based on patterns),
  "budgetRunawayDays": number (days until budget is exhausted),
  "budgetOverrunAlert": "string or null if safe"
}
Ensure projectedMonthEndSpending mathematically considers any recent heavy spending rather than just a flat daily average.`;

    const prompt = `User Data: ${financialContext}\nProvide the JSON analysis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    
    this.insightsCache.set(userId, {
      result: resultText,
      timestamp: Date.now()
    });

    return JSON.parse(resultText);
  }

  async chatWithAI(userId: string, message: string): Promise<string> {
    const [user, transactions, budgets, goals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } })
    ]);

    if (!user) throw new Error('User not found');

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    const financialContext = JSON.stringify({
      name: user.name,
      totalIncome,
      totalExpenses,
      netBalance,
      budgets: budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })),
      goals: goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount })),
      recentTransactions: transactions.slice(0, 15).map(t => ({ date: t.date, type: t.type, amount: t.amount, category: t.category }))
    });

    const systemInstruction = `You are a helpful, conversational AI Financial Assistant. Answer the user's questions based strictly on their financial context. Keep your response concise, friendly, and formatted in Markdown. Do not hallucinate numbers.`;

    const prompt = `User's Financial Context:\n${financialContext}\n\nUser Question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  }
}

export const aiService = new AIService();
