import { Router } from 'express';
import { check } from 'express-validator';
import { goalController } from '../controllers/goal.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Apply protect middleware to all goal routes
router.use(protect);

router.get('/', goalController.getAllGoals);
router.get('/:id', goalController.getGoalById);

router.post(
  '/',
  [
    check('title', 'Title is required and cannot be empty').not().isEmpty(),
    check('targetAmount', 'Target amount must be a positive number').isFloat({ gt: 0 }),
    check('deadline', 'Deadline must be a valid ISO8601 date').isISO8601()
  ],
  goalController.createGoal
);

router.put(
  '/:id',
  [
    check('title', 'Title cannot be empty').optional().not().isEmpty(),
    check('targetAmount', 'Target amount must be a positive number').optional().isFloat({ gt: 0 }),
    check('deadline', 'Deadline must be a valid ISO8601 date').optional().isISO8601()
  ],
  goalController.updateGoal
);

router.patch(
  '/:id/progress',
  [
    check('amount', 'Amount to add must be a positive number').isFloat({ gt: 0 })
  ],
  goalController.addProgress
);

router.delete('/:id', goalController.deleteGoal);

export default router;
