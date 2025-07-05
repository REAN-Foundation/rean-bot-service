# REAN Bot Service

A multi-tenant bot service designed to handle webhook processing, message queuing, and intelligent conversation management. The service provides a scalable architecture for processing messages from various channels with tenant-specific configurations and rate limiting.

## Features

### 🏢 Multi-Tenant Architecture
- **Tenant Isolation**: Each tenant has isolated database schemas and configurations
- **Dynamic Configuration**: Per-tenant webhook tokens, features, and limits
- **Tenant Management**: Create, update, activate/deactivate tenants
- **Schema-based Data Isolation**: `tenant_${tenantId}` schema pattern

### 🔗 Webhook Processing
- **Multiple Channel Support**: WhatsApp, Slack, Teams, and custom channels
- **Webhook Verification**: Signature validation for secure processing
- **Asynchronous Processing**: Non-blocking webhook reception with queued processing
- **Retry Logic**: Exponential backoff for failed message processing

### 📨 Message Processing
- **In-Memory Queue**: High-performance async-based message processing
- **Concurrent Processing**: Configurable concurrency levels
- **Message Handlers**: Specialized handlers for different message types
- **Intent Recognition**: AI-powered message understanding

### 🛡️ Rate Limiting & Security
- **Tenant-based Rate Limiting**: Per-tenant message and API call limits
- **In-Memory Storage**: Fast rate limit checks without external dependencies
- **Configurable Limits**: Messages per day, API calls per hour
- **IP-based Tracking**: Combined tenant and IP-based rate limiting

### 🗄️ Database Architecture
- **TypeORM Integration**: Entity-based database management
- **Repository Pattern**: Clean separation of data access logic
- **Multi-Database Support**: PostgreSQL and MySQL compatibility
- **Tenant Connection Management**: Dynamic database connection per tenant

### 📊 Monitoring & Logging
- **Structured Logging**: Multiple logger implementations (Winston, Pino, Bunyan)
- **Telemetry**: OpenTelemetry integration for observability
- **Queue Monitoring**: Real-time queue length and processing metrics
- **Error Tracking**: Comprehensive error logging and handling

## Recent Updates

### Version 2.0 Changes
- ✅ **Migrated from Redis to In-Memory**: Removed Redis dependencies for rate limiting
- ✅ **Replaced BullMQ with Async**: Simplified message queue implementation
- ✅ **Enhanced Tenant Management**: Complete tenant repository with advanced features
- ✅ **Improved Error Handling**: Better error messages and retry logic
- ✅ **Performance Optimizations**: Reduced latency through in-memory processing

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Webhook API   │───▶│  Rate Limiter   │───▶│ Message Queue   │
│                 │    │  (In-Memory)    │    │   (Async)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Tenant Database │◀───│ Message Handler │◀───│ Intent Service  │
│   (Per Tenant)  │    │   (Specialized) │    │   (AI-Powered)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL/MySQL with TypeORM
- **Dependency Injection**: TSyringe
- **Queue Processing**: Async library
- **Rate Limiting**: In-memory implementation
- **Logging**: Winston/Pino/Bunyan
- **Telemetry**: OpenTelemetry
- **Authentication**: JWT-based with role permissions

