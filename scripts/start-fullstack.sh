#!/bin/bash

# NextEvent Full Stack Startup Script (Frontend + Backend)

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
    if nc -z localhost 3306 2>/dev/null; then
        print_success "MySQL is accessible on port 3306"
    else
        print_warning "Cannot connect to MySQL on port 3306"
    fi
    
    # Test Redis
    if nc -z localhost 6379 2>/dev/null; then
        print_success "Redis is accessible on port 6379"
    else
        print_warning "Cannot connect to Redis on port 6379"
    fi
    
    # Test RabbitMQ
    if nc -z localhost 5672 2>/dev/null; then
        print_success "RabbitMQ is accessible on port 5672"
    else
        print_warning "Cannot connect to RabbitMQ on port 5672"
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

# Start the Go API server in background
start_backend() {
    print_backend "Starting NextEvent Go API server..."
    
    # Check if port 8080 is already in use
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 8080 is already in use"
        print_status "Stopping existing process..."
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Start the API server in background
    print_backend "Starting API server on port 8080..."
    DB_HOST=localhost DB_PORT=3306 DB_NAME=NextEventDB6 DB_USERNAME=nextevent DB_PASSWORD=nextevent123 SERVER_PORT=8080 go run cmd/api/main.go > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    
    print_backend "API server started with PID: $BACKEND_PID"
    print_backend "Waiting for API server to be ready..."
    
    # Wait for API to be ready
    for i in {1..30}; do
        if curl -s http://localhost:8080/health > /dev/null 2>&1; then
            print_success "API server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "API server failed to start within 60 seconds"
            kill $BACKEND_PID 2>/dev/null || true
            exit 1
        fi
        sleep 2
        echo -n "."
    done
}

# Start the React frontend
start_frontend() {
    print_frontend "Starting React frontend..."
    
    # Check if port 5173 is already in use (Vite default)
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port 5173 is already in use"
        print_status "Stopping existing process..."
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Navigate to web directory and start frontend
    cd web
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_frontend "Installing frontend dependencies..."
        npm install
    fi
    
    # Create .env.local for frontend with backend URL
    cat > .env.local << EOF
VITE_API_URL=http://localhost:8080/api/v2
VITE_APP_NAME=NextEvent Admin
VITE_APP_VERSION=1.0.0
EOF
    
    print_frontend "Starting Vite dev server on port 5173..."
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    cd ..
    
    print_frontend "Frontend started with PID: $FRONTEND_PID"
    print_frontend "Waiting for frontend to be ready..."
    
    # Wait for frontend to be ready
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            print_success "Frontend is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend failed to start within 60 seconds"
            kill $FRONTEND_PID 2>/dev/null || true
            exit 1
        fi
        sleep 2
        echo -n "."
    done
}

# Display service URLs and information
show_info() {
    echo ""
    echo "🚀 NextEvent Full Stack is Ready!"
    echo ""
    echo "📋 Service URLs:"
    echo "   • Frontend (React):    http://localhost:5173"
    echo "   • Backend API:         http://localhost:8080"
    echo "   • API Health Check:    http://localhost:8080/health"
    echo "   • API Documentation:   http://localhost:8080/swagger/"
    echo ""
    echo "📊 External Services (Docker containers):"
    echo "   • MySQL:               localhost:3306 (NextEventDB6)"
    echo "   • Redis:               localhost:6379"
    echo "   • RabbitMQ:            localhost:5672"
    echo "   • RabbitMQ Management: http://localhost:15672"
    echo ""
    echo "🧪 Quick API Tests:"
    echo "   curl http://localhost:8080/health"
    echo "   curl http://localhost:8080/api/v2/images"
    echo "   curl http://localhost:8080/api/v2/articles"
    echo "   curl http://localhost:8080/api/v2/videos"
    echo ""
    echo "📝 Logs:"
    echo "   • Backend logs:  tail -f logs/backend.log"
    echo "   • Frontend logs: tail -f logs/frontend.log"
    echo ""
    echo "🛑 To stop all services:"
    echo "   Press Ctrl+C or run: ./scripts/stop-fullstack.sh"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_backend "Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_frontend "Frontend stopped"
    fi
    print_success "All services stopped"
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    echo "🚀 Starting NextEvent Full Stack (Frontend + Backend)"
    echo ""
    
    check_containers
    test_connectivity
    create_directories
    setup_environment
    start_backend
    start_frontend
    show_info
    
    # Keep script running
    print_status "Full stack is running. Press Ctrl+C to stop all services."
    wait
}

# Run main function
main "$@"
