import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';

const isValidDate = (dateString: string) => {
  const regEx = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|([+-]\d{2}:\d{2})))?$/;
  if (!dateString.match(regEx)) return false;  // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().startsWith(dateString.substring(0, 10));
};

export class TransactionController {
  
  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await transactionService.getAllTransactions(req.user!.userId);
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await transactionService.getTransactionById(id, req.user!.userId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.status(200).json(transaction);
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createTransaction(req: Request, res: Response) {
    try {
      const { description, amount, type, category, date, userId } = req.body;
      const errors: string[] = [];

      // Validation
      if (!description || typeof description !== 'string') errors.push('description is required and must be a string');
      if (amount === undefined || typeof amount !== 'number') errors.push('amount is required and must be a number');
      if (!type || (type !== 'income' && type !== 'expense')) errors.push('type must be either "income" or "expense"');
      if (!category || typeof category !== 'string') errors.push('category is required and must be a string');
      if (!date || typeof date !== 'string' || !isValidDate(date)) errors.push('date is required and must be a valid ISO date string');

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const transaction = await transactionService.createTransaction({
        description,
        amount,
        type,
        category,
        date: new Date(date),
        userId: req.user!.userId
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { description, amount, type, category, date } = req.body;
      
      // Check if transaction exists and belongs to user
      const existing = await transactionService.getTransactionById(id, req.user!.userId);
      if (!existing) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const errors: string[] = [];

      // Validation (partial)
      if (description !== undefined && typeof description !== 'string') errors.push('description must be a string');
      if (amount !== undefined && typeof amount !== 'number') errors.push('amount must be a number');
      if (type !== undefined && type !== 'income' && type !== 'expense') errors.push('type must be either "income" or "expense"');
      if (category !== undefined && typeof category !== 'string') errors.push('category must be a string');
      if (date !== undefined && (typeof date !== 'string' || !isValidDate(date))) errors.push('date must be a valid ISO date string');

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const updateData: any = {};
      if (description !== undefined) updateData.description = description;
      if (amount !== undefined) updateData.amount = amount;
      if (type !== undefined) updateData.type = type;
      if (category !== undefined) updateData.category = category;
      if (date !== undefined) updateData.date = new Date(date);

      const updatedTransaction = await transactionService.updateTransaction(id, updateData);
      res.status(200).json(updatedTransaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async deleteTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if transaction exists and belongs to user before trying to delete it
      const existing = await transactionService.getTransactionById(id, req.user!.userId);
      if (!existing) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      await transactionService.deleteTransaction(id);
      res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const transactionController = new TransactionController();
