import prisma from '../config/prisma';
import { Investment } from '@prisma/client';

export class InvestmentService {
  async getAllInvestments(userId: string): Promise<Investment[]> {
    return prisma.investment.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
  }

  async getInvestmentById(id: string, userId: string): Promise<Investment | null> {
    return prisma.investment.findFirst({
      where: { id, userId }
    });
  }

  async createInvestment(userId: string, data: { name: string; value: number; type: string; date?: string }): Promise<Investment> {
    const dateObj = data.date ? new Date(data.date) : new Date();

    return prisma.$transaction(async (tx) => {
      // 1. Create the Investment record
      const investment = await tx.investment.create({
        data: {
          name: data.name,
          value: data.value,
          type: data.type,
          date: dateObj,
          userId
        }
      });

      // 2. Create the associated Transaction record as an expense of category "Investment"
      await tx.transaction.create({
        data: {
          description: `Investment Purchase: ${data.name}`,
          amount: data.value,
          type: 'expense',
          category: 'Investment',
          date: dateObj,
          userId,
          investmentId: investment.id
        }
      });

      return investment;
    });
  }

  async deleteInvestment(id: string, userId: string): Promise<Investment> {
    return prisma.$transaction(async (tx) => {
      // Find investment first to verify ownership and existence
      const investment = await tx.investment.findFirst({
        where: { id, userId }
      });

      if (!investment) {
        throw new Error('Investment not found or unauthorized');
      }

      // 1. Delete associated transactions first
      await tx.transaction.deleteMany({
        where: { investmentId: id }
      });

      // 2. Delete the Investment record
      await tx.investment.delete({
        where: { id }
      });

      return investment;
    });
  }
}

export const investmentService = new InvestmentService();
