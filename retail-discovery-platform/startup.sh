#!/bin/bash

# Retail Discovery Platform - Startup Script
# This script sets up and starts both backend and frontend

set -e

echo "================================"
echo "Retail Discovery Platform"
echo "Startup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${YELLOW}Project Root:${NC} $PROJECT_ROOT"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo -e "${YELLOW}Checking Prerequisites...${NC}"
echo ""

if ! command_exists python3; then
    print_error "Python 3 not found. Please install Python 3.10+"
    exit 1
fi
print_status "Python 3 found"

if ! command_exists node; then
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi
print_status "Node.js found"

if ! command_exists npm; then
    print_error "npm not found. Please install npm"
    exit 1
fi
print_status "npm found"

echo ""

# Backend Setup
echo -e "${YELLOW}=== BACKEND SETUP ===${NC}"
echo ""

if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found at $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"

# Check virtual environment
if [ ! -d "venv" ]; then
    print_warning "Virtual environment not found. Creating..."
    python3 -m venv venv
    print_status "Virtual environment created"
else
    print_status "Virtual environment found"
fi

# Activate virtual environment
source venv/bin/activate
print_status "Virtual environment activated"

# Install dependencies
if [ -f "requirements.txt" ]; then
    print_warning "Installing Python dependencies..."
    pip install -r requirements.txt > /dev/null 2>&1
    print_status "Python dependencies installed"
else
    print_error "requirements.txt not found"
    exit 1
fi

# Check .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_warning ".env not found. Creating from .env.example"
        cp .env.example .env
        print_status ".env created. Please update with your configuration:"
        echo "  - SECRET_KEY"
        echo "  - Database credentials"
        echo "  - Redis URL"
        echo "  - Cloudinary credentials"
        echo "  - CORS origins"
        echo ""
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_status ".env file found"
fi

# Run migrations
print_warning "Running database migrations..."
python manage.py migrate > /dev/null 2>&1
print_status "Database migrations completed"

# Create superuser if needed
echo ""
read -p "Create superuser? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

echo ""
print_status "Backend setup completed"
echo ""

# Frontend Setup
echo -e "${YELLOW}=== FRONTEND SETUP ===${NC}"
echo ""

if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Check .env.local file
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        print_warning ".env.local not found. Creating from .env.example"
        cp .env.example .env.local
        print_status ".env.local created. Update the following in .env.local:"
        echo "  - NEXT_PUBLIC_API_URL (should point to backend)"
        echo "  - NEXT_PUBLIC_MAPBOX_TOKEN (optional)"
        echo "  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (optional)"
        echo ""
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_status ".env.local file found"
fi

# Install dependencies
if [ -f "package.json" ]; then
    print_warning "Installing Node dependencies..."
    npm install > /dev/null 2>&1
    print_status "Node dependencies installed"
else
    print_error "package.json not found"
    exit 1
fi

echo ""
print_status "Frontend setup completed"
echo ""

# Start servers
echo -e "${YELLOW}=== STARTING SERVERS ===${NC}"
echo ""

cd "$PROJECT_ROOT"

print_warning "Starting backend server..."
cd "$BACKEND_DIR"
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!
print_status "Backend running on http://localhost:8000 (PID: $BACKEND_PID)"
echo ""

sleep 2

print_warning "Starting frontend server..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
print_status "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Platform Started Successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Access Points:"
echo -e "  Frontend:     ${YELLOW}http://localhost:3000${NC}"
echo -e "  Backend API:  ${YELLOW}http://localhost:8000${NC}"
echo -e "  API Docs:     ${YELLOW}http://localhost:8000/api/docs${NC}"
echo -e "  Admin Panel:  ${YELLOW}http://localhost:8000/admin${NC}"
echo ""
echo "To stop the servers:"
echo "  kill $BACKEND_PID  # Stop backend"
echo "  kill $FRONTEND_PID # Stop frontend"
echo ""
echo "Or use Ctrl+C to stop both servers"
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID
