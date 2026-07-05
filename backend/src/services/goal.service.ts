import prisma from '../config/prisma';

export class GoalService {
  async getAllGoals(userId: string) {
    return await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getGoalById(userId: string, goalId: string) {
    return await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId
      }
    });
  }

  async createGoal(userId: string, data: { title: string; targetAmount: number; deadline: Date }) {
    return await prisma.goal.create({
      data: {
        ...data,
        userId
      }
    });
  }

  async updateGoal(userId: string, goalId: string, data: { title?: string; targetAmount?: number; deadline?: Date }) {
    return await prisma.goal.updateMany({
      where: {
        id: goalId,
        userId
      },
      data
    });
  }

  async deleteGoal(userId: string, goalId: string) {
    return await prisma.goal.deleteMany({
      where: {
        id: goalId,
        userId
      }
    });
  }

  async addProgress(userId: string, goalId: string, addedAmount: number) {
    // Fetch current goal first to determine new values
    const goal = await this.getGoalById(userId, goalId);
    
    if (!goal) {
      throw new Error('Goal not found');
    }

    const newAmount = goal.currentAmount + addedAmount;
    const isCompleted = newAmount >= goal.targetAmount;

    // Update using unique ID now that we verified ownership
    return await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: newAmount,
        completed: isCompleted
      }
    });
  }
}

export const goalService = new GoalService();
