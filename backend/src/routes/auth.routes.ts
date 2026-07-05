import { Router } from 'express';
import { check } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Register User
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
  ],
  authController.register
);

// Login User
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Get Current Logged-in User
router.get('/me', protect, authController.getMe);

// Logout User
router.post('/logout', authController.logout);

export default router;
