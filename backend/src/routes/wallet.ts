import express from 'express';
import { body, validationResult } from 'express-validator';
import { ethers } from 'ethers';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @route   POST /api/wallet/connect
// @desc    Connect wallet address to user account
// @access  Private
router.post('/connect', authenticate, [
  body('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Please provide a valid Ethereum wallet address'),
  body('signature')
    .notEmpty()
    .isString()
    .withMessage('Signature is required and must be a string'),
  body('message')
    .notEmpty()
    .isString()
    .withMessage('Message is required and must be a string')
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { walletAddress, signature, message } = req.body;
  const userId = req.user!._id;

  // Check if wallet is already connected to another user
  const existingUser = await User.findOne({
    walletAddress: walletAddress.toLowerCase(),
    _id: { $ne: userId }
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'This wallet address is already connected to another account'
    });
  }

  // Verify signature to prove wallet ownership
  try {
    // Prevent signature replay attacks and bind address to signature
    const messagePrefix = `Connect wallet ${walletAddress.toLowerCase()} to SpendWise AI account - `;
    if (!message.startsWith(messagePrefix)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message format'
      });
    }

    // Extract and verify timestamp to ensure message is recent (within 5 minutes)
    const timestampStr = message.replace(messagePrefix, '');
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp) || Date.now() - timestamp > 5 * 60 * 1000 || timestamp > Date.now() + 60000) {
      return res.status(400).json({
        success: false,
        message: 'Signature expired or invalid timestamp'
      });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature for wallet address'
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid signature format'
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { walletAddress: walletAddress.toLowerCase() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Wallet connected successfully',
    data: {
      user: updatedUser,
      walletAddress: walletAddress.toLowerCase()
    }
  });
}));

// @route   DELETE /api/wallet/disconnect
// @desc    Disconnect wallet from user account
// @access  Private
router.delete('/disconnect', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const userId = req.user!._id;

  // Remove wallet address from user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $unset: { walletAddress: 1 } },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Wallet disconnected successfully',
    data: {
      user: updatedUser
    }
  });
}));

// @route   GET /api/wallet/status
// @desc    Get wallet connection status
// @access  Private
router.get('/status', authenticate, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = req.user!;
  
  res.json({
    success: true,
    data: {
      isConnected: !!user.walletAddress,
      walletAddress: user.walletAddress || null,
      network: 'Polygon Amoy Testnet'
    }
  });
}));

// @route   POST /api/wallet/verify
// @desc    Verify wallet ownership with signature
// @access  Public (for verification purposes)
router.post('/verify', [
  body('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Please provide a valid Ethereum wallet address'),
  body('message')
    .isString()
    .withMessage('Message is required'),
  body('signature')
    .isString()
    .withMessage('Signature is required')
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { walletAddress, message, signature } = req.body;

  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    const isValid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase();

    res.json({
      success: true,
      data: {
        isValid,
        recoveredAddress,
        providedAddress: walletAddress
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid signature or message format',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;
