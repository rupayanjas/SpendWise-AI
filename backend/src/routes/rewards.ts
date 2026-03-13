import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { blockchainService, BlockchainService } from '../services/blockchain';
import Transaction from '../models/Transaction';
import User from '../models/User';

const router = express.Router();

// Reward calculation constants
const REWARD_RATES = {
  TRANSACTION_CREATED: '0.1', // 0.1 SWT per transaction
  BUDGET_ACHIEVED: '1.0',     // 1.0 SWT for achieving budget goals
  STREAK_BONUS: '0.5',        // 0.5 SWT for daily tracking streaks
  CATEGORY_COMPLETE: '2.0'    // 2.0 SWT for completing all categories
};

// @route   POST /api/rewards/earn
// @desc    Earn rewards for various activities
// @access  Private
router.post('/earn', authenticate, [
  body('activity')
    .isIn(['transaction_created', 'budget_achieved', 'streak_bonus', 'category_complete'])
    .withMessage('Invalid activity type'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { activity, metadata = {} } = req.body;
  const user = req.user!;

  // Check if user has a connected wallet
  if (!user.walletAddress) {
    return res.status(400).json({
      success: false,
      message: 'Please connect your wallet to earn rewards'
    });
  }

  // Check if blockchain service is configured
  if (!blockchainService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Reward system temporarily unavailable'
    });
  }

  // Calculate reward amount based on activity
  let rewardAmount = '0';
  let reason = '';

  switch (activity) {
    case 'transaction_created':
      rewardAmount = REWARD_RATES.TRANSACTION_CREATED;
      reason = 'Transaction tracking reward';
      break;
    case 'budget_achieved':
      rewardAmount = REWARD_RATES.BUDGET_ACHIEVED;
      reason = 'Budget goal achievement reward';
      break;
    case 'streak_bonus':
      rewardAmount = REWARD_RATES.STREAK_BONUS;
      reason = `${metadata.streakDays || 1} day tracking streak bonus`;
      break;
    case 'category_complete':
      rewardAmount = REWARD_RATES.CATEGORY_COMPLETE;
      reason = 'Category completion bonus';
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid activity type'
      });
  }

  try {
    // Distribute reward on blockchain
    const result = await blockchainService.distributeReward(
      user.walletAddress,
      rewardAmount,
      reason
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to distribute reward'
      });
    }

    res.json({
      success: true,
      message: 'Reward earned successfully',
      data: {
        activity,
        amount: rewardAmount,
        reason,
        txHash: result.txHash,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Reward distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process reward'
    });
  }
}));

// @route   GET /api/rewards/balance/:walletAddress
// @desc    Get SWT token balance for a wallet address
// @access  Public
router.get('/balance/:walletAddress', [
  param('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address format')
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { walletAddress } = req.params;

  if (!blockchainService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain service temporarily unavailable'
    });
  }

  try {
    const balance = await blockchainService.getTokenBalance(walletAddress);

    res.json({
      success: true,
      data: {
        walletAddress,
        balance,
        symbol: 'SWT',
        name: 'SpendWise Token'
      }
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch token balance'
    });
  }
}));

// @route   GET /api/rewards/my-balance
// @desc    Get current user's SWT token balance
// @access  Private
router.get('/my-balance', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = req.user!;

  if (!user.walletAddress) {
    return res.status(400).json({
      success: false,
      message: 'No wallet connected to your account'
    });
  }

  if (!blockchainService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain service temporarily unavailable'
    });
  }

  try {
    const balance = await blockchainService.getTokenBalance(user.walletAddress);

    res.json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        balance,
        symbol: 'SWT',
        name: 'SpendWise Token'
      }
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your token balance'
    });
  }
}));

