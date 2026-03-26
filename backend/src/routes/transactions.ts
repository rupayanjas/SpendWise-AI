import express from 'express';
import { body, query, validationResult, matchedData } from 'express-validator';
import crypto from 'crypto';
import Transaction from '../models/Transaction';
import Budget from '../models/Budget';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { categorizeTransaction, generateExpenseInsights } from '../services/openai';

const router = express.Router();

// Generate SHA-256 hash for transaction
const generateTransactionHash = (data: any): string => {
  const hashData = `${data.userId}-${data.description}-${data.amount}-${data.date}-${Date.now()}`;
  return crypto.createHash('sha256').update(hashData).digest('hex');
};

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', authenticate, [
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('merchant')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Merchant name cannot exceed 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { description, amount, type, category, date, merchant, location, tags } = req.body;
  const userId = req.user!._id;

  let finalCategory = category;

  // If no category provided, use AI categorization
  if (!category) {
    try {
      const aiSuggestion = await categorizeTransaction(description, amount, merchant);
      finalCategory = aiSuggestion.category;
    } catch (error) {
      console.error('AI categorization failed:', error);
      finalCategory = 'Other';
    }
  }

  // Generate transaction hash
  const transactionData = {
    userId,
    description,
    amount,
    type,
    category: finalCategory,
    date: date || new Date(),
    merchant,
    location
  };
  const hash = generateTransactionHash(transactionData);

  // Create transaction
  const transaction = new Transaction({
    ...transactionData,
    hash,
    tags: tags || []
  });

  await transaction.save();

  // Update budget if it's an expense
  if (type === 'expense') {
    await updateBudgetSpending(userId.toString(), finalCategory, amount);
  }

  // Populate user reference
  await transaction.populate('userId', 'name email');

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: {
      transaction
    }
  });
}));

// @route   GET /api/transactions
// @desc    Get user transactions with filtering and pagination
// @access  Private
router.get('/', authenticate, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Build filter query
  const filter: any = { userId };

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.startDate || req.query.endDate) {
    filter.date = {};
    if (req.query.startDate) {
      filter.date.$gte = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filter.date.$lte = new Date(req.query.endDate as string);
    }
  }

  // Get transactions
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'),
    Transaction.countDocuments(filter)
  ]);

  // Calculate summary statistics
  const summary = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const summaryData = {
    totalIncome: summary.find(s => s._id === 'income')?.total || 0,
    totalExpenses: summary.find(s => s._id === 'expense')?.total || 0,
    incomeCount: summary.find(s => s._id === 'income')?.count || 0,
    expenseCount: summary.find(s => s._id === 'expense')?.count || 0
  };

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      summary: summaryData
    }
  });
}));

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user!._id
  }).populate('userId', 'name email');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.json({
    success: true,
    data: {
      transaction
    }
  });
}));

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', authenticate, [
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('merchant')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Merchant name cannot exceed 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user!._id
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Store old values for budget update
  const oldAmount = transaction.amount;
  const oldCategory = transaction.category;

  // Update transaction with validated data only to prevent mass assignment
  const validData = matchedData(req, { locations: ['body'] });
  Object.assign(transaction, validData);
  await transaction.save();

  // Update budgets if expense amount or category changed
  if (transaction.type === 'expense' && (oldAmount !== transaction.amount || oldCategory !== transaction.category)) {
    // Subtract old amount from old category
    await updateBudgetSpending((req.user!._id as any).toString(), oldCategory, -oldAmount);
    // Add new amount to new category
    await updateBudgetSpending((req.user!._id as any).toString(), transaction.category, transaction.amount);
  }

  await transaction.populate('userId', 'name email');

  res.json({
    success: true,
    message: 'Transaction updated successfully',
    data: {
      transaction
    }
  });
}));

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user!._id
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Update budget if it's an expense
  if (transaction.type === 'expense') {
    await updateBudgetSpending((req.user!._id as any).toString(), transaction.category, -transaction.amount);
  }

  await Transaction.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Transaction deleted successfully'
  });
}));

// @route   GET /api/transactions/insights/ai
// @desc    Get AI-powered spending insights
// @access  Private
router.get('/insights/ai', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const userId = req.user!._id;
  
  // Get last 30 days of transactions
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await Transaction.find({
    userId,
    type: 'expense',
    date: { $gte: thirtyDaysAgo }
  }).sort({ date: -1 });

  if (transactions.length === 0) {
    return res.json({
      success: true,
      data: {
        insights: {
          summary: 'No transactions found in the last 30 days.',
          suggestions: ['Start tracking your expenses to get personalized insights'],
          patterns: [],
          alerts: []
        }
      }
    });
  }

  const insights = await generateExpenseInsights(transactions);

  res.json({
    success: true,
    data: {
      insights,
      period: '30 days',
      transactionCount: transactions.length
    }
  });
}));

// Helper function to update budget spending
const updateBudgetSpending = async (userId: string, category: string, amountChange: number): Promise<void> => {
  try {
    // Update category-specific budget
    await Budget.findOneAndUpdate(
      { userId, category, isActive: true },
      { $inc: { spent: amountChange } },
      { upsert: false }
    );

    // Update total budget
    await Budget.findOneAndUpdate(
      { userId, category: 'Total', isActive: true },
      { $inc: { spent: amountChange } },
      { upsert: false }
    );
  } catch (error) {
    console.error('Error updating budget:', error);
  }
};

export default router;
