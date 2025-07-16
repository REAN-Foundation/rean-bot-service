# Technology Stack

## Core Technologies
- **Runtime**: Node.js 22.x+
- **Language**: TypeScript 4.9+ with strict type checking
- **Framework**: Express.js with middleware-based architecture
- **Database**: TypeORM with PostgreSQL/MySQL support
- **Dependency Injection**: TSyringe for IoC container

## Key Libraries & Frameworks
- **Authentication**: JWT (jsonwebtoken), bcryptjs for password hashing
- **Validation**: Joi for request validation, class-validator for DTOs
- **Logging**: Multiple providers (Custom, Winston, Pino, Bunyan)
- **Observability**: OpenTelemetry with tracing and metrics
- **File Storage**: AWS S3 SDK, Sharp for image processing
- **Communication**: Twilio (SMS), SendGrid (Email), WebSocket support
- **Scheduling**: node-cron for background tasks
- **Security**: Helmet, CORS, rate limiting

## Development Tools
- **Linting**: ESLint with TypeScript and Airbnb configuration
- **Build**: TypeScript compiler with incremental builds
- **Development**: Nodemon for hot reloading
- **Testing**: Jest framework (configured but minimal tests)
- **API Testing**: Bruno for API documentation and testing

## Common Commands

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
npm test             # Run test suite (currently minimal)
```

### Docker
```bash
docker build -t rean-bot-service .
docker run -p 3000:3000 rean-bot-service
```

## Architecture Patterns
- **Dependency Injection**: Constructor injection with TSyringe
- **Repository Pattern**: Data access layer abstraction
- **Service Layer**: Business logic separation
- **Middleware Pattern**: Express middleware for cross-cutting concerns
- **Observer Pattern**: Event handling and telemetry

## Configuration Management
- **Environment Variables**: Primary configuration method
- **JSON Config**: `service.config.json` for defaults, `service.config.local.json` for overrides
- **Layered Config**: Environment > Local > Default precedence
