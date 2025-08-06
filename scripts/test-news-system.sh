#!/bin/bash

# Comprehensive test script for the News Management System
# This script runs all tests related to the news management functionality

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running News Management System Tests${NC}"
echo ""

# Function to run tests with coverage
run_tests_with_coverage() {
    local package=$1
    local description=$2
    
    echo -e "${BLUE}Testing: $description${NC}"
    echo "Package: $package"
    
    if go test -v -race -coverprofile=coverage.out -covermode=atomic "$package"; then
        echo -e "${GREEN}✅ $description tests passed${NC}"
        
        # Show coverage
        if [ -f coverage.out ]; then
            coverage=$(go tool cover -func=coverage.out | grep total | awk '{print $3}')
            echo -e "${BLUE}Coverage: $coverage${NC}"
            
            # Generate HTML coverage report
            go tool cover -html=coverage.out -o "coverage_$(basename "$package").html"
            echo -e "${BLUE}HTML coverage report: coverage_$(basename "$package").html${NC}"
        fi
        echo ""
        return 0
    else
        echo -e "${RED}❌ $description tests failed${NC}"
        echo ""
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    echo -e "${BLUE}🔗 Running Integration Tests${NC}"
    
    # Set up test database
    export DB_HOST=localhost
    export DB_PORT=3306
    export DB_NAME=nextevent_test
    export DB_USER=test
    export DB_PASSWORD=test
    export REDIS_HOST=localhost
    export REDIS_PORT=6379
    
    # Run integration tests
    if go test -v -tags=integration ./internal/interfaces/controllers/...; then
        echo -e "${GREEN}✅ Integration tests passed${NC}"
        return 0
    else
        echo -e "${RED}❌ Integration tests failed${NC}"
        return 1
    fi
}

# Function to run benchmark tests
run_benchmark_tests() {
    echo -e "${BLUE}⚡ Running Benchmark Tests${NC}"
    
    # Run benchmarks for performance-critical components
    go test -bench=. -benchmem ./internal/application/services/news_management_service_test.go
    go test -bench=. -benchmem ./internal/application/services/content_processing_service_test.go
    go test -bench=. -benchmem ./internal/application/services/news_analytics_service_test.go
    
    echo -e "${GREEN}✅ Benchmark tests completed${NC}"
}

# Function to validate test coverage
validate_coverage() {
    echo -e "${BLUE}📊 Validating Test Coverage${NC}"
    
    # Minimum coverage threshold
    MIN_COVERAGE=80
    
    # Get overall coverage
    go test -coverprofile=overall_coverage.out ./internal/application/services/...
    overall_coverage=$(go tool cover -func=overall_coverage.out | grep total | awk '{print $3}' | sed 's/%//')
    
    echo "Overall coverage: ${overall_coverage}%"
    
    if (( $(echo "$overall_coverage >= $MIN_COVERAGE" | bc -l) )); then
        echo -e "${GREEN}✅ Coverage meets minimum threshold (${MIN_COVERAGE}%)${NC}"
        return 0
    else
        echo -e "${RED}❌ Coverage below minimum threshold (${MIN_COVERAGE}%)${NC}"
        return 1
    fi
}

# Function to run linting and static analysis
run_static_analysis() {
    echo -e "${BLUE}🔍 Running Static Analysis${NC}"
    
    # Run go vet
    echo "Running go vet..."
    if go vet ./internal/application/services/...; then
        echo -e "${GREEN}✅ go vet passed${NC}"
    else
        echo -e "${RED}❌ go vet failed${NC}"
        return 1
    fi
    
    # Run golangci-lint if available
    if command -v golangci-lint &> /dev/null; then
        echo "Running golangci-lint..."
        if golangci-lint run ./internal/application/services/...; then
            echo -e "${GREEN}✅ golangci-lint passed${NC}"
        else
            echo -e "${RED}❌ golangci-lint failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  golangci-lint not found, skipping${NC}"
    fi
    
    echo ""
}

