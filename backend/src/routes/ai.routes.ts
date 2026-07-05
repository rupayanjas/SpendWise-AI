import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Ensure all AI routes require authentication
router.use(protect);

router.post('/analyze', aiController.generateAnalysis);
router.post('/chat', aiController.chat);
router.get('/dashboard-insights', aiController.getDashboardInsights);

export default router;
