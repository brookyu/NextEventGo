#!/bin/bash

# NextEvent API Only Startup Script (uses existing Docker containers)

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

# Check if required Docker containers are running
check_containers() {
    print_status "Checking required Docker containers..."
    
    # Check MySQL
    if ! docker ps --format "table {{.Names}}" | grep -q "mysql-container"; then
        print_error "MySQL container (mysql-container) is not running"
        print_status "Please start it with: docker start mysql-container"
        exit 1
    fi
    print_success "MySQL container is running"
    
    # Check Redis
    if ! docker ps --format "table {{.Names}}" | grep -q "redis-container"; then
        print_error "Redis container (redis-container) is not running"
        print_status "Please start it with: docker start redis-container"
        exit 1
    fi
    print_success "Redis container is running"
    
    # Check RabbitMQ
    if ! docker ps --format "table {{.Names}}" | grep -q "rabbitmq-container"; then
        print_error "RabbitMQ container (rabbitmq-container) is not running"
        print_status "Please start it with: docker start rabbitmq-container"
        exit 1
    fi
    print_success "RabbitMQ container is running"
}

# Test container connectivity
test_connectivity() {
    print_status "Testing container connectivity..."

    # Test MySQL
    print_status "Testing MySQL connection..."
    if nc -z localhost 3306 2>/dev/null; then
        print_success "MySQL is accessible on port 3306"
    else
        print_warning "Cannot connect to MySQL on port 3306 (will try during migration)"
    fi

    # Test Redis
    print_status "Testing Redis connection..."
    if nc -z localhost 6379 2>/dev/null; then
        print_success "Redis is accessible on port 6379"
    else
        print_warning "Cannot connect to Redis on port 6379 (will try during startup)"
    fi

    # Test RabbitMQ
    print_status "Testing RabbitMQ connection..."
    if nc -z localhost 5672 2>/dev/null; then
        print_success "RabbitMQ is accessible on port 5672"
    else
        print_warning "Cannot connect to RabbitMQ on port 5672 (will try during startup)"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p uploads
    mkdir -p logs
    mkdir -p temp
    print_success "Directories created"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    if [ ! -f .env ]; then
        print_error ".env file not found"
        print_status "Please create .env file or copy from .env.example"
        exit 1
    fi
    
    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)
    print_success "Environment variables loaded"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # First, try to create the database
    print_status "Creating database if it doesn't exist..."
    go run -ldflags="-s -w" cmd/migrate/main.go
    
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        exit 1
    fi
}

# Start the Go API server
start_api() {
    print_status "Starting NextEvent Go API server..."
    
    # Check if port 8080 is already in use
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 8080 is already in use"
        print_status "Stopping existing process..."
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Start the API server
    print_status "Starting API server on port 8080..."
    go run cmd/api/main.go &
    API_PID=$!
    
    print_status "API server started with PID: $API_PID"
    print_status "Waiting for API server to be ready..."
    
    # Wait for API to be ready
    for i in {1..30}; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            print_success "API server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "API server failed to start within 60 seconds"
            kill $API_PID 2>/dev/null || true
            exit 1
        fi
        sleep 2
        echo -n "."
    done
}

# Display service URLs and test commands
show_info() {
    echo ""
    echo "🚀 NextEvent Go API is Ready!"
    echo ""
    echo "📋 Service URLs:"
    echo "   • API Server:          http://localhost:8080"
    echo "   • API Health Check:    http://localhost:8080/health"
    echo "   • API Documentation:   http://localhost:8080/swagger/"
    echo "   • API Metrics:         http://localhost:8080/metrics"
    echo ""
    echo "📊 External Services (Docker containers):"
    echo "   • MySQL:               localhost:3306"
    echo "   • Redis:               localhost:6379"
    echo "   • RabbitMQ:            localhost:5672"
    echo "   • RabbitMQ Management: http://localhost:15672"
    echo ""
    echo "🧪 Quick API Tests:"
    echo "   curl http://localhost:8080/health"
    echo "   curl http://localhost:8080/api/v2/images"
    echo "   curl http://localhost:8080/api/v2/articles"
    echo "   curl http://localhost:8080/api/v2/news"
    echo "   curl http://localhost:8080/api/v2/videos"
    echo ""
    echo "🛑 To stop the API server:"
    echo "   Press Ctrl+C or run: kill $API_PID"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
        print_success "API server stopped"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    echo "🚀 Starting NextEvent Go API (using existing Docker containers)"
    echo ""
    
    check_containers
    test_connectivity
    create_directories
    setup_environment
    run_migrations
    start_api
    show_info
    
    # Keep script running
    print_status "API server is running. Press Ctrl+C to stop."
    wait $API_PID
}

# Run main function
main "$@"
