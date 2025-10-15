import OpenAI from 'openai';

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface ExpenseInsight {
  summary: string;
  suggestions: string[];
  patterns: string[];
  alerts: string[];
}

export const categorizeTransaction = async (
  description: string,
  amount: number,
  merchant?: string
): Promise<CategorySuggestion> => {
  try {
    if (!openai) {
      // Fallback categorization without OpenAI
      return fallbackCategorization(description, merchant);
    }

    const prompt = `
Categorize this financial transaction into one of these categories:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Investment
- Income
- Other

Transaction Details:
Description: ${description}
Amount: $${amount}
${merchant ? `Merchant: ${merchant}` : ''}

Respond with a JSON object containing:
{
  "category": "exact category name from the list above",
  "confidence": number between 0-1,
  "reasoning": "brief explanation for the categorization"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a financial categorization expert. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content) as CategorySuggestion;
    
    // Validate the category
    const validCategories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
      'Investment', 'Income', 'Other'
    ];
    
    if (!validCategories.includes(result.category)) {
      result.category = 'Other';
    }

    return result;
  } catch (error) {
    console.error('OpenAI categorization error:', error);
    return fallbackCategorization(description, merchant);
  }
};

export const generateExpenseInsights = async (
  transactions: Array<{ description: string; amount: number; category: string; date: Date }>
): Promise<ExpenseInsight> => {
  try {
    if (!openai || transactions.length === 0) {
      return fallbackInsights(transactions);
    }

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const categoryBreakdown = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const prompt = `
Analyze these financial transactions and provide insights:

Total Spent: $${totalSpent.toFixed(2)}
Number of Transactions: ${transactions.length}

Category Breakdown:
${Object.entries(categoryBreakdown)
  .map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`)
  .join('\n')}

Recent Transactions:
${transactions.slice(0, 10).map(t => 
  `- ${t.description}: $${t.amount} (${t.category})`
).join('\n')}

Provide a JSON response with:
{
  "summary": "brief overview of spending patterns",
  "suggestions": ["array of 2-3 actionable suggestions"],
  "patterns": ["array of 2-3 observed patterns"],
  "alerts": ["array of potential concerns or warnings"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a personal finance advisor. Provide helpful, actionable insights. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.5
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content) as ExpenseInsight;
  } catch (error) {
    console.error('OpenAI insights error:', error);
    return fallbackInsights(transactions);
  }
};

// Fallback categorization without OpenAI
const fallbackCategorization = (description: string, merchant?: string): CategorySuggestion => {
  const text = `${description} ${merchant || ''}`.toLowerCase();
  
  const categoryKeywords = {
    'Food & Dining': ['restaurant', 'food', 'coffee', 'lunch', 'dinner', 'cafe', 'pizza', 'burger', 'starbucks', 'mcdonald'],
    'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus', 'train'],
    'Shopping': ['amazon', 'walmart', 'target', 'store', 'shop', 'mall', 'clothing', 'shoes'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater'],
    'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'rent', 'mortgage', 'insurance'],
    'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medical', 'health', 'dentist'],
    'Education': ['school', 'university', 'course', 'book', 'tuition', 'education'],
    'Travel': ['hotel', 'flight', 'airbnb', 'vacation', 'travel', 'airline'],
    'Investment': ['investment', 'stock', 'bond', 'mutual fund', 'crypto']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return {
        category,
        confidence: 0.7,
        reasoning: `Matched keywords related to ${category.toLowerCase()}`
      };
    }
  }

  return {
    category: 'Other',
    confidence: 0.5,
    reasoning: 'Could not determine specific category'
  };
};

// Fallback insights without OpenAI
const fallbackInsights = (transactions: Array<{ amount: number; category: string }>): ExpenseInsight => {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgTransaction = totalSpent / transactions.length;
  
  return {
    summary: `You've spent $${totalSpent.toFixed(2)} across ${transactions.length} transactions with an average of $${avgTransaction.toFixed(2)} per transaction.`,
    suggestions: [
      'Track your spending patterns to identify areas for improvement',
      'Set monthly budgets for your top spending categories',
      'Consider using the 50/30/20 budgeting rule'
    ],
    patterns: [
      `Most transactions are around $${avgTransaction.toFixed(2)}`,
      'Regular spending across multiple categories'
    ],
    alerts: totalSpent > 1000 ? ['High spending detected this period'] : []
  };
};
