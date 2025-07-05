# Tenant API Reference

This document describes the API endpoints for managing tenants in the REAN Bot Service.

## Authentication

All tenant API endpoints require authentication using an internal API key:

```http
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

## Base URL

```
https://your-domain.com/api/v1/tenants
```

## Endpoints

### Create Tenant

Creates a new tenant with isolated database schema and configuration.

```http
POST /api/v1/tenants
```

#### Request Body

```json
{
  "name": "acme-corp",
  "configuration": {
    "webhookTokens": {
      "whatsapp": "whatsapp_token_123",
      "slack": "slack_token_456",
      "teams": "teams_token_789"
    },
    "features": [
      "messaging",
      "webhooks",
      "analytics",
      "ai-responses"
    ],
    "limits": {
      "messagesPerDay": 5000,
      "apiCallsPerHour": 1000
    }
  },
  "isActive": true
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "acme-corp",
      "configuration": {
        "webhookTokens": {
          "whatsapp": "whatsapp_token_123",
          "slack": "slack_token_456",
          "teams": "teams_token_789"
        },
        "features": [
          "messaging",
          "webhooks",
          "analytics",
          "ai-responses"
        ],
        "limits": {
          "messagesPerDay": 5000,
          "apiCallsPerHour": 1000
        }
      },
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Get Tenant by ID

Retrieves a specific tenant by their ID.

```http
GET /api/v1/tenants/{tenantId}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tenantId` | string | UUID of the tenant |

#### Response

```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "acme-corp",
      "configuration": {
        "webhookTokens": {
          "whatsapp": "whatsapp_token_123"
        },
        "features": ["messaging", "webhooks"],
        "limits": {
          "messagesPerDay": 5000,
          "apiCallsPerHour": 1000
        }
      },
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Get Tenant by Name

Retrieves a tenant by their unique name.

```http
GET /api/v1/tenants/by-name/{name}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Unique name of the tenant |

#### Response

Same as [Get Tenant by ID](#get-tenant-by-id)

### List Active Tenants

Retrieves all active tenants.

```http
GET /api/v1/tenants/active
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 50 | Number of results per page |

#### Response

```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "acme-corp",
        "isActive": true,
        "configuration": {
          "features": ["messaging", "webhooks"],
          "limits": {
            "messagesPerDay": 5000,
            "apiCallsPerHour": 1000
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Find Tenants by Feature

Retrieves tenants that have a specific feature enabled.

```http
GET /api/v1/tenants/by-feature/{feature}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `feature` | string | Feature name to filter by |

#### Available Features

- `messaging` - Basic messaging capabilities
- `webhooks` - Webhook processing
- `analytics` - Analytics and reporting
- `ai-responses` - AI-powered responses
- `broadcasts` - Mass messaging
- `integrations` - Third-party integrations

#### Response

```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "acme-corp",
        "configuration": {
          "features": ["messaging", "webhooks", "analytics"]
        }
      }
    ]
  }
}
```

### Update Tenant

Updates tenant information and configuration.

```http
PUT /api/v1/tenants/{tenantId}
```

#### Request Body

```json
{
  "name": "acme-corporation",
  "configuration": {
    "limits": {
      "messagesPerDay": 10000,
      "apiCallsPerHour": 2000
    }
  }
}
```

#### Response

Returns the updated tenant object (same format as [Get Tenant by ID](#get-tenant-by-id))

### Update Tenant Configuration

Updates only the tenant configuration, merging with existing values.

```http
PATCH /api/v1/tenants/{tenantId}/configuration
```

#### Request Body

```json
{
  "features": ["messaging", "webhooks", "analytics", "ai-responses"],
  "limits": {
    "messagesPerDay": 15000
  },
  "webhookTokens": {
    "discord": "discord_token_new"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "configuration": {
        "webhookTokens": {
          "whatsapp": "whatsapp_token_123",
          "slack": "slack_token_456",
          "discord": "discord_token_new"
        },
        "features": ["messaging", "webhooks", "analytics", "ai-responses"],
        "limits": {
          "messagesPerDay": 15000,
          "apiCallsPerHour": 1000
        }
      }
    }
  }
}
```

### Activate Tenant

Activates a deactivated tenant.

```http
POST /api/v1/tenants/{tenantId}/activate
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tenant activated successfully",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Deactivate Tenant

Deactivates an active tenant (soft delete).

```http
POST /api/v1/tenants/{tenantId}/deactivate
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tenant deactivated successfully",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Delete Tenant

Permanently deletes a tenant (hard delete).

```http
DELETE /api/v1/tenants/{tenantId}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Tenant deleted successfully",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "Tenant not found or inactive"
  }
}
```

### 409 Conflict

```json
{
  "success": false,
  "error": {
    "code": "TENANT_EXISTS",
    "message": "Tenant with this name already exists"
  }
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred"
  }
}
```

## Rate Limiting

Tenant API endpoints are subject to rate limiting:

- **100 requests per hour** per API key
- **10 requests per minute** per API key

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## Examples

### Create a Marketing Bot Tenant

```bash
curl -X POST https://api.example.com/api/v1/tenants \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "marketing-bot",
    "configuration": {
      "webhookTokens": {
        "whatsapp": "wa_token_123"
      },
      "features": ["messaging", "broadcasts", "analytics"],
      "limits": {
        "messagesPerDay": 10000,
        "apiCallsPerHour": 500
      }
    }
  }'
```

### Update Tenant Limits

```bash
curl -X PATCH https://api.example.com/api/v1/tenants/550e8400-e29b-41d4-a716-446655440000/configuration \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "limits": {
      "messagesPerDay": 20000,
      "apiCallsPerHour": 1000
    }
  }'
```

### Get All Analytics-Enabled Tenants

```bash
curl -X GET https://api.example.com/api/v1/tenants/by-feature/analytics \
  -H "Authorization: Bearer your-api-key"
```

## Webhook Integration

After creating a tenant, you can set up webhooks using the tenant ID and webhook tokens:

```
POST /api/webhooks/{channel}/{tenantId}/{token}
```

See [Webhook API Reference](webhooks.md) for detailed webhook documentation.
