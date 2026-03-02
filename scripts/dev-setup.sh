#!/bin/bash

# Weekly Planner - Development Setup Script (macOS/Linux)

set -e

echo "🚀 Weekly Planner - Development Setup"
echo "======================================"

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git."
    exit 1
fi

if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK not found. Please install .NET 8 SDK."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Install to connect to database."
fi

echo "✓ All prerequisites found"
echo ""

# Backend setup
echo "📦 Setting up Backend (.NET)..."
cd backend
dotnet restore
echo "✓ Backend dependencies installed"
echo ""

# Frontend setup
echo "📦 Setting up Frontend (Angular)..."
cd ../frontend
npm install
echo "✓ Frontend dependencies installed"
echo ""

# Database setup
echo "🗄️  Database Setup"
echo "Docker required. Run locally:"
echo "  docker-compose up -d db"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start database: docker-compose up -d db"
echo "2. Update backend DB: cd backend && dotnet ef database update"
echo "3. Run backend: cd backend && dotnet run"
echo "4. Run frontend: cd frontend && npm start"
echo ""
