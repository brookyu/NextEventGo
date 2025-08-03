# NextEvent Go API v2.0

[![CI/CD Pipeline](https://github.com/zenteam/nextevent-go/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/zenteam/nextevent-go/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/zenteam/nextevent-go/branch/main/graph/badge.svg)](https://codecov.io/gh/zenteam/nextevent-go)
[![Go Report Card](https://goreportcard.com/badge/github.com/zenteam/nextevent-go)](https://goreportcard.com/report/github.com/zenteam/nextevent-go)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)

A high-performance, scalable Go-based API for the NextEvent platform, providing comprehensive event management, content publishing, and video streaming capabilities.

## 🚀 Features

### Core Functionality
- **📸 Image Management**: Advanced image processing, optimization, and CDN integration
- **📝 Content Management**: Rich article creation, editing, and publishing workflows
- **📰 News Publishing**: Multi-article news publications with WeChat integration
- **🎥 Video Streaming**: Live streaming, on-demand video, and real-time analytics
- **📊 Analytics**: Comprehensive engagement tracking and performance metrics

### Technical Excellence
- **🔒 Enterprise Security**: Rate limiting, CORS, security headers, and authentication
- **⚡ High Performance**: Redis caching, connection pooling, and optimized queries
- **📈 Monitoring**: Prometheus metrics, health checks, and observability
- **🧪 Quality Assurance**: Comprehensive testing framework and CI/CD pipeline
- **☸️ Cloud Native**: Kubernetes-ready with Docker containerization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NextEvent Go API v2.0                   │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer (HTTP/REST API)                        │
│  ├── Gin Web Framework                                     │
│  ├── Security Middleware                                   │
│  ├── Request/Response Validation                           │
│  └── OpenAPI Documentation                                 │
├─────────────────────────────────────────────────────────────┤
│  Application Layer (Business Logic)                        │
│  ├── Image Management Service                              │
│  ├── Article Management Service                            │
│  ├── News Publishing Service                               │
│  ├── Video Management Service                              │
│  └── Cloud Streaming Service                               │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer (Core Business Rules)                        │
│  ├── Entities (Image, Article, News, Video)               │
│  ├── Repository Interfaces                                 │
│  ├── Domain Services                                       │
│  └── Business Rules & Validation                           │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer (External Concerns)                  │
│  ├── GORM Database Access                                  │
│  ├── Redis Caching                                         │
│  ├── File Storage (Local/Cloud)                            │
│  ├── WeChat API Integration                                │
│  └── Cloud Streaming Services                              │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

- **Language**: Go 1.21+
- **Web Framework**: Gin
- **Database**: PostgreSQL with GORM ORM
- **Cache**: Redis
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Documentation**: OpenAPI 3.0

## 📋 Prerequisites

- Go 1.21 or higher
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (for development)
- Kubernetes (for production deployment)

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zenteam/nextevent-go.git
   cd nextevent-go
   ```

2. **Start dependencies with Docker Compose**
   ```bash
   cd deployments/docker
   docker-compose up -d postgres redis
   ```

3. **Install dependencies**
   ```bash
   go mod download
   ```

4. **Set environment variables**
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=nextevent
   export DB_USER=nextevent
   export DB_PASSWORD=nextevent123
   export REDIS_HOST=localhost
   export REDIS_PORT=6379
   ```

5. **Run database migrations**
   ```bash
   go run cmd/migrate/main.go
   ```

6. **Start the application**
   ```bash
   go run cmd/api/main.go
   ```

The API will be available at `http://localhost:8080`

### Docker Development

```bash
cd deployments/docker
docker-compose up
```

This starts the complete development environment including:
- NextEvent API
- PostgreSQL database
- Redis cache
- Prometheus monitoring
- Grafana dashboards
- MinIO object storage

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:8080/swagger/`
- **OpenAPI Spec**: `http://localhost:8080/api/openapi.json`

### Key Endpoints

#### Image Management
```
GET    /api/v2/images           # List images
POST   /api/v2/images           # Upload image
GET    /api/v2/images/{id}      # Get image
PUT    /api/v2/images/{id}      # Update image
DELETE /api/v2/images/{id}      # Delete image
```

#### Article Management
```
GET    /api/v2/articles         # List articles
POST   /api/v2/articles         # Create article
GET    /api/v2/articles/{id}    # Get article
PUT    /api/v2/articles/{id}    # Update article
DELETE /api/v2/articles/{id}    # Delete article
```

#### News Publishing
```
GET    /api/v2/news             # List news
POST   /api/v2/news             # Create news
GET    /api/v2/news/{id}        # Get news
PUT    /api/v2/news/{id}        # Update news
POST   /api/v2/news/{id}/publish # Publish news
```

#### Video Management
```
GET    /api/v2/videos           # List videos
POST   /api/v2/videos           # Create video
GET    /api/v2/videos/{id}      # Get video
POST   /api/v2/videos/{id}/start # Start live stream
POST   /api/v2/videos/{id}/stop  # Stop live stream
```

### Authentication

The API supports multiple authentication methods:

1. **API Key Authentication**
   ```bash
   curl -H "X-API-Key: your-api-key" http://localhost:8080/api/v2/images
   ```

2. **Bearer Token Authentication**
   ```bash
   curl -H "Authorization: Bearer your-jwt-token" http://localhost:8080/api/v2/images
   ```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with race detection
go test -race ./...

# Run specific test package
go test ./internal/application/services/...
```

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: Database and external service integration
- **HTTP Tests**: API endpoint testing
- **Performance Tests**: Load and stress testing

## 📊 Monitoring & Observability

### Health Checks
- **Health**: `GET /health` - Overall system health
- **Readiness**: `GET /ready` - Kubernetes readiness probe
- **Liveness**: `GET /live` - Kubernetes liveness probe

### Metrics
- **Prometheus**: `GET /metrics` - Application metrics
- **Grafana**: Pre-configured dashboards for monitoring

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: Debug, Info, Warn, Error
- **Request Tracing**: Full request lifecycle tracking

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -f deployments/docker/Dockerfile -t nextevent-api:latest .

# Run container
docker run -p 8080:8080 nextevent-api:latest
```

### Kubernetes Deployment
```bash
# Apply all manifests
kubectl apply -f deployments/k8s/

# Check deployment status
kubectl get pods -n nextevent
kubectl logs -f deployment/nextevent-api -n nextevent
```

### Production Considerations
- Use external PostgreSQL and Redis services
- Configure proper resource limits and requests
- Set up horizontal pod autoscaling
- Configure ingress with SSL termination
- Set up monitoring and alerting

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENV` | Environment (development/staging/production) | `development` |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |
| `SERVER_PORT` | HTTP server port | `8080` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `nextevent` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |

### Configuration Files
- `configs/config.yaml` - Main application configuration
- `configs/database.yaml` - Database configuration
- `configs/cache.yaml` - Cache configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Go best practices and idioms
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all CI checks pass

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Documentation**: [API Docs](https://api.nextevent.com/docs)
- **Issues**: [GitHub Issues](https://github.com/zenteam/nextevent-go/issues)
- **Email**: dev@nextevent.com

---

**NextEvent Go API v2.0** - Built with ❤️ by the NextEvent Team
