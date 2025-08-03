#!/bin/bash

# NextEvent Development Environment Stop Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Stop Go API processes
stop_api() {
    print_status "Stopping Go API processes..."
    
    # Find and kill Go API processes
    API_PIDS=$(pgrep -f "go run cmd/api/main.go" || true)
    if [ ! -z "$API_PIDS" ]; then
        echo $API_PIDS | xargs kill -TERM 2>/dev/null || true
        sleep 2
        # Force kill if still running
        API_PIDS=$(pgrep -f "go run cmd/api/main.go" || true)
        if [ ! -z "$API_PIDS" ]; then
            echo $API_PIDS | xargs kill -KILL 2>/dev/null || true
        fi
        print_success "Go API processes stopped"
    else
        print_status "No Go API processes found"
    fi
}

# Stop Docker services
stop_docker_services() {
    print_status "Stopping Docker services..."
    
    if [ -d "deployments/docker" ]; then
        cd deployments/docker
        
        # Stop all services
        docker-compose down
        
        print_success "Docker services stopped"
        cd ../..
    else
        print_warning "Docker compose directory not found"
    fi
}

# Clean up Docker volumes (optional)
cleanup_volumes() {
    if [ "$1" = "--clean-volumes" ]; then
        print_status "Cleaning up Docker volumes..."
        cd deployments/docker
        docker-compose down -v
        print_success "Docker volumes cleaned up"
        cd ../..
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
    if [ "$1" = "--clean-logs" ]; then
        if [ -d "logs" ]; then
            rm -rf logs/*
            print_success "Log files cleaned up"
        fi
    fi
}

# Show cleanup options
show_cleanup_options() {
    echo ""
    echo "🧹 Additional cleanup options:"
    echo "   ./scripts/stop-dev.sh --clean-volumes  # Remove all Docker volumes (data will be lost)"
    echo "   ./scripts/stop-dev.sh --clean-logs     # Remove log files"
    echo "   ./scripts/stop-dev.sh --clean-all      # Remove volumes and logs"
    echo ""
}

# Main execution
main() {
    echo "🛑 Stopping NextEvent Development Environment"
    echo ""
    
    stop_api
    stop_docker_services
    
    # Handle cleanup options
    case "$1" in
        --clean-volumes)
            cleanup_volumes --clean-volumes
            ;;
        --clean-logs)
            cleanup_temp_files --clean-logs
            ;;
        --clean-all)
            cleanup_volumes --clean-volumes
            cleanup_temp_files --clean-logs
            ;;
        *)
            cleanup_temp_files
            ;;
    esac
    
    print_success "NextEvent development environment stopped"
    
    if [ "$1" != "--clean-volumes" ] && [ "$1" != "--clean-all" ]; then
        show_cleanup_options
    fi
}

# Run main function
main "$@"
