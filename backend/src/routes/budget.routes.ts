import { Router } from 'express';
import { check } from 'express-validator';
import { budgetController } from '../controllers/budget.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Apply protect middleware to all budget routes
router.use(protect);

router.get('/', budgetController.getAllBudgets);
router.get('/:id', budgetController.getBudgetById);

router.post(
  '/',
  [
    check('category', 'Category is required').not().isEmpty(),
    check('limit', 'Limit must be a positive number').isFloat({ gt: 0 }),
    check('month', 'Month must be between 1 and 12').isInt({ min: 1, max: 12 }),
    check('year', 'Year must be a valid 4-digit number').isInt({ min: 2000 })
  ],
  budgetController.createBudget
);

router.put(
  '/:id',
  [
    check('limit', 'Limit must be a positive number').optional().isFloat({ gt: 0 }),
    check('month', 'Month must be between 1 and 12').optional().isInt({ min: 1, max: 12 }),
    check('year', 'Year must be a valid 4-digit number').optional().isInt({ min: 2000 })
  ],
  budgetController.updateBudget
);

router.delete('/:id', budgetController.deleteBudget);

export default router;
