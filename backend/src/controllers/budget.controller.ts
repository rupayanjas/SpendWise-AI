import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { budgetService } from '../services/budget.service';

export class BudgetController {
  async getAllBudgets(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const budgets = await budgetService.getAllBudgets(userId);
      res.status(200).json(budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getBudgetById(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const budgetId = req.params.id;
      
      const budget = await budgetService.getBudgetById(userId, budgetId);
      
      if (!budget) {
        return res.status(404).json({ error: 'Budget not found or unauthorized' });
      }
      
      res.status(200).json(budget);
    } catch (error) {
      console.error('Error fetching budget:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createBudget(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const { category, limit, month, year } = req.body;

      const newBudget = await budgetService.createBudget(userId, {
        category,
        limit: parseFloat(limit),
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      });

      res.status(201).json(newBudget);
    } catch (error) {
      console.error('Error creating budget:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateBudget(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const budgetId = req.params.id;

      // Ensure budget exists and belongs to user
      const existingBudget = await budgetService.getBudgetById(userId, budgetId);
      if (!existingBudget) {
        return res.status(404).json({ error: 'Budget not found or unauthorized' });
      }

      const { category, limit, month, year } = req.body;
      const updateData: any = {};
      
      if (category) updateData.category = category;
      if (limit !== undefined) updateData.limit = parseFloat(limit);
      if (month !== undefined) updateData.month = parseInt(month, 10);
      if (year !== undefined) updateData.year = parseInt(year, 10);

      await budgetService.updateBudget(userId, budgetId, updateData);
      
      // Fetch the updated record to return
      const updatedBudget = await budgetService.getBudgetById(userId, budgetId);
      res.status(200).json(updatedBudget);
    } catch (error) {
      console.error('Error updating budget:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteBudget(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const budgetId = req.params.id;

      // Ensure budget exists and belongs to user
      const existingBudget = await budgetService.getBudgetById(userId, budgetId);
      if (!existingBudget) {
        return res.status(404).json({ error: 'Budget not found or unauthorized' });
      }

      await budgetService.deleteBudget(userId, budgetId);
      res.status(200).json({ message: 'Budget deleted successfully' });
    } catch (error) {
      console.error('Error deleting budget:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const budgetController = new BudgetController();
