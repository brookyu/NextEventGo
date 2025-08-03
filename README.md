# NextEvent Go - WeChat Event Management System

[![GitHub](https://img.shields.io/github/license/brookyu/NextEventGo)](LICENSE)
[![Go Report Card](https://goreportcard.com/badge/github.com/brookyu/NextEventGo)](https://goreportcard.com/report/github.com/brookyu/NextEventGo)
[![GitHub release](https://img.shields.io/github/v/release/brookyu/NextEventGo)](https://github.com/brookyu/NextEventGo/releases)

A comprehensive event management system built with Go backend and React frontend, designed for WeChat integration and modern web applications.

## 🚀 Features

### Core Functionality
- **Event Management**: Create, manage, and track events with attendee registration
- **Image Management**: Upload, categorize, and manage images with advanced filtering
- **Article System**: Rich text editor with WeChat publishing capabilities
- **Video Management**: Handle both local and cloud-based video content
- **News Management**: Create and distribute news content
- **Survey System**: Interactive surveys with real-time analytics
- **User Management**: Role-based access control and authentication

### Technical Features
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Database Integration**: MySQL with GORM for robust data persistence
- **File Upload**: Secure file handling with multiple storage options
- **API Versioning**: Both v1 and v2 APIs for backward compatibility
- **Real-time Features**: WebSocket support for live updates
- **WeChat Integration**: Native WeChat API integration for seamless publishing

## 🏗️ Architecture

```
├── cmd/                    # Application entry points
├── internal/
│   ├── domain/            # Business logic and entities
│   ├── application/       # Use cases and services
│   ├── infrastructure/    # External concerns (DB, cache, etc.)
│   └── interfaces/        # Controllers and routes
├── web/                   # React frontend
├── docs/                  # Documentation
└── deployments/          # Docker and Kubernetes configs
```

## 🛠️ Technology Stack

### Backend
- **Go 1.21+** - Core language
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **MySQL** - Primary database
- **Redis** - Caching and sessions (optional)
- **Viper** - Configuration management

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components

## 🚀 Quick Start

### Prerequisites
- Go 1.21 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Redis (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/brookyu/NextEventGo.git
   cd NextEventGo
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Install dependencies**
   ```bash
   # Backend dependencies
   go mod download
   
   # Frontend dependencies
   cd web && npm install && cd ..
   ```

4. **Start the development servers**
   ```bash
   # Start both backend and frontend
   ./start-dev-services.sh
   ```

   Or start them separately:
   ```bash
   # Backend only
   go run cmd/api/main.go
   
   # Frontend only (in another terminal)
   cd web && npm run dev
   ```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## 📚 API Documentation

### Core Endpoints

#### Images API
```bash
GET    /api/v1/images              # List images
POST   /api/v1/images/upload       # Upload image
DELETE /api/v1/images/:id          # Delete image
GET    /api/v1/image-categories    # List categories
```

#### Articles API
```bash
GET    /api/v1/content/articles    # List articles
GET    /api/v1/content/articles/:id # Get article
POST   /api/v1/content/articles    # Create article
PUT    /api/v1/content/articles/:id # Update article
DELETE /api/v1/content/articles/:id # Delete article
```

#### Events API
```bash
GET    /api/v1/events              # List events
GET    /api/v1/events/current      # Get current event
POST   /api/v1/events              # Create event
PUT    /api/v1/events/:id          # Update event
DELETE /api/v1/events/:id          # Delete event
```

#### Authentication
```bash
POST   /api/v1/auth/login          # User login
POST   /api/v1/auth/logout         # User logout
GET    /api/v1/auth/me             # Get current user
```

### API v2 (Enhanced)
All v1 endpoints are also available under `/api/v2/` with enhanced features and improved response formats.

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=NextEventDB6
DB_USER=your_username
DB_PASSWORD=your_password

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Server
PORT=8080
GIN_MODE=debug

# WeChat (optional)
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

### Database Setup
```sql
CREATE DATABASE NextEventDB6 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Build backend
docker build -f deployments/docker/Dockerfile -t nextevent-api .

# Run with environment variables
docker run -p 8080:8080 --env-file .env nextevent-api
```

## 🚀 Production Deployment

### Using Kubernetes
```bash
# Apply configurations
kubectl apply -f deployments/kubernetes/

# Check status
kubectl get pods -n nextevent
```

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./internal/domain/entities
```

### Frontend Tests
```bash
cd web
npm test
```

### API Testing
```bash
# Test image upload
curl -X POST http://localhost:8080/api/v1/images/upload \
  -F "image=@test-image.png" -F "category=test"

# Test authentication
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📊 Monitoring and Observability

### Health Checks
- **Application Health**: `GET /health`
- **Database Health**: Included in health endpoint
- **Redis Health**: Included in health endpoint (if configured)

### Metrics
- Prometheus metrics available at `/metrics`
- Custom business metrics for events, uploads, and user activity

### Logging
- Structured logging with configurable levels
- Request/response logging with correlation IDs
- Error tracking and alerting

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Session management with Redis

### Data Protection
- Input validation and sanitization
- SQL injection prevention with GORM
- XSS protection with proper escaping
- CORS configuration for cross-origin requests

### File Upload Security
- File type validation
- Size limits
- Virus scanning (configurable)
- Secure file storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow Go best practices and conventions
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment-guide.md)
- [Architecture Overview](docs/architecture.md)
- [Troubleshooting Guide](docs/troubleshooting-guide.md)

### Getting Help
- Create an issue for bug reports
- Use discussions for questions and feature requests
- Check existing documentation before asking

## 📈 Project Status

- ✅ **Core APIs**: Fully implemented and tested
- ✅ **Frontend Interface**: Complete admin dashboard
- ✅ **Database Integration**: MySQL with comprehensive schema
- ✅ **File Upload System**: Working with local storage
- ✅ **Authentication**: JWT-based auth system
- ✅ **Docker Support**: Complete containerization
- 🚧 **WeChat Integration**: Basic implementation (needs API keys)
- 🚧 **Advanced Analytics**: In development
- 📋 **Mobile App**: Planned for future release

---

**Built with ❤️ by the NextEvent Team**
