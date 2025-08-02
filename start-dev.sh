#!/bin/bash

echo "🎨 HeartCanvas - Frontend Development Setup"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Bun is available, otherwise use npm
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    echo "📦 Using Bun as package manager"
else
    PACKAGE_MANAGER="npm"
    echo "📦 Using npm as package manager"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    $PACKAGE_MANAGER install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
fi

# Start the development server
echo ""
echo "🚀 Starting development server..."
echo "📍 Frontend will be available at http://localhost:5173"
echo "🎨 Open multiple tabs to test collaborative drawing"
echo ""
echo "💡 Tip: Start the Socket.IO server with './start-server.sh' for real-time features"
echo ""
echo "Press Ctrl+C to stop the development server"
echo ""

if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun dev
else
    npm run dev
fi
