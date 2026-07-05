import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { goalService } from '../services/goal.service';

export class GoalController {
  async getAllGoals(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const goals = await goalService.getAllGoals(userId);
      res.status(200).json(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getGoalById(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const goalId = req.params.id;
      
      const goal = await goalService.getGoalById(userId, goalId);
      
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found or unauthorized' });
      }
      
      res.status(200).json(goal);
    } catch (error) {
      console.error('Error fetching goal:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createGoal(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const { title, targetAmount, deadline } = req.body;

      const newGoal = await goalService.createGoal(userId, {
        title,
        targetAmount: parseFloat(targetAmount),
        deadline: new Date(deadline)
      });

      res.status(201).json(newGoal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateGoal(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const goalId = req.params.id;

      // Ensure goal exists and belongs to user
      const existingGoal = await goalService.getGoalById(userId, goalId);
      if (!existingGoal) {
        return res.status(404).json({ error: 'Goal not found or unauthorized' });
      }

      const { title, targetAmount, deadline } = req.body;
      const updateData: any = {};
      
      if (title) updateData.title = title;
      if (targetAmount !== undefined) updateData.targetAmount = parseFloat(targetAmount);
      if (deadline) updateData.deadline = new Date(deadline);

      await goalService.updateGoal(userId, goalId, updateData);
      
      // Fetch the updated record
      const updatedGoal = await goalService.getGoalById(userId, goalId);
      res.status(200).json(updatedGoal);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async addProgress(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const goalId = req.params.id;
      const { amount } = req.body;

      // Ensure goal exists and belongs to user
      const existingGoal = await goalService.getGoalById(userId, goalId);
      if (!existingGoal) {
        return res.status(404).json({ error: 'Goal not found or unauthorized' });
      }

      const updatedGoal = await goalService.addProgress(userId, goalId, parseFloat(amount));
      res.status(200).json(updatedGoal);
    } catch (error) {
      console.error('Error adding progress to goal:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteGoal(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const goalId = req.params.id;

      // Ensure goal exists and belongs to user
      const existingGoal = await goalService.getGoalById(userId, goalId);
      if (!existingGoal) {
        return res.status(404).json({ error: 'Goal not found or unauthorized' });
      }

      await goalService.deleteGoal(userId, goalId);
      res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const goalController = new GoalController();
