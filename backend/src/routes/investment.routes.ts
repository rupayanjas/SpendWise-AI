import { Router } from 'express';
import { investmentController } from '../controllers/investment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all investment routes
router.use(protect);

router.get('/', investmentController.getAllInvestments);
router.get('/:id', investmentController.getInvestmentById);
router.post('/', investmentController.createInvestment);
router.delete('/:id', investmentController.deleteInvestment);

export default router;
