#!/bin/bash

# NextEvent Development Environment Startup Script

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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p uploads
    mkdir -p logs
    mkdir -p temp
    print_success "Directories created"
}

# Copy environment file if it doesn't exist
setup_environment() {
    print_status "Setting up environment..."
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please review and update .env file with your specific configuration"
        else
            print_warning ".env.example not found, creating basic .env file"
            cat > .env << EOF
ENV=development
LOG_LEVEL=debug
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nextevent
DB_USER=nextevent
DB_PASSWORD=nextevent123
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=nextevent
RABBITMQ_PASSWORD=nextevent123
EOF
            print_success "Created basic .env file"
        fi
    else
        print_success "Environment file already exists"
    fi
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services (PostgreSQL, Redis, RabbitMQ)..."
    cd deployments/docker
    
    # Start only infrastructure services first
    docker-compose up -d postgres redis rabbitmq
    
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    until docker-compose exec -T postgres pg_isready -U nextevent -d nextevent > /dev/null 2>&1; do
        sleep 2
        echo -n "."
    done
    print_success "PostgreSQL is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
        sleep 2
        echo -n "."
    done
    print_success "Redis is ready"
    
    # Wait for RabbitMQ
    print_status "Waiting for RabbitMQ..."
    until docker-compose exec -T rabbitmq rabbitmq-diagnostics ping > /dev/null 2>&1; do
        sleep 2
        echo -n "."
    done
    print_success "RabbitMQ is ready"
    
    cd ../..
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    if [ -f cmd/migrate/main.go ]; then
        go run cmd/migrate/main.go
        print_success "Database migrations completed"
    else
        print_warning "Migration file not found, skipping migrations"
    fi
}

# Start the Go API server
start_api() {
    print_status "Starting NextEvent Go API server..."
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Start the API server
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
        sleep 2
        echo -n "."
    done
}

# Start monitoring services (optional)
start_monitoring() {
    print_status "Starting monitoring services (Prometheus, Grafana)..."
    cd deployments/docker
    docker-compose up -d prometheus grafana
    cd ../..
    print_success "Monitoring services started"
}

# Display service URLs
show_urls() {
    echo ""
    echo "🚀 NextEvent Development Environment is Ready!"
    echo ""
    echo "📋 Service URLs:"
    echo "   • API Server:          http://localhost:8080"
    echo "   • API Health Check:    http://localhost:8080/health"
    echo "   • API Documentation:   http://localhost:8080/swagger/"
    echo "   • PostgreSQL:          localhost:5432 (nextevent/nextevent123)"
    echo "   • Redis:               localhost:6379"
    echo "   • RabbitMQ Management: http://localhost:15672 (nextevent/nextevent123)"
    echo "   • Prometheus:          http://localhost:9090"
    echo "   • Grafana:             http://localhost:3000 (admin/admin123)"
    echo ""
    echo "📊 Quick API Tests:"
    echo "   curl http://localhost:8080/health"
    echo "   curl http://localhost:8080/api/v2/images"
    echo ""
    echo "🛑 To stop all services:"
    echo "   ./scripts/stop-dev.sh"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    echo "🚀 Starting NextEvent Development Environment"
    echo ""
    
    check_docker
    check_docker_compose
    create_directories
    setup_environment
    start_infrastructure
    run_migrations
    start_api
    start_monitoring
    show_urls
    
    # Keep script running
    print_status "Development environment is running. Press Ctrl+C to stop."
    wait
}

# Run main function
main "$@"