// @route   GET /api/rewards/opportunities
// @desc    Get available reward opportunities for the user
// @access  Private
router.get('/opportunities', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const userId = req.user!._id;

  try {
    // Get user's recent activity to suggest opportunities
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayTransactions = await Transaction.countDocuments({
      userId,
      createdAt: { $gte: startOfDay }
    });

    // Calculate streak (simplified - count consecutive days with transactions)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });

    const streakPromises = last7Days.map(async (date) => {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      
      const count = await Transaction.countDocuments({
        userId,
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });
      
      return count > 0;
    });

    const streakResults = await Promise.all(streakPromises);
    const currentStreak = streakResults.findIndex(hasTransaction => !hasTransaction);
    const streakDays = currentStreak === -1 ? 7 : currentStreak;

    // Get unique categories used
    const categoriesUsed = await Transaction.distinct('category', { userId });

    const opportunities = [
      {
        id: 'daily_transaction',
        title: 'Daily Transaction Tracking',
        description: 'Log at least one transaction today',
        reward: REWARD_RATES.TRANSACTION_CREATED,
        completed: todayTransactions > 0,
        progress: Math.min(todayTransactions, 1),
        maxProgress: 1
      },
      {
        id: 'tracking_streak',
        title: 'Tracking Streak Bonus',
        description: 'Maintain your daily tracking streak',
        reward: REWARD_RATES.STREAK_BONUS,
        completed: streakDays >= 3,
        progress: streakDays,
        maxProgress: 7
      },
      {
        id: 'category_diversity',
        title: 'Category Completion',
        description: 'Track expenses in all major categories',
        reward: REWARD_RATES.CATEGORY_COMPLETE,
        completed: categoriesUsed.length >= 5,
        progress: categoriesUsed.length,
        maxProgress: 8
      }
    ];

    res.json({
      success: true,
      data: {
        opportunities,
        totalPotentialRewards: opportunities
          .filter(opp => !opp.completed)
          .reduce((sum, opp) => sum + parseFloat(opp.reward), 0),
        streakDays,
        categoriesUsed: categoriesUsed.length
      }
    });
  } catch (error) {
    console.error('Error fetching reward opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reward opportunities'
    });
  }
}));

// @route   GET /api/rewards/contract-info
// @desc    Get SpendWise Token contract information
// @access  Public
router.get('/contract-info', asyncHandler(async (req: express.Request, res: express.Response) => {
  if (!blockchainService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain service not configured'
    });
  }

  try {
    const [contractInfo, networkInfo, gasPrice] = await Promise.all([
      blockchainService.getContractInfo(),
      blockchainService.getNetworkInfo(),
      blockchainService.getGasPrice()
    ]);

    res.json({
      success: true,
      data: {
        contract: {
          address: process.env.CONTRACT_ADDRESS,
          ...contractInfo
        },
        network: networkInfo,
        gasPrice: `${gasPrice} Gwei`,
        rewardRates: REWARD_RATES
      }
    });
  } catch (error) {
    console.error('Error fetching contract info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contract information'
    });
  }
}));

// @route   POST /api/rewards/batch-earn
// @desc    Batch earn rewards for multiple activities (admin only)
// @access  Private
router.post('/batch-earn', authenticate, [
  body('rewards')
    .isArray({ min: 1 })
    .withMessage('Rewards must be a non-empty array'),
  body('rewards.*.walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address'),
  body('rewards.*.amount')
    .isNumeric()
    .withMessage('Amount must be a positive number'),
  body('rewards.*.reason')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Reason must be between 1 and 100 characters')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // 🛡️ SECURITY: Restrict token minting/batch rewards to admin users only
  // Prevents unauthorized users from minting arbitrary rewards
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required to batch distribute rewards'
    });
  }

  const { rewards } = req.body;

  if (!blockchainService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain service not configured'
    });
  }

  try {
    const recipients = rewards.map((r: any) => r.walletAddress);
    const amounts = rewards.map((r: any) => r.amount.toString());
    const reason = 'Batch reward distribution';

    const result = await blockchainService.batchDistributeRewards(
      recipients,
      amounts,
      reason
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to distribute batch rewards'
      });
    }

    res.json({
      success: true,
      message: 'Batch rewards distributed successfully',
      data: {
        txHash: result.txHash,
        rewardCount: rewards.length,
        totalAmount: amounts.reduce((sum, amount) => sum + parseFloat(amount), 0)
      }
    });
  } catch (error) {
    console.error('Batch reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process batch rewards'
    });
  }
}));

export default router;
