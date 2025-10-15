import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import User from '../models/User';
import Transaction from '../models/Transaction';

// Test database
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/spendwise-test';

describe('SpendWise API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Transaction.deleteMany({});
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        message: 'SpendWise AI Backend is running'
      });
    });
  });

  describe('Authentication', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.token).toBeDefined();

      authToken = response.body.data.token;
      userId = response.body.data.user._id;
    });

    it('should login existing user', async () => {
      // First register
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should get user profile', async () => {
      // Register and get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const token = registerResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });
  });

  describe('Transactions', () => {
    beforeEach(async () => {
      // Register user and get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = registerResponse.body.data.token;
      userId = registerResponse.body.data.user._id;
    });

    it('should create a new transaction', async () => {
      const transactionData = {
        description: 'Coffee at Starbucks',
        amount: 5.50,
        type: 'expense',
        category: 'Food & Dining'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transaction.description).toBe(transactionData.description);
      expect(response.body.data.transaction.hash).toBeDefined();
    });

    it('should get user transactions', async () => {
      // Create a transaction first
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Transaction',
          amount: 10.00,
          type: 'expense',
          category: 'Other'
        });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should get AI insights', async () => {
      // Create some transactions
      const transactions = [
        { description: 'Grocery shopping', amount: 50, type: 'expense', category: 'Food & Dining' },
        { description: 'Gas station', amount: 30, type: 'expense', category: 'Transportation' }
      ];

      for (const transaction of transactions) {
        await request(app)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${authToken}`)
          .send(transaction);
      }

      const response = await request(app)
        .get('/api/transactions/insights/ai')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.insights).toBeDefined();
    });
  });

  describe('Wallet Integration', () => {
    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = registerResponse.body.data.token;
    });

    it('should connect wallet address', async () => {
      const walletAddress = '0x742d35Cc6634C0532925a3b8D6Ac9E6C5F8d8E8E';

      const response = await request(app)
        .post('/api/wallet/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ walletAddress })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.walletAddress).toBe(walletAddress.toLowerCase());
    });

    it('should get wallet status', async () => {
      const response = await request(app)
        .get('/api/wallet/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isConnected).toBe(false);
    });

    it('should verify wallet signature', async () => {
      const verificationData = {
        walletAddress: '0x742d35Cc6634C0532925a3b8D6Ac9E6C5F8d8E8E',
        message: 'Test message',
        signature: '0x' + 'a'.repeat(130) // Mock signature
      };

      // This will fail with invalid signature, but tests the endpoint
      const response = await request(app)
        .post('/api/wallet/verify')
        .send(verificationData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rewards System', () => {
    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = registerResponse.body.data.token;

      // Connect wallet
      await request(app)
        .post('/api/wallet/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ walletAddress: '0x742d35Cc6634C0532925a3b8D6Ac9E6C5F8d8E8E' });
    });

    it('should get reward opportunities', async () => {
      const response = await request(app)
        .get('/api/rewards/opportunities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.opportunities).toBeDefined();
      expect(Array.isArray(response.body.data.opportunities)).toBe(true);
    });

    it('should get contract info', async () => {
      const response = await request(app)
        .get('/api/rewards/contract-info')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rewardRates).toBeDefined();
    });

    it('should get token balance', async () => {
      const walletAddress = '0x742d35Cc6634C0532925a3b8D6Ac9E6C5F8d8E8E';

      // This might fail if blockchain service is not configured, but tests the endpoint
      const response = await request(app)
        .get(`/api/rewards/balance/${walletAddress}`);

      // Accept both success and service unavailable
      expect([200, 503]).toContain(response.status);
    });
  });

  describe('Proof System', () => {
    let transactionId: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = registerResponse.body.data.token;

      // Create a transaction
      const transactionResponse = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test Transaction',
          amount: 10.00,
          type: 'expense',
          category: 'Other'
        });

      transactionId = transactionResponse.body.data.transaction._id;
    });

    it('should get transaction proof', async () => {
      const response = await request(app)
        .get(`/api/proof/transaction/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transaction).toBeDefined();
      expect(response.body.data.proof).toBeDefined();
    });

    it('should get proof statistics', async () => {
      const response = await request(app)
        .get('/api/proof/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toBeDefined();
    });

    it('should validate transaction hash', async () => {
      // Get the transaction hash first
      const proofResponse = await request(app)
        .get(`/api/proof/transaction/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const hash = proofResponse.body.data.transaction.hash;

      // This might fail if blockchain service is not configured
      const response = await request(app)
        .get(`/api/proof/validate/${hash}`);

      // Accept both success and service unavailable
      expect([200, 503]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send('invalid json')
        .expect(400);
    });
  });
});
