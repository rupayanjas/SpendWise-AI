# 💸 SpendWise AI

SpendWise AI is a modern AI-powered Personal Finance Management application that helps users manage their finances smarter. It enables users to track income and expenses, create budgets, manage financial goals, monitor investments, and receive personalized financial insights using Google Gemini AI.

Built with a production-ready full-stack architecture using **React, TypeScript, Express.js, Prisma, PostgreSQL, and Google Gemini AI**, SpendWise AI combines a clean, modern UI with secure authentication and real-time financial analytics.

---

## ✨ Features

### 🔐 Authentication
- Secure JWT Authentication
- User Registration & Login
- Protected Routes
- Password Encryption using bcrypt

### 💰 Transaction Management
- Add Income
- Add Expenses
- Delete Transactions
- Category-wise Transactions
- Real-time Balance Updates

### 📊 Dashboard
- Total Balance
- Total Income
- Total Expenses
- Financial Overview
- Dynamic Statistics

### 📈 Analytics
- Spending Analysis
- Income vs Expense Charts
- Category Breakdown
- Financial Trends

### 🎯 Smart Budget
- Create Monthly Budgets
- Budget Progress Tracking
- Remaining Budget Calculation
- Budget Utilization

### 🏆 Financial Goals
- Create Savings Goals
- Track Goal Progress
- Completion Percentage

### 📈 Investment Portfolio
- Add Investments
- Remove Investments
- Portfolio Value Tracking
- Net Worth Dashboard

The Investment module follows **double-entry accounting principles**, ensuring:

- Buying investments reduces available cash.
- Selling investments restores available cash.
- Net Worth always remains mathematically accurate.

### 🤖 AI Financial Advisor
Powered by **Google Gemini AI**, users can ask questions such as:

- How can I save more money?
- Analyze my spending habits.
- Suggest a monthly budget.
- Where am I overspending?
- Give me investment suggestions.

---

# 🛠 Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

## Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- bcrypt
- Google Gemini AI

## Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL

---

# 🏗 System Architecture

```text
                 User
                   │
                   ▼
        React + Vite Frontend
            (Hosted on Vercel)
                   │
             HTTPS REST API
                   │
                   ▼
        Express.js Backend
         (Hosted on Render)
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
 Neon PostgreSQL         Google Gemini AI
```

---

# 🧪 Demo Account

You can **create your own account** to experience SpendWise AI with your own financial data.

Alternatively, if you'd like to explore the application immediately without registering, we've provided a demo account that already contains sample financial data to help you understand all the features.

### Demo Credentials

**Email**
```
test@example.com
```

**Password**
```
Test@12345
```

> **Note:** The demo account is shared for evaluation purposes only. Creating your own account is recommended for a personalized experience.

---

# 📁 Project Structure

```text
SpendWise-AI/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── utils/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

---

# 🌟 Project Highlights

- Modern Dark Theme UI
- Fully Responsive Design
- AI-Powered Financial Advisor
- JWT Authentication
- RESTful API Architecture
- PostgreSQL Database
- Prisma ORM
- Investment Accounting with Double-Entry Logic
- Secure Backend APIs
- Production Deployment using Vercel, Render & Neon
- TypeScript End-to-End
- Clean and Modular Codebase

---

# 🔮 Future Improvements

- Bank Account Integration
- UPI & Credit Card Sync
- Zerodha/Groww Investment Integration
- PDF Reports
- Email Notifications
- Recurring Transactions
- Bill Reminders
- AI Spending Forecasting
- Multi-Currency Support
- CSV & PDF Export

---