# Function to test API endpoints
test_api_endpoints() {
    echo -e "${BLUE}🌐 Testing API Endpoints${NC}"
    
    # Start the server in background for testing
    echo "Starting test server..."
    go run cmd/api/main.go > test_server.log 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health endpoint accessible${NC}"
    else
        echo -e "${RED}❌ Health endpoint not accessible${NC}"
        kill $SERVER_PID 2>/dev/null || true
        return 1
    fi
    
    # Test news endpoints (basic connectivity)
    echo "Testing news API endpoints..."
    
    # Test GET /api/news (should return empty list or data)
    if curl -f http://localhost:8080/api/news > /dev/null 2>&1; then
        echo -e "${GREEN}✅ News list endpoint accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  News list endpoint not accessible (may be expected)${NC}"
    fi
    
    # Clean up
    kill $SERVER_PID 2>/dev/null || true
    rm -f test_server.log
    
    echo ""
}

# Main test execution
main() {
    local failed_tests=0
    
    echo -e "${BLUE}Starting comprehensive news system testing...${NC}"
    echo ""
    
    # Run static analysis first
    if ! run_static_analysis; then
        ((failed_tests++))
    fi
    
    # Run unit tests
    echo -e "${BLUE}📋 Running Unit Tests${NC}"
    echo ""
    
    # Test news management service
    if ! run_tests_with_coverage "./internal/application/services" "News Management Service"; then
        ((failed_tests++))
    fi
    
    # Test news controller
    if ! run_tests_with_coverage "./internal/interfaces/controllers" "News Controller"; then
        ((failed_tests++))
    fi
    
    # Test content processing service
    echo -e "${BLUE}Testing Content Processing Service${NC}"
    if go test -v ./internal/application/services/content_processing_service_test.go; then
        echo -e "${GREEN}✅ Content Processing Service tests passed${NC}"
    else
        echo -e "${RED}❌ Content Processing Service tests failed${NC}"
        ((failed_tests++))
    fi
    echo ""
    
    # Test news analytics service
    echo -e "${BLUE}Testing News Analytics Service${NC}"
    if go test -v ./internal/application/services/news_analytics_service_test.go; then
        echo -e "${GREEN}✅ News Analytics Service tests passed${NC}"
    else
        echo -e "${RED}❌ News Analytics Service tests failed${NC}"
        ((failed_tests++))
    fi
    echo ""
    
    # Run integration tests
    if ! run_integration_tests; then
        ((failed_tests++))
    fi
    
    # Test API endpoints
    if ! test_api_endpoints; then
        ((failed_tests++))
    fi
    
    # Validate coverage
    if ! validate_coverage; then
        ((failed_tests++))
    fi
    
    # Run benchmarks (optional, doesn't affect pass/fail)
    echo -e "${BLUE}Running performance benchmarks...${NC}"
    run_benchmark_tests || true
    echo ""
    
    # Summary
    echo -e "${BLUE}📊 Test Summary${NC}"
    echo "=================="
    
    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
        echo -e "${GREEN}✅ News Management System is ready for deployment${NC}"
        exit 0
    else
        echo -e "${RED}❌ $failed_tests test suite(s) failed${NC}"
        echo -e "${RED}🚨 Please fix the failing tests before deployment${NC}"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --unit-only     Run only unit tests"
    echo "  --integration   Run only integration tests"
    echo "  --coverage      Run tests with coverage analysis"
    echo "  --benchmark     Run only benchmark tests"
    echo "  --api-test      Test API endpoints only"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 --unit-only       # Run only unit tests"
    echo "  $0 --coverage        # Run tests with coverage"
    echo "  $0 --benchmark       # Run only benchmarks"
}

# Parse command line arguments
case "${1:-}" in
    --unit-only)
        echo -e "${BLUE}Running unit tests only...${NC}"
        run_tests_with_coverage "./internal/application/services" "News Management Service"
        run_tests_with_coverage "./internal/interfaces/controllers" "News Controller"
        ;;
    --integration)
        echo -e "${BLUE}Running integration tests only...${NC}"
        run_integration_tests
        ;;
    --coverage)
        echo -e "${BLUE}Running coverage analysis...${NC}"
        validate_coverage
        ;;
    --benchmark)
        echo -e "${BLUE}Running benchmark tests only...${NC}"
        run_benchmark_tests
        ;;
    --api-test)
        echo -e "${BLUE}Testing API endpoints only...${NC}"
        test_api_endpoints
        ;;
    --help)
        show_usage
        exit 0
        ;;
    "")
        # No arguments, run all tests
        main
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        show_usage
        exit 1
        ;;
esac
