#!/bin/bash

echo "🎨 HeartCanvas - Production Build & Deploy"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Copy built files to server directory
echo "📁 Copying build files..."
cp -r dist server-combined/

# Navigate to server directory
cd server-combined

# Install server dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

# Set production environment
export NODE_ENV=production

# Start the production server
echo ""
echo "🚀 Starting production server..."
echo "🌐 Application will be available at http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
