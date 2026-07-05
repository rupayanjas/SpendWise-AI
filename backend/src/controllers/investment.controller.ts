import { Request, Response } from 'express';
import { investmentService } from '../services/investment.service';

export class InvestmentController {
  async getAllInvestments(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const investments = await investmentService.getAllInvestments(userId);
      res.status(200).json(investments);
    } catch (error) {
      console.error('Error fetching investments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getInvestmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const investment = await investmentService.getInvestmentById(id, userId);

      if (!investment) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      res.status(200).json(investment);
    } catch (error) {
      console.error('Error fetching investment by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createInvestment(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { name, value, type, date } = req.body;

      const errors: string[] = [];
      if (!name || typeof name !== 'string') errors.push('name is required and must be a string');
      if (value === undefined || typeof value !== 'number') errors.push('value is required and must be a number');
      if (!type || typeof type !== 'string') errors.push('type is required and must be a string');

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const investment = await investmentService.createInvestment(userId, { name, value, type, date });
      res.status(201).json(investment);
    } catch (error) {
      console.error('Error creating investment:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteInvestment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      
      const investment = await investmentService.deleteInvestment(id, userId);
      res.status(200).json({ message: 'Investment deleted successfully', investment });
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      if (error.message === 'Investment not found or unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const investmentController = new InvestmentController();
