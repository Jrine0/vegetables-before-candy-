#!/bin/bash

echo "🎓 Setting up Academic NFT Marketplace..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Setup database
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# Create uploads directory
mkdir -p uploads/achievements

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

# Install contracts dependencies
echo "📦 Installing contract dependencies..."
cd contracts
npm install

cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 Quick start commands:"
echo "  npm run dev          # Start development servers"
echo "  npm run backend:dev  # Start backend only"
echo "  npm run frontend:dev # Start frontend only"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "🎯 Ready for your hackathon demo!"