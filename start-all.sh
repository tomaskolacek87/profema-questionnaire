#!/bin/bash

# Profema Questionnaire - Start All Services
# Usage: ./start-all.sh

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🏥  PROFEMA QUESTIONNAIRE - START ALL                   ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ROOT="/home/tomas/projects/profema-questionnaire"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Check if databases are accessible
echo "🔍 Checking database connection..."
if ! psql -U profema_app_user -h /var/run/postgresql -p 5433 -d profema -c '\q' 2>/dev/null; then
    echo "⚠️  Warning: Cannot connect to Profema database"
    echo "   Make sure PostgreSQL is running on port 5433"
    echo "   Run: sudo systemctl status postgresql"
fi

# Backend
echo ""
echo "📦 Installing backend dependencies..."
cd "$PROJECT_ROOT/backend"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅  INSTALLATION COMPLETE                               ║"
echo "║                                                           ║"
echo "║   Starting services in tmux...                           ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "⚠️  tmux not installed. Starting services in separate terminals..."
    echo ""
    echo "Terminal 1 (Backend):"
    echo "cd $PROJECT_ROOT/backend && npm run start:dev"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "cd $PROJECT_ROOT/frontend && npm run dev"
    exit 0
fi

# Create tmux session
SESSION_NAME="profema"

# Kill existing session if exists
tmux kill-session -t $SESSION_NAME 2>/dev/null || true

# Create new session with backend
tmux new-session -d -s $SESSION_NAME -n backend
tmux send-keys -t $SESSION_NAME:backend "cd $PROJECT_ROOT/backend && npm run start:dev" C-m

# Create frontend window
tmux new-window -t $SESSION_NAME -n frontend
tmux send-keys -t $SESSION_NAME:frontend "cd $PROJECT_ROOT/frontend && npm run dev" C-m

# Select backend window
tmux select-window -t $SESSION_NAME:backend

echo "✅ Services started in tmux session: $SESSION_NAME"
echo ""
echo "Commands:"
echo "  tmux attach -t $SESSION_NAME    # Attach to session"
echo "  tmux kill-session -t $SESSION_NAME   # Stop all services"
echo ""
echo "URLs:"
echo "  Backend:  http://localhost:5001/api"
echo "  Frontend: http://localhost:5002"
echo ""
echo "Press Ctrl+B then D to detach from tmux"
echo ""

# Attach to session
tmux attach -t $SESSION_NAME
