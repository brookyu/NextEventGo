# NextEvent Go v2 - File Structure Documentation

## Overview
This document outlines the file structure of the NextEvent Go v2 project, following Clean Architecture principles and modern full-stack development practices.

## Project Root Structure

```
nextevent-go-v2/
├── .github/                    # GitHub Actions and workflows
├── .augment/                   # AI assistant rules and findings
├── .cursor/                    # Cursor IDE configuration
├── bin/                        # Compiled binaries
│   └── nextevent-go-v2        # Main application binary
├── cmd/                        # Application entry points
│   ├── api/                   # API server entry point
│   └── migrate/               # Database migration utility
├── configs/                    # Configuration files
│   ├── config.yaml            # Main configuration
│   └── development.yaml       # Development-specific config
├── deployments/               # Deployment configurations
│   ├── docker/                # Docker configurations
│   ├── k8s/                   # Kubernetes manifests
│   ├── kubernetes/            # Additional K8s configs
│   └── monitoring/            # Monitoring configurations
├── docs/                      # Documentation
├── examples/                  # Example code and integrations
├── frontend/                  # Survey-specific frontend components
├── internal/                  # Private application code
├── logs/                      # Application logs (gitignored)
├── migrations/                # Database migrations
├── pkg/                       # Public library code
├── scripts/                   # Build and deployment scripts
├── temp/                      # Temporary files (gitignored)
├── uploads/                   # File uploads (gitignored)
├── web/                       # Main web frontend application
├── docker-compose.yml         # Local development setup
├── go.mod                     # Go module definition
├── go.sum                     # Go module checksums
├── Makefile                   # Build automation
└── README.md                  # Project documentation
```

## Internal Package Structure (Clean Architecture)

```
internal/
├── api/                       # API-specific middleware
│   └── middleware/            # HTTP middleware components
├── application/               # Application business logic
│   └── services/              # Application services
├── config/                    # Configuration management
├── deployment/                # Deployment utilities
├── domain/                    # Domain layer (business logic)
│   ├── entities/              # Business entities
│   ├── repositories/          # Repository interfaces
│   └── services/              # Domain services
├── infrastructure/            # Infrastructure layer
│   ├── cache/                 # Caching implementations
│   ├── monitoring/            # Monitoring and metrics
│   ├── repositories/          # Repository implementations
│   ├── security/              # Security middleware
│   ├── services/              # Infrastructure services
│   └── wechat/                # WeChat integration
├── interfaces/                # Interface adapters
│   ├── controllers/           # HTTP controllers
│   ├── dto/                   # Data transfer objects
│   ├── middleware/            # Interface middleware
│   └── routes.go              # Route definitions
├── migration/                 # Migration utilities
├── monitoring/                # Application monitoring
├── simple/                    # Simplified handlers (transitional)
└── testing/                   # Testing utilities
```

## Frontend Structure

### Main Web Application (web/)
```
web/
├── public/                    # Static assets
│   └── resource/              # Legacy editor resources
├── src/                       # Source code
│   ├── api/                   # API client modules
│   ├── components/            # Reusable UI components
│   │   ├── analytics/         # Analytics components
│   │   ├── articles/          # Article management
│   │   ├── images/            # Image management
│   │   ├── layout/            # Layout components
│   │   ├── media/             # Media selector components
│   │   ├── sharing/           # Sharing functionality
│   │   ├── surveys/           # Survey components
│   │   ├── ui/                # Base UI components
│   │   └── video/             # Video player components
│   ├── config/                # Frontend configuration
│   ├── hooks/                 # React custom hooks
│   ├── lib/                   # Utility libraries
│   ├── pages/                 # Page components
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── articles/          # Article management
│   │   ├── attendees/         # Attendee management
│   │   ├── auth/              # Authentication
│   │   ├── cloud-videos/      # Cloud video management
│   │   ├── dashboard/         # Main dashboard
│   │   ├── events/            # Event management
│   │   ├── images/            # Image gallery
│   │   ├── news/              # News management
│   │   ├── settings/          # Application settings
│   │   ├── sharing/           # Sharing management
│   │   ├── surveys/           # Survey management
│   │   ├── users/             # User management
│   │   ├── videos/            # Video management
│   │   └── wechat/            # WeChat integration
│   ├── services/              # Business logic services
│   ├── store/                 # State management
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite build configuration
```

