# Project Structure

## Root Directory Organization
```
├── src/                    # Source code
├── dist/                   # Compiled JavaScript output
├── docs/                   # API documentation
├── bruno/                  # API testing collections
├── seed.data/              # Database seed files
├── assets/                 # Static assets
├── .kiro/                  # Kiro configuration and specs
└── node_modules/           # Dependencies
```

## Source Code Structure (`src/`)
```
src/
├── api/                    # REST API layer
│   ├── condition/         # Condition management endpoints
│   ├── rule/              # Rule management endpoints
│   ├── types/             # API type definitions
│   ├── webhooks/          # Webhook endpoints
│   └── base.validator.ts  # Shared validation logic
├── auth/                  # Authentication & authorization
├── common/                # Shared utilities and helpers
├── config/                # Configuration management
├── database/              # Data access layer
│   ├── db.clients/       # Database connection clients
│   ├── models/           # TypeORM entity models
│   ├── services/         # Business logic services
│   └── mappers/          # Data transformation mappers
├── domain.types/          # Domain-specific type definitions
├── logger/                # Logging abstraction layer
├── modules/               # External service integrations
│   ├── channel.adapters/ # Communication channel adapters
│   ├── general/          # General utility modules
│   ├── injections/       # Dependency injection setup
│   ├── integrations/     # Third-party integrations
│   ├── interfaces/       # Module interfaces
│   ├── message.handlers/ # Message processing handlers
│   ├── queues/           # Queue management
│   └── services/         # External service clients
├── startup/               # Application bootstrap
├── telemetry/             # Observability and monitoring
└── types/                 # Global type definitions
```

## Key Architectural Layers

### API Layer (`src/api/`)
- RESTful endpoint definitions
- Request/response validation
- Route-specific middleware
- Controller logic

### Database Layer (`src/database/`)
- **Models**: TypeORM entities representing database tables
- **Services**: Business logic and data operations
- **Mappers**: Transform between domain objects and DTOs
- **Clients**: Database connection management

### Modules (`src/modules/`)
- External service integrations (Email, SMS, Storage)
- Message handling and queue processing
- Dependency injection configuration
- Reusable service components

### Configuration Files
- `service.config.json` - Default service configuration
- `service.config.local.json` - Local development overrides
- `.env` - Environment variables
- `tsconfig.json` - TypeScript compiler configuration
- `.eslintrc.json` - Code linting rules

## Naming Conventions
- **Files**: kebab-case (e.g., `user.service.ts`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Interfaces**: PascalCase with 'I' prefix (e.g., `IUserRepository`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/Functions**: camelCase

## Module Organization Principles
- **Domain-Driven**: Organize by business domain (rules, conditions)
- **Layered Architecture**: Clear separation between API, business logic, and data layers
- **Dependency Injection**: Services registered in modules for loose coupling
- **Single Responsibility**: Each module has a focused purpose
