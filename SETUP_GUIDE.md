# SpendWise AI - Setup Guide

## 🎯 Quick Status Check

### ✅ Already Working:
- **MongoDB**: Connected and running
- **Backend API**: All 40+ endpoints active on http://localhost:3001
- **Frontend**: Running on http://localhost:8080
- **Web3**: MetaMask integration ready

### ⚠️ Needs Configuration:
- **Gemini AI**: Requires API key for AI features
- **OpenAI (Optional)**: Backend AI categorization (optional)
- **Blockchain Contract**: SWT token contract deployment (optional)

---

## 🚀 Step-by-Step Setup

### Step 1: Get Gemini AI API Key (REQUIRED for AI Features)

1. **Visit**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click** "Create API Key"
4. **Copy** the generated API key

5. **Add to Frontend .env**:
   ```bash
   # Open the file
   nano .env
   
   # Or use VS Code
   code .env
   ```

6. **Paste your API key**:
   ```env
   VITE_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

7. **Save** the file (Ctrl+O, Enter, Ctrl+X for nano)

8. **Restart Frontend**:
   ```bash
   # Stop the current frontend (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### Step 2: Verify AI Integration

After adding the Gemini API key and restarting:

1. **Visit**: http://localhost:8080/dashboard
2. **Click** the AI chatbot button (Bot icon in header)
3. **Ask** a question like: "How can I save more money?"
4. **You should see**: Intelligent AI responses (not generic fallback messages)

---

## 🧪 Test Your Setup

### Test MongoDB (Already Working ✅)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

Expected: JSON response with user data and token

### Test Gemini AI (After adding API key)
1. Go to Dashboard
2. Click AI chatbot
3. Ask: "Analyze my spending patterns"
4. Should get intelligent, contextual response

### Test File Upload
1. Go to Dashboard → Bank Statement tab
2. Upload the `test-bank-statement.csv` file
3. Transactions should import with proper names (no symbols)
4. AI should categorize them automatically

---

## 🔐 Environment Variables Reference

### Frontend (`.env` in root directory)
```env
# REQUIRED for AI features
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL (already configured)
VITE_API_BASE_URL=http://localhost:3001/api
```

### Backend (`backend/.env` - already configured ✅)
```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/spendwise-ai
JWT_SECRET=spendwise-super-secret-jwt-key-for-development-only
FRONTEND_URL=http://localhost:8080

# Optional: OpenAI for backend AI
OPENAI_API_KEY=your_openai_key_here

# Optional: Blockchain
RPC_URL=https://rpc-amoy.polygon.technology/
CONTRACT_ADDRESS=your_contract_address
PRIVATE_KEY=your_testnet_private_key
```

---

## 🎨 What Works Without API Keys

### Without Gemini AI:
- ✅ All basic features (transactions, budgets, charts)
- ✅ File upload (basic parsing)
- ✅ Web3 wallet connection
- ✅ SWT token tracking (local)
- ❌ AI chatbot (shows fallback messages)
- ❌ AI budget suggestions (shows generic advice)
- ❌ AI expense categorization (uses basic rules)

### With Gemini AI:
- ✅ Everything above PLUS:
- ✅ Intelligent AI chatbot with context
- ✅ Personalized budget recommendations
- ✅ Smart expense categorization
- ✅ Spending pattern analysis
- ✅ Financial advice based on your data

---

## 🔧 Optional: Deploy SWT Token Contract

If you want real blockchain rewards:

1. **Get Polygon Amoy testnet MATIC**:
   - Visit: https://faucet.polygon.technology/
   - Select "Amoy Testnet"
   - Enter your wallet address

2. **Deploy Contract**:
   ```bash
   cd backend
   npm run deploy-contract
   ```

3. **Update backend/.env**:
   ```env
   CONTRACT_ADDRESS=<address_from_deployment>
   PRIVATE_KEY=<your_testnet_private_key>
   ```

4. **Restart Backend**:
   ```bash
   npm run dev
   ```

---

## 🐛 Troubleshooting

### AI Not Working?
1. Check if `.env` file exists in root directory
2. Verify `VITE_GEMINI_API_KEY` is set correctly
3. Restart frontend: `npm run dev`
4. Check browser console for errors

### MongoDB Connection Error?
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb-community
```

### Backend Not Responding?
```bash
# Check backend status
curl http://localhost:3001/health

# Restart backend
cd backend
npm run dev
```

### Frontend Not Loading?
```bash
# Check if running on correct port
# Should be http://localhost:8080 (not 5173)
npm run dev
```

---

## 📊 Current Architecture

```
Frontend (React + Vite)
  ↓ (API calls via apiService)
Backend (Express + TypeScript)
  ↓ (Mongoose)
MongoDB (Local)

Frontend (Direct)
  ↓ (HTTPS)
Gemini AI API

Frontend (Web3)
  ↓ (MetaMask)
Polygon Amoy Testnet
```

---

## ✅ Verification Checklist

- [x] MongoDB running
- [x] Backend API running (port 3001)
- [x] Frontend running (port 8080)
- [ ] Gemini API key added to `.env`
- [ ] Frontend restarted after adding API key
- [ ] AI chatbot responding intelligently
- [ ] File upload working with proper names
- [ ] SWT token balance updating in header

---

## 🎯 Next Steps

1. **Add Gemini API Key** (5 minutes)
2. **Restart Frontend** (1 minute)
3. **Test AI Features** (2 minutes)
4. **Upload Test CSV** (1 minute)
5. **Enjoy SpendWise AI!** 🎉

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console (F12)
2. Check backend logs in terminal
3. Verify all environment variables are set
4. Ensure MongoDB is running

---

**Last Updated**: October 15, 2025
**Version**: 1.0.0
