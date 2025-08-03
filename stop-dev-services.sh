#!/bin/bash

# Simple script to stop both backend and frontend services

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping NextEvent Development Services${NC}"
echo ""

# Function to kill process on port
kill_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}Stopping $service_name on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        # Verify it's stopped
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name may still be running${NC}"
        fi
    else
        echo -e "${BLUE}$service_name is not running on port $port${NC}"
    fi
}

# Stop backend (port 8080)
kill_port 8080 "Backend"

# Stop frontend (port 3000)
kill_port 3000 "Frontend"

echo ""
echo -e "${GREEN}🎉 All development services stopped${NC}"
echo ""
echo -e "${BLUE}To restart services, run:${NC}"
echo "   ./start-dev-services.sh"
echo ""
