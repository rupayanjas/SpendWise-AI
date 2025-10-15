# 🚀 SpendWise AI Backend Setup Guide

Complete setup instructions for the SpendWise AI backend system with blockchain integration.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** and npm installed
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **Git** for version control
- **MetaMask** wallet (for blockchain features)
- **OpenAI API Key** (optional - has fallback system)

## 🏗️ Quick Setup (5 minutes)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Run Automated Setup
```bash
npm run setup
```

This will:
- Install all dependencies
- Create `.env` file from template
- Check system requirements
- Display configuration checklist

### 3. Configure Environment Variables

Edit the `.env` file with your settings:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (Required)
MONGO_URI=mongodb://localhost:27017/spendwise-ai

# Authentication (Required)
JWT_SECRET=your-super-secret-jwt-key-change-this

# AI Features (Optional - has fallback)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Blockchain (Optional - for Web3 features)
RPC_URL=https://rpc-amoy.polygon.technology/
CONTRACT_ADDRESS=your-deployed-contract-address
PRIVATE_KEY=your-wallet-private-key-for-testnet

# CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Or use MongoDB Atlas** (cloud):
- Sign up at https://www.mongodb.com/atlas
- Create a cluster
- Get connection string
- Update `MONGO_URI` in `.env`

### 5. Start the Backend Server
```bash
npm run dev
```

The backend will be available at: http://localhost:3001

### 6. Verify Installation
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SpendWise AI Backend is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## 🌐 Blockchain Setup (Optional)

For full Web3 functionality, follow these additional steps:

### 1. Get Test MATIC Tokens
- Visit: https://faucet.polygon.technology/
- Connect your MetaMask wallet
- Select "Polygon Amoy Testnet"
- Request test MATIC tokens

### 2. Deploy Smart Contract
```bash
npm run deploy-contract
```

This will:
- Deploy the SpendWise Token (SWT) contract
- Update your `.env` with the contract address
- Save deployment info to `deployment.json`

### 3. Configure MetaMask
Add Polygon Amoy Testnet to MetaMask:
- **Network Name**: Polygon Amoy Testnet
- **RPC URL**: https://rpc-amoy.polygon.technology/
- **Chain ID**: 80002
- **Currency Symbol**: MATIC
- **Block Explorer**: https://amoy.polygonscan.com/

## 📊 Database Setup

The backend automatically creates the required collections:

### Collections Created:
- `users` - User accounts and wallet addresses
- `transactions` - Financial transactions with AI categorization
- `budgets` - Budget tracking and limits

### Sample Data (Optional)
You can create test data through the API endpoints or use the frontend interface.

## 🔑 API Authentication

### Register a Test User:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login and Get Token:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned `token` for authenticated requests.

## 🧪 Testing the API

### Create a Transaction:
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Coffee at Starbucks",
    "amount": 5.50,
    "type": "expense"
  }'
```

### Connect Wallet:
```bash
curl -X POST http://localhost:3001/api/wallet/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "walletAddress": "0xYourWalletAddress"
  }'
```

### Get AI Insights:
```bash
curl -X GET http://localhost:3001/api/transactions/insights/ai \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Deploy smart contract
npm run deploy-contract
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── types/           # TypeScript definitions
│   ├── tests/           # Test files
│   └── server.ts        # Main server file
├── contracts/           # Smart contracts
├── scripts/             # Utility scripts
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── README.md           # Documentation
```

## 🌟 Key Features

### ✅ Implemented Features:
- **JWT Authentication** with secure password hashing
- **MongoDB Integration** with Mongoose ODM
- **AI-Powered Categorization** using OpenAI GPT-3.5
- **Blockchain Integration** with Polygon Amoy testnet
- **ERC20 Token Rewards** (SpendWise Token - SWT)
- **Transaction Proof System** with blockchain verification
- **Comprehensive API** with validation and error handling
- **CORS and Security** middleware
- **Rate Limiting** and request validation

### 🔄 API Endpoints:
- **Authentication**: `/api/auth/*`
- **Transactions**: `/api/transactions/*`
- **Wallet**: `/api/wallet/*`
- **Rewards**: `/api/rewards/*`
- **Proof**: `/api/proof/*`

## 🚨 Troubleshooting

### Common Issues:

**Port Already in Use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**MongoDB Connection Failed:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

**Blockchain Features Not Working:**
- Check if `CONTRACT_ADDRESS` is set
- Verify `PRIVATE_KEY` format (without 0x prefix)
- Ensure sufficient MATIC balance

**OpenAI API Errors:**
- Verify API key is valid
- Check usage limits
- Fallback system will activate automatically

**JWT Token Issues:**
- Ensure `JWT_SECRET` is set and secure
- Check token expiration (7 days default)
- Verify `Authorization: Bearer <token>` header format

### Getting Help:
1. Check the logs in the terminal
2. Verify environment variables
3. Test individual endpoints with curl
4. Check MongoDB connection
5. Review the comprehensive README.md

## 🎯 Next Steps

1. **Start the Frontend**: Navigate to the root directory and run the React frontend
2. **Test Integration**: Create transactions through the UI
3. **Connect Wallet**: Link your MetaMask wallet for Web3 features
4. **Earn Rewards**: Complete activities to earn SWT tokens
5. **Explore AI Features**: Get spending insights and categorization

## 📚 Additional Resources

- **API Documentation**: `/backend/README.md`
- **Smart Contract**: `/backend/contracts/SpendWiseToken.sol`
- **Frontend Integration**: Root directory React app
- **Polygon Testnet**: https://amoy.polygonscan.com/
- **MongoDB Docs**: https://docs.mongodb.com/

---

**🎉 Congratulations!** Your SpendWise AI backend is now ready to power the intelligent expense tracking DApp with blockchain integration.
