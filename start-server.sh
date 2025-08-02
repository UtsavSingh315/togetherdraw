#!/bin/bash

echo "🎨 HeartCanvas - Starting Socket.IO Server"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to server directory
cd "$(dirname "$0")/server"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Server package.json not found. Make sure you're in the right directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

# Start the server
echo "🚀 Starting Socket.IO server on port 3001..."
echo "📍 Server will be available at http://localhost:3001"
echo "🔗 Health check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
