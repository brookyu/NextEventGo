#!/bin/bash

# NextEvent Full Stack Stop Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_frontend() {
    echo -e "${PURPLE}[FRONTEND]${NC} $1"
}

print_backend() {
    echo -e "${GREEN}[BACKEND]${NC} $1"
}

# Stop frontend processes
stop_frontend() {
    print_frontend "Stopping React frontend processes..."
    
    # Find and kill Vite processes
    VITE_PIDS=$(pgrep -f "vite" || true)
    if [ ! -z "$VITE_PIDS" ]; then
        echo $VITE_PIDS | xargs kill -TERM 2>/dev/null || true
        sleep 2
        # Force kill if still running
        VITE_PIDS=$(pgrep -f "vite" || true)
        if [ ! -z "$VITE_PIDS" ]; then
            echo $VITE_PIDS | xargs kill -KILL 2>/dev/null || true
        fi
        print_frontend "Frontend processes stopped"
    else
        print_frontend "No frontend processes found"
    fi
    
    # Kill anything on port 5173
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
        print_frontend "Stopping process on port 5173..."
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    fi
}

# Stop backend processes
stop_backend() {
    print_backend "Stopping Go API processes..."
    
    # Find and kill Go API processes
    API_PIDS=$(pgrep -f "go run cmd/api/main_simple.go" || true)
    if [ ! -z "$API_PIDS" ]; then
        echo $API_PIDS | xargs kill -TERM 2>/dev/null || true
        sleep 2
        # Force kill if still running
        API_PIDS=$(pgrep -f "go run cmd/api/main_simple.go" || true)
        if [ ! -z "$API_PIDS" ]; then
            echo $API_PIDS | xargs kill -KILL 2>/dev/null || true
        fi
        print_backend "Backend processes stopped"
    else
        print_backend "No backend processes found"
    fi
    
    # Kill anything on port 8080
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
        print_backend "Stopping process on port 8080..."
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    fi
}

# Clean up temporary files
cleanup_temp_files() {
    print_status "Cleaning up temporary files..."
    
    # Remove temporary upload files
    if [ -d "temp" ]; then
        rm -rf temp/*
        print_success "Temporary files cleaned up"
    fi
    
    # Clean up log files if requested
    if [ "$1" = "--clean-logs" ] || [ "$1" = "--clean-all" ]; then
        if [ -d "logs" ]; then
            rm -rf logs/*
            print_success "Log files cleaned up"
        fi
    fi
    
    # Clean up frontend build files if requested
    if [ "$1" = "--clean-build" ] || [ "$1" = "--clean-all" ]; then
        if [ -d "web/dist" ]; then
            rm -rf web/dist
            print_success "Frontend build files cleaned up"
        fi
        if [ -d "web/.vite" ]; then
            rm -rf web/.vite
            print_success "Vite cache cleaned up"
        fi
    fi
}

# Show cleanup options
show_cleanup_options() {
    echo ""
    echo "🧹 Additional cleanup options:"
    echo "   ./scripts/stop-fullstack.sh --clean-logs     # Remove log files"
    echo "   ./scripts/stop-fullstack.sh --clean-build    # Remove build files and cache"
    echo "   ./scripts/stop-fullstack.sh --clean-all      # Remove logs, build files, and cache"
    echo ""
}

# Main execution
main() {
    echo "🛑 Stopping NextEvent Full Stack"
    echo ""
    
    stop_frontend
    stop_backend
    
    # Handle cleanup options
    case "$1" in
        --clean-logs)
            cleanup_temp_files --clean-logs
            ;;
        --clean-build)
            cleanup_temp_files --clean-build
            ;;
        --clean-all)
            cleanup_temp_files --clean-all
            ;;
        *)
            cleanup_temp_files
            ;;
    esac
    
    print_success "NextEvent full stack stopped"
    
    if [ "$1" != "--clean-all" ]; then
        show_cleanup_options
    fi
    
    echo "💡 Docker containers are still running. To stop them:"
    echo "   docker stop mysql-container redis-container rabbitmq-container"
    echo ""
}

# Run main function
main "$@"
