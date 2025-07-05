
# Quick Start Guide

Get up and running with the REAN Bot Service in minutes. This guide will walk you through the essential setup and configuration steps.

## Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** or **MySQL** database
- **npm** or **yarn** package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rean-bot-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:
   ```bash
   cp .env.sample .env
   ```

   Configure the following variables:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=rean_bot_service
   DB_USERNAME=your_username
   DB_PASSWORD=your_password

   # Application Configuration
   PORT=3000
   NODE_ENV=development

   # Internal API Key
   INTERNAL_API_KEY=your-internal-api-key

   # External Service URLs
   USER_SERVICE_BASE_URL=https://api.user-service.com
   ```

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Creating Your First Tenant

1. **Access the tenant management API**
   ```bash
   POST /api/tenants
   Content-Type: application/json

   {
     "name": "my-company",
     "configuration": {
       "webhookTokens": {
         "whatsapp": "your-whatsapp-token",
         "slack": "your-slack-token"
       },
       "features": ["messaging", "webhooks"],
       "limits": {
         "messagesPerDay": 1000,
         "apiCallsPerHour": 100
       }
     }
   }
   ```

2. **The service will create a dedicated database schema** for your tenant:
   - Schema name: `tenant_${tenantId}`
   - Isolated data storage
   - Tenant-specific configurations

## Setting Up Webhooks

### WhatsApp Integration
```bash
POST /api/webhooks/whatsapp/{tenantId}/{token}
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "messages": [
              {
                "from": "1234567890",
                "text": {
                  "body": "Hello Bot!"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Slack Integration
```bash
POST /api/webhooks/slack/{tenantId}/{token}
Content-Type: application/json

{
  "type": "event_callback",
  "event": {
    "type": "message",
    "user": "U1234567890",
    "text": "Hello Bot!",
    "channel": "C1234567890"
  }
}
```

## Monitoring & Management

### Queue Status
```bash
GET /api/queue/status
```

Response:
```json
{
  "queueLength": 5,
  "runningJobs": 2,
  "isPaused": false
}
```

### Tenant Status
```bash
GET /api/tenants/{tenantId}
```

Response:
```json
{
  "id": "tenant-123",
  "name": "my-company",
  "isActive": true,
  "configuration": {
    "features": ["messaging", "webhooks"],
    "limits": {
      "messagesPerDay": 1000,
      "apiCallsPerHour": 100
    }
  }
}
```

## Rate Limiting

The service automatically applies rate limits based on tenant configuration:

- **Messages per day**: Configurable limit per tenant
- **API calls per hour**: Configurable limit per tenant
- **In-memory tracking**: Fast, Redis-free rate limiting

Rate limit headers in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## Common Use Cases

### 1. Customer Support Bot
```javascript
// Configure tenant for customer support
{
  "features": ["messaging", "webhooks", "ai-responses"],
  "limits": {
    "messagesPerDay": 5000,
    "apiCallsPerHour": 1000
  }
}
```

### 2. Marketing Bot
```javascript
// Configure tenant for marketing campaigns
{
  "features": ["messaging", "broadcasts", "analytics"],
  "limits": {
    "messagesPerDay": 10000,
    "apiCallsPerHour": 500
  }
}
```

### 3. Internal Tools Bot
```javascript
// Configure tenant for internal team tools
{
  "features": ["messaging", "webhooks", "integrations"],
  "limits": {
    "messagesPerDay": 1000,
    "apiCallsPerHour": 200
  }
}
```

## Troubleshooting

### Service Won't Start
1. Check database connection
2. Verify environment variables
3. Ensure port is available
4. Check logs: `npm run dev`

### Webhooks Not Processing
1. Verify webhook URL configuration
2. Check tenant token validity
3. Review rate limiting status
4. Check queue processing status

### Database Connection Issues
1. Verify database credentials
2. Check database server status
3. Ensure TypeORM configuration is correct
4. Check network connectivity

## Next Steps

- [REST API Documentation](rest-api.md)
- [SDK Integration](sdk.md)
- [Message Handler Examples](../examples/emergency-incident-handling.md)
- [Deployment Guide](../other/deployment.md)

## Support

For additional help:
- Check the [troubleshooting guide](../other/troubleshooting.md)
- Review [API documentation](rest-api.md)
- Contact support team
