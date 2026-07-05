import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all transaction routes
router.use(protect);

// Retrieve all transactions
router.get('/', transactionController.getAllTransactions);

// Retrieve a specific transaction by ID
router.get('/:id', transactionController.getTransactionById);

// Create a new transaction
router.post('/', transactionController.createTransaction);

// Update an existing transaction by ID
router.put('/:id', transactionController.updateTransaction);

// Delete a transaction by ID
router.delete('/:id', transactionController.deleteTransaction);

export default router;
