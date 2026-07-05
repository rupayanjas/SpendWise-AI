import prisma from '../config/prisma';
import { Transaction } from '@prisma/client';

export class TransactionService {
  async getAllTransactions(userId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: { id, userId }
    });
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'investmentId'> & { investmentId?: string | null }): Promise<Transaction> {
    return prisma.transaction.create({
      data
    });
  }

  async updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'investmentId'>> & { investmentId?: string | null }): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data
    });
  }

  async deleteTransaction(id: string): Promise<Transaction> {
    return prisma.transaction.delete({
      where: { id }
    });
  }
}

export const transactionService = new TransactionService();
