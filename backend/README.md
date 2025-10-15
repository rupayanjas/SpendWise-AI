# SpendWise AI Backend

A comprehensive backend system for SpendWise AI - an AI-powered personal finance and expense tracking DApp with blockchain integration.

## 🏗️ Architecture

### Core Technologies
- **Node.js + Express**: RESTful API server
- **TypeScript**: Type-safe development
- **MongoDB**: Document database for user data
- **Blockchain**: Polygon Amoy Testnet integration
- **OpenAI**: AI-powered expense categorization
- **JWT**: Authentication and authorization

### Key Features
- 🔐 **Authentication System**: JWT-based auth with optional MetaMask integration
- 💰 **Transaction Management**: CRUD operations with AI categorization
- 🏆 **Reward System**: ERC20 token rewards (SWT) for user activities
- 🔒 **Proof System**: Blockchain-based transaction verification
- 🤖 **AI Integration**: OpenAI-powered expense insights and categorization
- 📊 **Budget Tracking**: Automated budget updates and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- OpenAI API key (optional, has fallback)
- Polygon Amoy testnet wallet with MATIC (for blockchain features)

### Installation

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/spendwise-ai
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=your-openai-api-key-here
RPC_URL=https://rpc-amoy.polygon.technology/
CONTRACT_ADDRESS=your-deployed-contract-address
PRIVATE_KEY=your-wallet-private-key-for-testnet
FRONTEND_URL=http://localhost:5173
```

3. **Deploy Smart Contract** (Optional)
```bash
npm run deploy-contract
```

4. **Start Development Server**
```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

### Transactions (`/api/transactions`)
- `POST /` - Create transaction (with AI categorization)
- `GET /` - Get transactions (with filtering & pagination)
- `GET /:id` - Get single transaction
- `PUT /:id` - Update transaction
- `DELETE /:id` - Delete transaction
- `GET /insights/ai` - Get AI-powered spending insights

### Wallet (`/api/wallet`)
- `POST /connect` - Connect MetaMask wallet
- `DELETE /disconnect` - Disconnect wallet
- `GET /status` - Get wallet connection status
- `POST /verify` - Verify wallet ownership

### Rewards (`/api/rewards`)
- `POST /earn` - Earn SWT tokens for activities
- `GET /balance/:walletAddress` - Get token balance
- `GET /my-balance` - Get current user's balance
- `GET /opportunities` - Get available reward opportunities
- `GET /contract-info` - Get contract information
- `POST /batch-earn` - Batch distribute rewards

### Proof (`/api/proof`)
- `GET /transaction/:id` - Get transaction proof
- `POST /verify/:id` - Verify transaction on blockchain
- `POST /batch-verify` - Batch verify transactions
- `GET /stats` - Get verification statistics
- `GET /validate/:hash` - Validate transaction hash

## 🏦 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  walletAddress: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions Collection
```javascript
{
  userId: ObjectId,
  description: String,
  amount: Number,
  category: String,
  date: Date,
  hash: String (unique),
  type: 'income' | 'expense',
  tags: [String],
  location: String,
  merchant: String,
  proofHash: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Budgets Collection
```javascript
{
  userId: ObjectId,
  category: String,
  goal: Number,
  spent: Number,
  limit: Number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🪙 SpendWise Token (SWT)

### Contract Details
- **Name**: SpendWise Token
- **Symbol**: SWT
- **Total Supply**: 1,000,000 SWT
- **Decimals**: 18
- **Network**: Polygon Amoy Testnet

### Reward System
- **Transaction Created**: 0.1 SWT
- **Budget Achieved**: 1.0 SWT
- **Streak Bonus**: 0.5 SWT
- **Category Complete**: 2.0 SWT

### Contract Functions
- `distributeReward(address, uint256, string)` - Distribute rewards
- `storeTransactionProof(bytes32)` - Store transaction proof
- `verifyTransactionProof(bytes32)` - Verify proof exists
- `balanceOf(address)` - Get token balance

## 🤖 AI Features

### Expense Categorization
Automatically categorizes transactions using:
1. **OpenAI GPT-3.5**: Primary categorization with confidence scoring
2. **Fallback System**: Keyword-based categorization when AI unavailable

### Spending Insights
Generates personalized insights including:
- Spending pattern analysis
- Budget recommendations
- Trend identification
- Alert notifications

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers middleware

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://your-production-db
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=your-openai-key
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-key
CONTRACT_ADDRESS=your-mainnet-contract-address
PRIVATE_KEY=your-production-private-key
FRONTEND_URL=https://your-frontend-domain.com
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start           # Start production server
npm run deploy-contract  # Deploy smart contract
npm test            # Run tests
```

## 🌐 Blockchain Integration

### Polygon Amoy Testnet
- **RPC URL**: https://rpc-amoy.polygon.technology/
- **Chain ID**: 80002
- **Faucet**: https://faucet.polygon.technology/

### Getting Test MATIC
1. Visit the Polygon faucet
2. Enter your wallet address
3. Request test MATIC tokens
4. Wait for confirmation

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Console Logging**: Structured error logging
- **Health Check**: `/health` endpoint for monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check if MongoDB is running
- Verify connection string in `.env`
- Ensure network connectivity

**Blockchain Service Unavailable**
- Check RPC URL is accessible
- Verify private key format
- Ensure sufficient MATIC balance

**OpenAI API Errors**
- Verify API key is valid
- Check API quota limits
- Fallback system will activate automatically

**JWT Token Issues**
- Ensure JWT_SECRET is set
- Check token expiration (7 days default)
- Verify Authorization header format

### Support
For additional support, please check the main project documentation or create an issue in the repository.
