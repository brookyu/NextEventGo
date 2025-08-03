# NextEvent Go Makefile
# Based on .NET Core project structure

.PHONY: help build run test clean docker-build docker-run docker-stop setup-dev migrate seed lint format deps

# Default target
help: ## Show this help message
	@echo "NextEvent Go - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Build commands
build: ## Build the application
	@echo "Building NextEvent Go..."
	go build -o bin/nextevent ./cmd/api

build-linux: ## Build for Linux
	@echo "Building for Linux..."
	GOOS=linux GOARCH=amd64 go build -o bin/nextevent-linux ./cmd/api

build-windows: ## Build for Windows
	@echo "Building for Windows..."
	GOOS=windows GOARCH=amd64 go build -o bin/nextevent.exe ./cmd/api

build-all: build build-linux build-windows ## Build for all platforms

# Run commands
run: ## Run the application in development mode
	@echo "Starting NextEvent Go in development mode..."
	APP_ENVIRONMENT=development go run ./cmd/api

run-prod: ## Run the application in production mode
	@echo "Starting NextEvent Go in production mode..."
	APP_ENVIRONMENT=production ./bin/nextevent

run-watch: ## Run with hot reload (requires air)
	@echo "Starting with hot reload..."
	air

# Test commands
test: ## Run all tests
	@echo "Running tests..."
	go test -v ./...

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-race: ## Run tests with race detection
	@echo "Running tests with race detection..."
	go test -race -v ./...

benchmark: ## Run benchmarks
	@echo "Running benchmarks..."
	go test -bench=. -benchmem ./...

# Development setup
setup-dev: ## Setup development environment
	@echo "Setting up development environment..."
	@echo "Installing dependencies..."
	go mod download
	@echo "Installing development tools..."
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/swaggo/swag/cmd/swag@latest
	@echo "Copying environment file..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@echo "Development environment setup complete!"

deps: ## Download and tidy dependencies
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

# Database commands
migrate: ## Run database migrations
	@echo "Running database migrations..."
	go run ./cmd/migrate

migrate-up: ## Run up migrations
	@echo "Running up migrations..."
	go run ./cmd/migrate up

migrate-down: ## Run down migrations
	@echo "Running down migrations..."
	go run ./cmd/migrate down

migrate-reset: ## Reset database (down then up)
	@echo "Resetting database..."
	go run ./cmd/migrate reset

seed: ## Seed database with sample data
	@echo "Seeding database..."
	go run ./cmd/seed

# Docker commands
docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t nextevent-go:latest .

docker-run: ## Run with Docker Compose
	@echo "Starting services with Docker Compose..."
	docker-compose up -d

docker-run-full: ## Run with all services (including optional ones)
	@echo "Starting all services with Docker Compose..."
	docker-compose --profile elasticsearch --profile consul --profile nginx up -d

docker-stop: ## Stop Docker Compose services
	@echo "Stopping Docker Compose services..."
	docker-compose down

docker-logs: ## Show Docker Compose logs
	docker-compose logs -f

docker-clean: ## Clean Docker containers and volumes
	@echo "Cleaning Docker containers and volumes..."
	docker-compose down -v
	docker system prune -f

# Code quality
lint: ## Run linter
	@echo "Running linter..."
	golangci-lint run

lint-fix: ## Run linter with auto-fix
	@echo "Running linter with auto-fix..."
	golangci-lint run --fix

format: ## Format code
	@echo "Formatting code..."
	go fmt ./...
	goimports -w .

vet: ## Run go vet
	@echo "Running go vet..."
	go vet ./...

# Documentation
docs: ## Generate API documentation
	@echo "Generating API documentation..."
	swag init -g ./cmd/api/main.go -o ./docs

docs-serve: ## Serve documentation locally
	@echo "Serving documentation at http://localhost:8080"
	@cd docs && python3 -m http.server 8080

# Utilities
clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	rm -rf coverage.out coverage.html
	rm -rf logs/*.log
	go clean -cache

env-check: ## Check environment configuration
	@echo "Checking environment configuration..."
	@echo "APP_ENVIRONMENT: $${APP_ENVIRONMENT:-not set}"
	@echo "DB_HOST: $${DB_HOST:-not set}"
	@echo "REDIS_HOST: $${REDIS_HOST:-not set}"
	@echo "WECHAT_PUBLIC_ACCOUNT_APP_ID: $${WECHAT_PUBLIC_ACCOUNT_APP_ID:-not set}"

config-validate: ## Validate configuration
	@echo "Validating configuration..."
	go run ./cmd/config-validate

# Security
security-scan: ## Run security scan
	@echo "Running security scan..."
	gosec ./...

# Performance
profile-cpu: ## Run CPU profiling
	@echo "Running CPU profiling..."
	go test -cpuprofile=cpu.prof -bench=. ./...

profile-mem: ## Run memory profiling
	@echo "Running memory profiling..."
	go test -memprofile=mem.prof -bench=. ./...

# Release
release-prepare: clean test lint ## Prepare for release
	@echo "Preparing for release..."
	@echo "All checks passed!"

release-build: release-prepare build-all ## Build release artifacts
	@echo "Building release artifacts..."
	@mkdir -p release
	@cp bin/* release/
	@cp configs/*.yaml release/
	@cp .env.example release/
	@cp docker-compose.yml release/
	@echo "Release artifacts created in release/ directory"

# Database backup and restore (for development)
db-backup: ## Backup development database
	@echo "Backing up development database..."
	@mkdir -p backups
	docker-compose exec mysql mysqldump -u root -p~Brook1226, NextEventDB6 > backups/backup_$$(date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore development database (requires BACKUP_FILE variable)
	@echo "Restoring development database..."
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Please specify BACKUP_FILE=path/to/backup.sql"; exit 1; fi
	docker-compose exec -T mysql mysql -u root -p~Brook1226, NextEventDB6 < $(BACKUP_FILE)

# Monitoring
logs: ## Show application logs
	@echo "Showing application logs..."
	tail -f logs/app.log

logs-error: ## Show error logs only
	@echo "Showing error logs..."
	tail -f logs/app.log | grep -i error

health-check: ## Check application health
	@echo "Checking application health..."
	curl -f http://localhost:5008/health || echo "Health check failed"

# Development helpers
install-tools: ## Install development tools
	@echo "Installing development tools..."
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
	go install golang.org/x/tools/cmd/goimports@latest

update-deps: ## Update dependencies
	@echo "Updating dependencies..."
	go get -u ./...
	go mod tidy

# Quick development workflow
dev: setup-dev docker-run migrate seed run-watch ## Complete development setup and start

# Production deployment helpers
deploy-check: ## Check deployment readiness
	@echo "Checking deployment readiness..."
	@echo "✓ Building application..."
	@make build
	@echo "✓ Running tests..."
	@make test
	@echo "✓ Running linter..."
	@make lint
	@echo "✓ Validating configuration..."
	@make config-validate
	@echo "Deployment checks passed!"

# Show current configuration
show-config: ## Show current configuration
	@echo "Current configuration:"
	@echo "Environment: $${APP_ENVIRONMENT:-development}"
	@echo "Config file: $${CONFIG_FILE:-auto-detected}"
	@echo "Database: $${DB_HOST:-localhost}:$${DB_PORT:-3306}/$${DB_NAME:-NextEventDB6}"
	@echo "Redis: $${REDIS_HOST:-localhost}:$${REDIS_PORT:-6379}/$${REDIS_DATABASE:-1}"
	@echo "Server: $${SERVER_HOST:-0.0.0.0}:$${SERVER_PORT:-5008}"
