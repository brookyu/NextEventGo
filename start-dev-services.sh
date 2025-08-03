#!/bin/bash

# Simple script to start both backend and frontend services for development

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 NextEvent Development Services${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        echo -e "${YELLOW}Killing existing process on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Create necessary directories
echo -e "${BLUE}Creating directories...${NC}"
mkdir -p uploads/images
mkdir -p logs

# Check and start backend
echo -e "${BLUE}Starting backend service...${NC}"
if check_port 8080; then
    echo -e "${YELLOW}Backend already running on port 8080${NC}"
    echo -e "${BLUE}Testing backend health...${NC}"
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy and running${NC}"
    else
        echo -e "${RED}❌ Backend not responding, restarting...${NC}"
        kill_port 8080
        echo -e "${BLUE}Starting new backend instance...${NC}"
        go run cmd/api/main.go > logs/backend.log 2>&1 &
        echo -e "${GREEN}Backend started with PID: $!${NC}"
    fi
else
    echo -e "${BLUE}Starting backend on port 8080...${NC}"
    go run cmd/api/main.go > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"
    
    # Wait for backend to be ready
    echo -e "${BLUE}Waiting for backend to be ready...${NC}"
    for i in {1..15}; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
            break
        fi
        if [ $i -eq 15 ]; then
            echo -e "${RED}❌ Backend failed to start${NC}"
            exit 1
        fi
        sleep 2
        echo -n "."
    done
fi

# Check and start frontend
echo ""
echo -e "${BLUE}Starting frontend service...${NC}"
if check_port 3000; then
    echo -e "${YELLOW}Frontend already running on port 3000${NC}"
    echo -e "${BLUE}Testing frontend...${NC}"
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy and running${NC}"
    else
        echo -e "${RED}❌ Frontend not responding, restarting...${NC}"
        kill_port 3000
        echo -e "${BLUE}Starting new frontend instance...${NC}"
        cd web && npm run dev > ../logs/frontend.log 2>&1 &
        cd ..
        echo -e "${GREEN}Frontend started with PID: $!${NC}"
    fi
else
    echo -e "${BLUE}Starting frontend on port 3000...${NC}"
    cd web
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Create .env.local for frontend
    cat > .env.local << EOF
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=NextEvent Admin
VITE_APP_VERSION=1.0.0
EOF
    
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"
    
    # Wait for frontend to be ready
    echo -e "${BLUE}Waiting for frontend to be ready...${NC}"
    for i in {1..15}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is ready!${NC}"
            break
        fi
        if [ $i -eq 15 ]; then
            echo -e "${YELLOW}⚠️  Frontend may still be starting...${NC}"
        fi
        sleep 2
        echo -n "."
    done
fi

# Display service information
echo ""
echo -e "${GREEN}🎉 Development Services Status${NC}"
echo ""
echo -e "${BLUE}📋 Service URLs:${NC}"
echo "   • Frontend (React):    http://localhost:3000"
echo "   • Backend API:         http://localhost:8080"
echo "   • Health Check:        http://localhost:8080/health"
echo ""
echo -e "${BLUE}🧪 Quick API Tests:${NC}"
echo "   curl http://localhost:8080/api/v1/images"
echo "   curl http://localhost:8080/api/v2/images/stats"
echo "   curl http://localhost:8080/api/v1/image-categories"
echo ""
echo -e "${BLUE}📝 View Logs:${NC}"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""
echo -e "${BLUE}🔄 To restart services:${NC}"
echo "   ./start-dev-services.sh"
echo ""
echo -e "${GREEN}✅ All services are running!${NC}"
