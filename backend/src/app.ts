import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import transactionRoutes from './routes/transaction.routes';
import authRoutes from './routes/auth.routes';
import budgetRoutes from './routes/budget.routes';
import goalRoutes from './routes/goal.routes';
import aiRoutes from './routes/ai.routes';
import investmentRoutes from './routes/investment.routes';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health Endpoints
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/investments', investmentRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
