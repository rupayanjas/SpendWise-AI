#!/usr/bin/env python3
"""
Startup script for SpendWise AI FastAPI backend.

Usage:
    python start_backend.py

This script will:
1. Install dependencies if needed
2. Start the FastAPI server with uvicorn
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install Python dependencies from requirements.txt"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        sys.exit(1)

def start_server():
    """Start the FastAPI server"""
    try:
        print("🚀 Starting SpendWise AI backend server...")
        print("📍 Server will be available at: http://localhost:8000")
        print("📚 API docs will be available at: http://localhost:8000/docs")
        print("🛑 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🎯 SpendWise AI Backend Startup")
    print("=" * 50)
    
    # Check if requirements.txt exists
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found!")
        sys.exit(1)
    
    # Install dependencies
    install_dependencies()
    
    # Start server
    start_server()
