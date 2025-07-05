# Workflow Service

A robust, enterprise-grade Node.js/TypeScript service for managing rules engine and workflow automation with comprehensive authentication, authorization, and multi-database support.

## 🚀 Overview

The Workflow Service is a microservice designed to handle complex business rules and conditional logic through a sophisticated rules engine. It provides a RESTful API for creating, managing, and executing rules and conditions with fine-grained access control and comprehensive monitoring capabilities.

### Key Features

- **Rules Engine**: Create and manage complex business rules with conditions and operators
- **Multi-Database Support**: PostgreSQL and MySQL database support with TypeORM
- **Authentication & Authorization**: Only data access routes are protected by JWT-based authentication with role-based access control (RBAC). Webhooks and internal APIs use respective channel tokens.
- **Multi-Tenancy**: Built-in tenant isolation and management
- **Cloud-Native**: Docker support with AWS S3 integration for file storage
- **Observability**: OpenTelemetry instrumentation with multiple logging providers
- **Microservice Architecture**: Modular design with dependency injection
- **Production Ready**: Comprehensive error handling, rate limiting, and graceful shutdown

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Development](#development)
- [Contributing](#contributing)

## 🔧 Prerequisites

- **Node.js**: 22.x or higher
- **npm**: 11.0 or higher
- **Database**: PostgreSQL 12+ or MySQL 8.0+
- **Docker** (optional): For containerized deployment
- **AWS Account** (optional): For S3 file storage and secret management

## 📦 Installation

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd service-template-skeleton

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Build the project
npm run build

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Build Docker image
docker build -t rean-bot-service .

# Run container
docker run -p 3000:3000 rean-bot-service
```

## ⚙️ Configuration

The service uses a layered configuration approach:

1. **Default Configuration**: `service.config.json`
2. **Environment Variables**: Override defaults
3. **Local Configuration**: `service.config.local.json` (optional)

### service.config.json

```json
{
    "SystemIdentifier": "ReanBot",
    "BaseUrl": "https://localhost:7373",
    "Logging": {
        "Provider": "Custom",
        "Level": "Information"
    },
    "FileStorage": {
        "Provider": "AWS-S3"
    },
    "Email": {
        "Provider": "SendGrid"
    },
    "Sms": {
        "Provider": "Twilio"
    },
    "MaxUploadFileSize": 104857600,
    "Telemetry": false
}
```

## 🌐 Environment Variables

### Core Configuration

```bash
# Service Configuration
SERVICE_NAME=rean-bot-service
NODE_ENV=development
PORT=7373
BASE_URL=http://localhost:7373

# Database Configuration
DB_DIALECT=mysql  # or postgres
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rean_bot_db
DB_USER_NAME=username
DB_USER_PASSWORD=password

# Authentication
USER_ACCESS_TOKEN_SECRET=your-jwt-secret
INTERNAL_API_KEY=your-internal-api-key
USER_SERVICE_BASE_URL=http://localhost:7171

# External Services
S3_CONFIG_BUCKET=your-config-bucket
S3_CONFIG_PATH=config/path

# Logging & Monitoring
HTTP_LOGGING=true
ENABLE_TELEMETRY=false
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4317

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-file-bucket

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

## 🗄️ Database Setup

### Supported Databases

- **PostgreSQL**
- **MySQL** (Recommended)

### Migration and Seeding

The service automatically handles:

1. **Database Connection**: Automatic connection pooling and health checks
2. **Seeding**: Master data
3. **Test Data**: Optional test data seeding for development

### Sample Database Configuration

```typescript
// PostgreSQL
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432

// MySQL
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
```

## 📚 API Documentation

### Base URL

```
http://localhost:7373/api/v1
```

### Health Check

```bash
GET /api/v1/health-check
```

```json
// Standard Response Format
{
    "Status": "success",
    "Message": "Operation completed successfully",
    "HttpCode": 200,
    "Data": {
        // Response data
    }
}

// Error Response Format
{
    "Status": "failure",
    "Message": "Error description",
    "HttpCode": 400,
    "Data": null
}
```

## 🔐 Authentication

### Authentication Flow

1. **Client Authentication**: API key validation for service-to-service communication
2. **User Authentication**: JWT token validation for user requests
3. **Session Management**: Session-based token validation with expiry

### Headers

```bash
# User Authentication
Authorization: Bearer <jwt-token>

# Client Authentication
x-api-key: <api-key>
```

## 🛡️ Authorization

### Role-Based Access Control (RBAC)

#### Default Roles

- **Admin**: Full system access
- **ContentModerator**: Rule and condition management

#### Permission System

Permissions are structured as `Resource.Action`:

```typescript
// Examples
"Rule.Create"
"Rule.GetById"
"Rule.Update"
"Rule.Delete"
"Condition.Create"
"Condition.Search"
```

#### Context-Based Authorization

Each endpoint is protected with context-based authorization:

```typescript
router.post('/', context('Rule.Create'), controller.create);
router.get('/:id', context('Rule.GetById'), controller.getById);
```

## 🏗️ Architecture

### Code Structure

```
src/
├── api/                    # REST API endpoints
│   ├── condition/         # Condition management
│   ├── rule/              # Rule management
│   └── types/             # Type definitions
├── auth/                  # Authentication & Authorization
├── common/                # Shared utilities
├── config/                # Configuration management
├── database/              # Database layer
│   ├── db.clients/       # Database connectors
│   ├── models/           # Data models
│   ├── services/         # Business logic
│   └── mappers/          # Data mapping
├── domain.types/          # Domain type definitions
├── logger/                # Logging providers
├── modules/               # External integrations
│   ├── email/            # Email services
│   ├── sms/              # SMS services
│   └── storage/          # File storage
├── startup/               # Application bootstrap
└── telemetry/             # Observability
```

### Design Patterns

- **Dependency Injection**: Using `tsyringe` for IoC
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Middleware Pattern**: Request/response processing
- **Observer Pattern**: Event handling and logging

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t rean-bot-service:latest .

# Run with environment variables
docker run -d \
  --name rean-bot-service \
  -p 3000:3000 \
  --env-file .env \
  rean-bot-service:latest
```

### AWS ECS Deployment

```yaml
# task-definition.json
{
  "family": "rean-bot-service",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "rean-bot-service",
      "image": "rean-bot-service:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates configured
- [ ] Load balancer configured
- [ ] Monitoring and logging enabled
- [ ] Health checks configured
- [ ] Backup strategy implemented

## 📊 Monitoring

### OpenTelemetry Integration

The service includes comprehensive observability:

```typescript
// Tracing
import { Trace } from './telemetry/instrumenter';

@Trace('RuleService.create')
async create(rule: RuleCreateModel): Promise<RuleResponseDto> {
    // Implementation
}
```

### Logging Providers

- **Custom Logger** (Default)
- **Winston**
- **Pino**
- **Bunyan**

### Metrics & Health Checks

```bash
# Health Check
GET /api/v1/health-check

# Metrics (if enabled)
GET /metrics
```

### Log Levels

- `ERROR`: Application errors
- `WARN`: Warning conditions
- `INFO`: General information
- `DEBUG`: Debug information

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run start        # Production start
npm run build        # TypeScript compilation

# Code Quality
npm run lint         # ESLint check
npm run lint:fix     # ESLint fix
npm test             # Run tests (when configured)
```

### Development Guidelines

1. **TypeScript**: Strict type checking enabled
2. **ESLint**: Airbnb configuration with custom rules
3. **Code Structure**: Follow domain-driven design principles
4. **Error Handling**: Comprehensive error handling with proper HTTP status codes
5. **Testing**: Unit and integration tests (framework ready)

### Adding New Features

1. Create domain types in `src/domain.types/<module>/`
2. Implement database model in `src/database/models/<module>/`
3. Add service layer in `src/database/services/<module>/`
4. Create API controller, routes, auth options and validators in `src/api/<module>/`
5. Update permissions in master data
6. Add OpenTelemetry instrumentation for tracing
7. Write unit tests for new features
8. Add Bruno requests for new features
9. Update documentation

### Development Setup

```bash
# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Run in development mode
npm run dev
