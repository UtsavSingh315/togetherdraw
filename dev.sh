#!/bin/bash

echo "🎨 HeartCanvas - Development Mode"
echo "================================="

# Function to start server in background
start_server() {
    echo "🔧 Starting Socket.IO server..."
    cd server-combined
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing server dependencies..."
        npm install
    fi
    npm run dev &
    SERVER_PID=$!
    cd ..
    echo "✅ Server started (PID: $SERVER_PID)"
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting frontend development server..."
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ Cleanup complete"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start both servers
start_server
sleep 2
start_frontend

echo ""
echo "🎉 Both servers are running!"
echo "📍 Frontend: http://localhost:5173"
echo "🔌 Socket.IO: http://localhost:3001"
echo "🏥 Health check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait
