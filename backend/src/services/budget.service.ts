import prisma from '../config/prisma';

export class BudgetService {
  async getAllBudgets(userId: string) {
    return await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBudgetById(userId: string, budgetId: string) {
    return await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId
      }
    });
  }

  async createBudget(userId: string, data: { category: string; limit: number; month: number; year: number }) {
    return await prisma.budget.create({
      data: {
        ...data,
        userId
      }
    });
  }

  async updateBudget(userId: string, budgetId: string, data: { category?: string; limit?: number; month?: number; year?: number }) {
    // We already checked authorization in the controller, but this is an extra safety measure
    return await prisma.budget.updateMany({
      where: {
        id: budgetId,
        userId
      },
      data
    });
  }

  async deleteBudget(userId: string, budgetId: string) {
    return await prisma.budget.deleteMany({
      where: {
        id: budgetId,
        userId
      }
    });
  }
}

export const budgetService = new BudgetService();
