import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const result = await authService.registerUser(name, email, password);

      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Error during registration:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);

      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ success: false, message: error.message });
      }
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      // req.user is set by auth middleware
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      const user = await authService.getUserById(userId);
      res.status(200).json(user);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      console.error('Error fetching current user:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async logout(req: Request, res: Response) {
    // In a stateless JWT implementation, logout is handled by the client removing the token.
    // For now, we simply return a success message.
    res.status(200).json({ message: 'Logged out successfully' });
  }
}

export const authController = new AuthController();
