import express, { Application, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import transactionRoutes from './routes/transaction.routes';
import authRoutes from './routes/auth.routes';
import budgetRoutes from './routes/budget.routes';
import goalRoutes from './routes/goal.routes';
import aiRoutes from './routes/ai.routes';
import investmentRoutes from './routes/investment.routes';

const app: Application = express();

// -------------------------
// Security & Middleware
// -------------------------
app.use(helmet());

const allowedOrigins: string[] = ['http://localhost:8081'];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // For this demonstration/portfolio app, we allow all requested origins
    // to prevent tricky Vercel-to-Render trailing slash matching issues.
    // In strict enterprise prod, you would strictly validate `origin`.
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev')
);

// -------------------------
// Health Routes
// -------------------------
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// -------------------------
// API Routes
// -------------------------
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/investments', investmentRoutes);

// -------------------------
// Global Error Handler
// -------------------------
app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(err.stack);

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
);

export default app;