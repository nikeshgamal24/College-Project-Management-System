#!/bin/bash

# Kill any existing processes on port 3500
echo "🔍 Checking for existing processes on port 3500..."
lsof -ti:3500 | xargs -r kill -9 2>/dev/null

# Kill any npm/node processes
echo "🧹 Cleaning up existing Node.js processes..."
pkill -f "node server" 2>/dev/null
pkill -f "npm start" 2>/dev/null

# Wait a moment for processes to fully terminate
sleep 2

# Check if port is free
if lsof -Pi :3500 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 3500 is still in use. Trying alternative port..."
    # Try port 3501
    if ! lsof -Pi :3501 -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Using port 3501 instead..."
        PORT=3501 npm start
    else
        echo "❌ Both ports 3500 and 3501 are in use. Please manually kill processes."
        exit 1
    fi
else
    echo "✅ Port 3500 is free. Starting server..."
    npm start
fi
