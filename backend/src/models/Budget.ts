import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  goal: number;
  spent: number;
  limit: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Education',
      'Travel',
      'Investment',
      'Other',
      'Total'
    ]
  },
  goal: {
    type: Number,
    required: [true, 'Budget goal is required'],
    min: [0, 'Goal must be greater than or equal to 0']
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0.01, 'Limit must be greater than 0']
  },
  period: {
    type: String,
    required: [true, 'Budget period is required'],
    enum: ['weekly', 'monthly', 'yearly']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure unique budget per user per category per period
budgetSchema.index({ userId: 1, category: 1, period: 1, isActive: 1 }, { unique: true });

// Calculate remaining budget
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.limit - this.spent);
});

// Calculate progress percentage
budgetSchema.virtual('progressPercentage').get(function() {
  return Math.min(100, (this.spent / this.limit) * 100);
});

// Include virtuals in JSON
budgetSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IBudget>('Budget', budgetSchema);
