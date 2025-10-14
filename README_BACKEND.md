# SpendWise AI Backend

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- pip (Python package manager)

### Installation & Startup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   python start_backend.py
   ```
   
   Or manually:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Access the API:**
   - **API Base URL:** http://localhost:8000
   - **Interactive Docs:** http://localhost:8000/docs
   - **ReDoc:** http://localhost:8000/redoc

## 📁 Project Structure

```
app/
├── main.py              # FastAPI app initialization
├── db.py                # Database configuration
├── models.py            # SQLModel database models
├── schemas.py           # Pydantic schemas
├── core/
│   └── security.py      # JWT & password hashing
└── routers/
    ├── auth.py          # Authentication endpoints
    ├── transactions.py  # Transaction CRUD
    ├── categories.py    # Category management
    ├── budgets.py       # Budget management
    ├── analytics.py     # Financial analytics
    └── advice.py        # AI advice endpoint
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Key Endpoints

### Authentication
- `POST /auth/register` - Create new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `PUT /auth/me` - Update user profile

### Transactions
- `GET /transactions` - List transactions (with filters)
- `POST /transactions` - Create transaction
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction

### Categories
- `GET /categories` - List categories
- `POST /categories` - Create category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Budgets
- `GET /budgets` - List budgets
- `POST /budgets` - Create budget
- `PUT /budgets/{id}` - Update budget
- `DELETE /budgets/{id}` - Delete budget

### Analytics
- `GET /analytics/summary` - Financial summary
- `GET /analytics/by-category` - Spending by category
- `GET /analytics/savings-rate` - Calculate savings rate

### AI Advice
- `POST /advice` - Get AI-generated financial advice

## 🗄️ Database

- **Type:** SQLite (async with aiosqlite)
- **Location:** `./spendwise.db`
- **ORM:** SQLModel (built on SQLAlchemy + Pydantic)

## 🔧 Configuration

### Environment Variables (Optional)
- `AI_API_BASE` - External AI API base URL
- `AI_API_KEY` - AI API authentication key
- `AI_MODEL` - AI model name (default: gpt-4o-mini)

## 🧪 Testing

Test the API using the interactive docs at http://localhost:8000/docs or with curl:

```bash
# Register a user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "full_name": "Test User"}'

# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## 🚨 Troubleshooting

1. **Port already in use:** Change the port in `start_backend.py`
2. **Database errors:** Delete `spendwise.db` to reset
3. **Import errors:** Ensure all dependencies are installed

## 📝 Notes

- The database is automatically created on first startup
- All endpoints require authentication except `/auth/register` and `/auth/login`
- CORS is enabled for all origins (configure for production)
- The AI advice endpoint requires external AI API configuration
