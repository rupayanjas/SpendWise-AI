#!/bin/bash

# SpendWise AI - Quick Setup Script
# This script helps you configure Gemini AI

echo "🚀 SpendWise AI - Gemini AI Setup"
echo "=================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Gemini AI API Key
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=

# Backend API URL
VITE_API_BASE_URL=http://localhost:3001/api
EOF
    echo "✅ .env file created"
fi

echo ""
echo "📋 Current Configuration:"
echo "------------------------"

if [ -f ".env" ]; then
    # Check if API key is set
    if grep -q "VITE_GEMINI_API_KEY=.\+" .env; then
        echo "✅ Gemini API Key: Configured"
    else
        echo "❌ Gemini API Key: NOT SET"
        echo ""
        echo "🔑 To enable AI features:"
        echo "1. Visit: https://makersuite.google.com/app/apikey"
        echo "2. Create an API key"
        echo "3. Add it to .env file:"
        echo "   VITE_GEMINI_API_KEY=your_api_key_here"
        echo ""
        echo "Would you like to add it now? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo "Enter your Gemini API key:"
            read -r api_key
            if [ ! -z "$api_key" ]; then
                # Update the .env file
                sed -i '' "s/VITE_GEMINI_API_KEY=.*/VITE_GEMINI_API_KEY=$api_key/" .env
                echo "✅ API key added successfully!"
            fi
        fi
    fi
fi

echo ""
echo "🔍 Checking Services:"
echo "--------------------"

# Check MongoDB
if brew services list | grep -q "mongodb-community.*started"; then
    echo "✅ MongoDB: Running"
else
    echo "❌ MongoDB: Not running"
    echo "   Start with: brew services start mongodb-community"
fi

# Check Backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend API: Running (port 3001)"
else
    echo "❌ Backend API: Not running"
    echo "   Start with: cd backend && npm run dev"
fi

# Check Frontend
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Frontend: Running (port 8080)"
elif curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "⚠️  Frontend: Running on port 5173 (should be 8080)"
else
    echo "❌ Frontend: Not running"
    echo "   Start with: npm run dev"
fi

echo ""
echo "📚 Next Steps:"
echo "-------------"
echo "1. Ensure Gemini API key is set in .env"
echo "2. Restart frontend if you just added the key"
echo "3. Visit: http://localhost:8080/dashboard"
echo "4. Test AI chatbot and file upload"
echo ""
echo "📖 For detailed setup: See SETUP_GUIDE.md"
echo ""
