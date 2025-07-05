- Getting Started

  - [Quick Start](about/quickstart.md)
  - [REST API](about/rest-api.md)
  - [SDK Integration](about/sdk.md)
  - [Configuration](about/configuration.md)

- Architecture

  - [Multi-Tenant Design](architecture/multi-tenant.md)
  - [Database Structure](architecture/database.md)
  - [Message Processing](architecture/message-processing.md)
  - [Rate Limiting](architecture/rate-limiting.md)
  - [Security](architecture/security.md)

- Core Features

  - [Tenant Management](features/tenant-management.md)
    - [Creating Tenants](features/tenant-management.md#creating-tenants)
    - [Configuration](features/tenant-management.md#configuration)
    - [Schema Isolation](features/tenant-management.md#schema-isolation)

  - [Webhook Processing](features/webhook-processing.md)
    - [Supported Channels](features/webhook-processing.md#channels)
    - [Verification](features/webhook-processing.md#verification)
    - [Processing Flow](features/webhook-processing.md#flow)

  - [Message Handling](features/message-handling.md)
    - [Intent Recognition](features/message-handling.md#intent-recognition)
    - [Response Generation](features/message-handling.md#responses)
    - [Handler Types](features/message-handling.md#handler-types)

  - [Queue Management](features/queue-management.md)
    - [Async Processing](features/queue-management.md#async-processing)
    - [Retry Logic](features/queue-management.md#retry-logic)
    - [Monitoring](features/queue-management.md#monitoring)

- API Reference

  - [Tenant API](api/tenants.md)
  - [Webhook API](api/webhooks.md)
  - [Queue API](api/queue.md)
  - [Health Checks](api/health.md)

- Migration Guides

  - [Version 2.0 Changes](migration/v2.0.md)
    - [Redis to In-Memory](migration/v2.0.md#redis-migration)
    - [BullMQ to Async](migration/v2.0.md#queue-migration)
    - [Enhanced Tenant Management](migration/v2.0.md#tenant-changes)

- Examples

  - [Customer Support Bot](examples/customer-support.md)
  - [Marketing Campaigns](examples/marketing-bot.md)
  - [WhatsApp Integration](examples/whatsapp-setup.md)
  - [Slack Integration](examples/slack-setup.md)

- Operations

  - [Deployment](other/deployment.md)
  - [Monitoring](other/monitoring.md)
  - [Troubleshooting](other/troubleshooting.md)
  - [Performance Tuning](other/performance.md)
  - [Roadmap](other/roadmap.md)
