#!/bin/bash

# Simple test script to start both backend and frontend for testing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting NextEvent Full Stack Test${NC}"
echo ""

# Create necessary directories
echo -e "${BLUE}Creating directories...${NC}"
mkdir -p uploads/images
mkdir -p logs

# Start backend
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
        echo -e "${YELLOW}⚠️  Backend may not be ready yet, continuing...${NC}"
    fi
    sleep 2
    echo -n "."
done

# Test backend APIs
echo ""
echo -e "${BLUE}Testing backend APIs...${NC}"
echo -e "${BLUE}Health check:${NC}"
curl -s http://localhost:8080/health | jq . || echo "Health check response received"

echo ""
echo -e "${BLUE}Image stats:${NC}"
curl -s http://localhost:8080/api/v2/images/stats | jq . || echo "Image stats response received"

echo ""
echo -e "${BLUE}Categories:${NC}"
curl -s http://localhost:8080/api/v2/categories | jq . || echo "Categories response received"

# Start frontend
echo ""
echo -e "${BLUE}Starting frontend...${NC}"
cd web

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
fi

# Create .env.local for frontend
cat > .env.local << EOF
VITE_API_URL=http://localhost:8080/api/v2
VITE_APP_NAME=NextEvent Admin
VITE_APP_VERSION=1.0.0
EOF

echo -e "${BLUE}Starting Vite dev server...${NC}"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"

# Wait for frontend to be ready
echo -e "${BLUE}Waiting for frontend to be ready...${NC}"
for i in {1..15}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is ready!${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${YELLOW}⚠️  Frontend may not be ready yet${NC}"
    fi
    sleep 2
    echo -n "."
done

# Display information
echo ""
echo -e "${GREEN}🎉 Full Stack Test Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Service URLs:${NC}"
echo "   • Frontend:     http://localhost:5173"
echo "   • Backend API:  http://localhost:8080"
echo "   • Health Check: http://localhost:8080/health"
echo ""
echo -e "${BLUE}🧪 Test the APIs:${NC}"
echo "   curl http://localhost:8080/api/v2/images/stats"
echo "   curl http://localhost:8080/api/v2/images"
echo "   curl http://localhost:8080/api/v2/articles"
echo "   curl http://localhost:8080/api/v2/categories"
echo "   curl http://localhost:8080/api/v2/events"
echo ""
echo -e "${BLUE}📝 View Logs:${NC}"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${BLUE}Stopping services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}Backend stopped${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}Frontend stopped${NC}"
    fi
    echo -e "${GREEN}All services stopped${NC}"
}

# Set trap for cleanup
trap cleanup EXIT

# Keep script running
wait
