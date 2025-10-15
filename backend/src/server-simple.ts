import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SpendWise AI Backend is running (Simple Mode)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    note: 'MongoDB connection disabled for testing'
  });
});

// Simple test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working!',
    endpoints: [
      'GET /health - Health check',
      'GET /api/test - This endpoint',
      'POST /api/test - Echo test'
    ]
  });
});

app.post('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'POST request received',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: ['/health', '/api/test']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SpendWise AI Backend (Simple Mode) running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📝 To use full features:');
  console.log('1. Install MongoDB: brew install mongodb-community');
  console.log('2. Start MongoDB: brew services start mongodb-community');
  console.log('3. Run: npm run dev');
});

export default app;
