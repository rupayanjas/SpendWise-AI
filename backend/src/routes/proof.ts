import express from 'express';
import { param, body, validationResult } from 'express-validator';
import crypto from 'crypto';
import Transaction from '../models/Transaction';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { blockchainService } from '../services/blockchain';

const router = express.Router();

// @route   GET /api/proof/transaction/:id
// @desc    Get proof information for a specific transaction
// @access  Private
router.get('/transaction/:id', authenticate, [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const userId = req.user!._id;

  // Find transaction
  const transaction = await Transaction.findOne({
    _id: id,
    userId
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if proof exists on blockchain (if configured)
  let blockchainVerified = false;
  let blockchainError = null;

  if (blockchainService.isConfigured() && transaction.hash) {
    try {
      blockchainVerified = await blockchainService.verifyTransactionProof(transaction.hash);
    } catch (error) {
      console.error('Blockchain verification error:', error);
      blockchainError = 'Failed to verify on blockchain';
    }
  }

  // Generate proof data
  const proofData = {
    transactionId: transaction._id,
    hash: transaction.hash,
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
    date: transaction.date,
    userId: transaction.userId,
    createdAt: transaction.createdAt
  };

  // Create verification hash
  const verificationHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(proofData))
    .digest('hex');

  res.json({
    success: true,
    data: {
      transaction: {
        id: transaction._id,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        hash: transaction.hash
      },
      proof: {
        verificationHash,
        isVerified: transaction.isVerified,
        blockchainVerified,
        blockchainError,
        proofHash: transaction.proofHash,
        timestamp: transaction.createdAt
      },
      blockchain: {
        configured: blockchainService.isConfigured(),
        contractAddress: process.env.CONTRACT_ADDRESS || null,
        network: 'Polygon Amoy Testnet'
      }
    }
  });
}));

// @route   POST /api/proof/verify/:id
// @desc    Verify and store transaction proof on blockchain
// @access  Private
router.post('/verify/:id', authenticate, [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const userId = req.user!._id;

  // Find transaction
  const transaction = await Transaction.findOne({
    _id: id,
    userId
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  if (transaction.isVerified) {
    return res.status(400).json({
      success: false,
      message: 'Transaction is already verified'
    });
  }

  if (!blockchainService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain verification service not available'
    });
  }

  try {
    // Store proof on blockchain
    const result = await blockchainService.storeTransactionProof(transaction.hash);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to store proof on blockchain'
      });
    }

    // Update transaction as verified
    transaction.isVerified = true;
    transaction.proofHash = result.txHash;
    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction proof verified and stored on blockchain',
      data: {
        transactionId: transaction._id,
        txHash: result.txHash,
        proofHash: transaction.proofHash,
        isVerified: true,
        verifiedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Proof verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify transaction proof'
    });
  }
}));

// @route   POST /api/proof/batch-verify
// @desc    Batch verify multiple transactions on blockchain
// @access  Private
router.post('/batch-verify', authenticate, [
  body('transactionIds')
    .isArray({ min: 1, max: 50 })
    .withMessage('Transaction IDs must be an array with 1-50 items'),
  body('transactionIds.*')
    .isMongoId()
    .withMessage('Each transaction ID must be valid')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { transactionIds } = req.body;
  const userId = req.user!._id;

  if (!blockchainService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain verification service not available'
    });
  }

  try {
    // Find all transactions
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      userId,
      isVerified: false
    });

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No unverified transactions found'
      });
    }

    // Get transaction hashes
    const proofHashes = transactions.map(t => t.hash);

    // Store proofs on blockchain
    const result = await blockchainService.batchStoreProofs(proofHashes);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to store proofs on blockchain'
      });
    }

    // Update all transactions as verified
    await Transaction.updateMany(
      { _id: { $in: transactions.map(t => t._id) } },
      { 
        isVerified: true,
        proofHash: result.txHash
      }
    );

    res.json({
      success: true,
      message: 'Batch verification completed successfully',
      data: {
        verifiedCount: transactions.length,
        txHash: result.txHash,
        transactionIds: transactions.map(t => t._id)
      }
    });
  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to batch verify transactions'
    });
  }
}));

// @route   GET /api/proof/stats
// @desc    Get proof and verification statistics for user
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const userId = req.user!._id;

  try {
    // Get verification statistics
    const [totalTransactions, verifiedTransactions, unverifiedTransactions] = await Promise.all([
      Transaction.countDocuments({ userId }),
      Transaction.countDocuments({ userId, isVerified: true }),
      Transaction.countDocuments({ userId, isVerified: false })
    ]);

    // Get recent verification activity
    const recentVerifications = await Transaction.find({
      userId,
      isVerified: true,
      proofHash: { $exists: true }
    })
    .sort({ updatedAt: -1 })
    .limit(10)
    .select('_id description amount category proofHash updatedAt');

    // Calculate verification percentage
    const verificationPercentage = totalTransactions > 0 
      ? Math.round((verifiedTransactions / totalTransactions) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        statistics: {
          totalTransactions,
          verifiedTransactions,
          unverifiedTransactions,
          verificationPercentage
        },
        recentVerifications,
        blockchain: {
          configured: blockchainService.isConfigured(),
          contractAddress: process.env.CONTRACT_ADDRESS || null,
          network: 'Polygon Amoy Testnet'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching proof stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proof statistics'
    });
  }
}));

// @route   GET /api/proof/validate/:hash
// @desc    Validate a transaction hash against blockchain
// @access  Public
router.get('/validate/:hash', [
  param('hash')
    .isLength({ min: 64, max: 64 })
    .isHexadecimal()
    .withMessage('Invalid hash format')
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { hash } = req.params;

  if (!blockchainService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Blockchain validation service not available'
    });
  }

  try {
    // Check if hash exists in our database
    const transaction = await Transaction.findOne({ hash }).select('_id description amount category date isVerified');

    // Verify on blockchain
    const blockchainVerified = await blockchainService.verifyTransactionProof(hash);

    res.json({
      success: true,
      data: {
        hash,
        existsInDatabase: !!transaction,
        blockchainVerified,
        transaction: transaction ? {
          id: transaction._id,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
          isVerified: transaction.isVerified
        } : null,
        validatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Hash validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate hash'
    });
  }
}));

export default router;