### Survey Frontend (frontend/)
```
frontend/
└── src/                       # Survey-specific components
    ├── components/            # Survey UI components
    │   ├── analytics/         # Survey analytics
    │   └── survey/            # Survey builder components
    ├── hooks/                 # Survey-specific hooks
    ├── services/              # Survey API services
    └── types/                 # Survey type definitions
```

## Database Migrations

```
migrations/
├── 20240101000008_create_image_tables.up.sql
├── 20240101000008_create_image_tables.down.sql
├── 20240101000009_create_survey_tables.up.sql
├── 20240101000009_create_survey_tables.down.sql
├── 20240201000001_migrate_to_comprehensive_entities.up.sql
├── 20240201000001_migrate_to_comprehensive_entities.down.sql
├── 20240301000001_create_video_uploads_table.up.sql
├── 20240301000001_create_video_uploads_table.down.sql
├── 20240401000001_enhance_cloud_video_system.up.sql
├── 20240401000001_enhance_cloud_video_system.down.sql
├── mysql_cloud_video_enhancement.sql      # Manual migration (to be integrated)
├── mysql_cloud_video_part1.sql           # Manual migration (to be integrated)
├── mysql_simple.sql                      # Manual migration (to be integrated)
└── mysql_tables_only.sql                 # Manual migration (to be integrated)
```

## Documentation Structure

```
docs/
├── added_docs/                # Additional documentation
├── api/                       # API documentation
├── architecture.md            # System architecture
├── brief.md                   # Project brief
├── deployment-guide.md        # Deployment instructions
├── implementation-plan.md     # Implementation roadmap
├── migration_completion_summary.md
├── migration_field_mapping.md
├── performance-optimization.md
├── prd.md                     # Product requirements
├── project-handoff.md         # Project handoff guide
├── troubleshooting-guide.md   # Common issues and solutions
└── wechat-integration.md      # WeChat integration guide
```

## Key Design Patterns

### Clean Architecture Layers
1. **Domain Layer** (`internal/domain/`): Core business logic and entities
2. **Application Layer** (`internal/application/`): Use cases and application services
3. **Infrastructure Layer** (`internal/infrastructure/`): External integrations and data persistence
4. **Interface Layer** (`internal/interfaces/`): HTTP handlers, controllers, and DTOs

### Frontend Architecture
- **Component-Based**: Reusable React components with TypeScript
- **Feature-Based Organization**: Components organized by feature domain
- **Custom Hooks**: Reusable state logic
- **Service Layer**: API communication abstraction
- **Type Safety**: Comprehensive TypeScript definitions

## Build and Deployment

### Scripts
- `scripts/start-dev-services.sh`: Start development dependencies
- `scripts/stop-dev-services.sh`: Stop development services
- `scripts/deploy.sh`: Production deployment
- `scripts/start-api-only.sh`: API-only development
- `scripts/start-dev.sh`: Full development environment
- `scripts/start-fullstack.sh`: Complete stack startup

### Configuration
- `config.env.example`: Environment variables template
- `docker-compose.yml`: Local development environment
- `Makefile`: Build automation and common tasks

## File Organization Best Practices

### What to Include
✅ Source code and configuration files
✅ Documentation and examples
✅ Build scripts and deployment configs
✅ Migration files with proper versioning
✅ Type definitions and interfaces

### What to Exclude (via .gitignore)
❌ Compiled binaries (`bin/`, built executables)
❌ Dependencies (`node_modules/`, vendor files)
❌ Log files (`logs/`)
❌ Temporary files (`temp/`, cache files)
❌ Environment-specific configs (`.env`)
❌ IDE-specific files (`.DS_Store`, `.vscode/`)
❌ Database files (`*.db`, `*.sqlite`)
❌ Upload directories with user content

## Maintenance Notes

### Recent Cleanup (January 2025)
- Removed redundant binary files from root
- Cleaned up test and backup SQL files
- Removed log files (now gitignored)
- Organized migration files
- Removed redundant package.json from root

### Future Improvements
1. Consolidate manual migration files into versioned migrations
2. Consider merging `frontend/` survey components into main `web/` app
3. Review and potentially remove legacy UEditor resources
4. Implement proper log rotation
5. Add automated cleanup scripts

## Related Documentation
- [Architecture Documentation](./architecture.md)
- [Deployment Guide](./deployment-guide.md)
- [API Documentation](./api/)
- [Troubleshooting Guide](./troubleshooting-guide.md)