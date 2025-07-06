# Chatbot REST API Service - Project Requirements Document

## 1. Project Overview

### 1.1 Purpose
Build a multi-tenant chatbot API service that serves as a central hub for processing messages from various communication channels (WhatsApp, Telegram, Slack, Signal) and routing them to appropriate handlers.

### 1.2 Technology Stack
- **Language**: TypeScript
- **Runtime**: Node.js with Express.js
- **Database**: MySQL with TypeORM
- **Dependency Injection**: tsyringe
- **Testing**: Jest (unit and integration tests)
- **API Client**: Bruno (collections included in codebase)
- **Documentation**: Docsify (served at `/api/docs`)
- **Observability**: OpenTelemetry (tracing and metrics)

### 1.3 Key Features
- Multi-tenancy support with tenant-specific database schemas
- Channel-agnostic message processing
- Intent recognition and entity extraction
- Context-aware message routing
- Integration with external AI/LLM services
- Support for various message types (text, media, buttons, etc.)

## 2. API Endpoints Specification

### 2.1 Message Endpoints

#### Receive Messages
```
POST /messages/receive/tenants/:tenantCode/channels/:channel/tokens/:token
```
- **Purpose**: Webhook endpoint for receiving messages from communication channels
- **Parameters**:
  - `tenantCode`: Unique tenant identifier
  - `channel`: Channel type (whatsapp|telegram|slack|signal)
  - `token`: Authentication token for webhook validation
- **Request Body**: Channel-specific webhook payload
- **Response**: 200 OK with acknowledgment

#### Send Messages
```
POST /messages/send/tenants/:tenantCode/channels/:channel/tokens/:token
```
- **Purpose**: Send messages to users through specified channel
- **Parameters**: Same as receive endpoint
- **Request Body**:
```json
{
  "userId": "string",
  "messageType": "text|image|audio|video|buttons|list|location",
  "content": {
    // Content structure varies by messageType
  }
}
```

### 2.2 Documentation Endpoint
```
GET /api/docs
```
- Serves Docsify documentation from `./docs` folder

### 2.3 Health Check
```
GET /health
```
- Returns service health status

## 3. Database Schema

### 3.1 Multi-Tenancy Structure
Each tenant has a separate schema with the following tables:

#### conversations
```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  UserId VARCHAR(255) NOT NULL,
  Channel VARCHAR(50) NOT NULL,
  Status VARCHAR(50) DEFAULT 'active',
  Context JSON,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### messages
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  ConversationId VARCHAR(36) NOT NULL,
  MessageType VARCHAR(50) NOT NULL,
  Direction ENUM('inbound', 'outbound'),
  Content JSON NOT NULL,
  ProcessedContent JSON,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ConversationId) REFERENCES conversations(id)
);
```

#### intents
```sql
CREATE TABLE intents (
  id VARCHAR(36) PRIMARY KEY,
  IntentName VARCHAR(100) NOT NULL,
  DisplayName VARCHAR(255),
  Description TEXT,
  RequiredEntities JSON,
  HandlerType VARCHAR(100),
  HandlerConfig JSON,
  Priority INT DEFAULT 0,
  IsActive BOOLEAN DEFAULT true,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### conversation_context
```sql
CREATE TABLE conversation_context (
  id VARCHAR(36) PRIMARY KEY,
  ConversationId VARCHAR(36) NOT NULL,
  CurrentMode VARCHAR(100),
  CurrentHandler VARCHAR(100),
  ModeData JSON,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ConversationId) REFERENCES conversations(id)
);
```

## 4. Module Specifications

### 4.1 Channel Module
**Interface**: `IChannelAdapter`
```typescript
interface IChannelAdapter {
  parseIncomingMessage(payload: any): CommonMessage;
  formatOutgoingMessage(message: CommonMessage): any;
  validateWebhookToken(token: string): boolean;
  sendMessage(userId: string, message: any): Promise<void>;
}
```

**Implementations**:
- `WhatsAppChannelAdapter`
- `TelegramChannelAdapter`
- `SlackChannelAdapter`
- `SignalChannelAdapter`

### 4.2 Message Queue Module
**Interface**: `IMessageQueue`
```typescript
interface IMessageQueue {
  enqueue(message: QueueMessage): Promise<void>;
  process(handler: (message: QueueMessage) => Promise<void>): void;
}
```

### 4.3 Message Transformation Module
**Interface**: `IMessageTransformer`
```typescript
interface IMessageTransformer {
  translateText(text: string, targetLanguage: string): Promise<string>;
  transcribeAudio(audioUrl: string): Promise<string>;
  extractTextFromImage(imageUrl: string): Promise<string>;
  extractTextFromVideo(videoUrl: string): Promise<string>;
}
```

### 4.4 Message Router Module
**Interface**: `IMessageRouter`
```typescript
interface IMessageRouter {
  route(message: CommonMessage, context: ConversationContext): Promise<HandlerType>;
  registerHandler(type: HandlerType, handler: IMessageHandler): void;
}
```

**Handler Types**:
- `USER_CONSENT`
- `QNA_RAG`
- `ASSESSMENT`
- `WORKFLOW`
- `REMINDER`
- `TASK`
- `INTENT`
- `SMALL_TALK`
- `FEEDBACK`
- `FALLBACK`

### 4.5 Context Provider Module
**Interface**: `IContextProvider`
```typescript
interface IContextProvider {
  getContext(conversationId: string): Promise<ConversationContext>;
  updateContext(conversationId: string, context: Partial<ConversationContext>): Promise<void>;
  summarizeHistory(messages: Message[]): Promise<string>;
}
```

### 4.6 Intent Recognition Module
**Interface**: `IIntentRecognizer`
```typescript
interface IIntentRecognizer {
  recognizeIntent(message: string, context: ConversationContext): Promise<IntentResult>;
  extractEntities(message: string, intent: Intent): Promise<EntityMap>;
  registerIntent(intent: Intent): Promise<void>;
}
```

## 5. External Service Integrations

### 5.1 LLM Service
```typescript
interface IGenAIService {
  generateResponse(prompt: string, context: any): Promise<string>;
  classifyIntent(message: string, intents: Intent[]): Promise<IntentScore[]>;
  extractEntities(message: string, schema: EntitySchema): Promise<EntityMap>;
  performRAGQuery(query: string, knowledgeBase: string): Promise<string>;
}
```

### 5.2 Assessment Service
```typescript
interface IAssessmentService {
  getAssessment(assessmentId: string): Promise<Assessment>;
  submitResponse(assessmentId: string, response: any): Promise<void>;
  getNextQuestion(assessmentId: string): Promise<Question>;
}
```

### 5.3 Workflow Service
```typescript
interface IWorkflowService {
  startWorkflow(workflowId: string, userId: string): Promise<WorkflowInstance>;
  executeStep(instanceId: string, input: any): Promise<WorkflowStep>;
  getWorkflowStatus(instanceId: string): Promise<WorkflowStatus>;
}
```

## 6. Project Structure

```
chatbot-service/
├── src/
│   ├── api/
│   │   ├── message/
│   │   │   ├── message.controller.ts
│   │   │   ├── message.routes.ts
│   │   │   └── message.validator.ts
│   │   └── health/
│   │       ├── health.controller.ts
│   │       ├── health.routes.ts
│   │       └── health.validator.ts
│   ├── modules/
│   │   ├── channel/
│   │   │   ├── channel.adapter.interface.ts
│   │   │   ├── adapters/
│   │   │   │   ├── whatsapp.adapter.ts
│   │   │   │   ├── telegram.adapter.ts
│   │   │   │   ├── slack.adapter.ts
│   │   │   │   └── signal.adapter.ts
│   │   │   └── channel.factory.ts
│   │   ├── queue/
│   │   │   ├── message.queue.interface.ts
│   │   │   └── message.processing.queue.ts
│   │   ├── transformation/
│   │   │   ├── message.transformer.interface.ts
│   │   │   └── message.transformer.service.ts
│   │   ├── routing/
│   │   │   ├── message.router.interface.ts
│   │   │   └── message.router.service.ts
│   │   ├── context/
│   │   │   ├── context.provider.interface.ts
│   │   │   └── context.provider.service.ts
│   │   ├── intent/
│   │   │   ├── intent.recognizer.interface.ts
│   │   │   └── intent.recognizer.service.ts
│   │   └── handlers/
│   │       ├── handler.interface.ts
│   │       ├── consent.handler.ts
│   │       ├── qna.handler.ts
│   │       ├── assessment.handler.ts
│   │       ├── workflow.handler.ts
│   │       ├── reminder.handler.ts
│   │       ├── task.handler.ts
│   │       ├── intent.handler.ts
│   │       ├── small-talk.handler.ts
│   │       ├── feedback.handler.ts
│   │       └── fallback.handler.ts
│   ├── database/
│   │   ├── entities/
│   │   │   ├── conversation.entity.ts
│   │   │   ├── message.entity.ts
│   │   │   ├── intent.entity.ts
│   │   │   └── conversation-context.entity.ts
│   │   ├── repositories/
│   │   │   ├── conversation.repo.interface.ts
│   │   │   ├── conversation.repo.ts
│   │   │   └── message.repo.ts
│   │   └── connection.manager.ts
│   ├── services/
│   │   ├── external/
│   │   │   ├── gen-ai.service.interface.ts
│   │   │   ├── llm.service.ts
│   │   │   ├── assessment.service.ts
│   │   │   └── workflow.service.ts
│   │   └── internal/
│   │       ├── tenant.service.ts
│   │       ├── message.service.ts
│   │       ├── conversation.service.ts
│   │       └── intent.service.ts
│   ├── common/
│   │   ├── types/
│   │   │   ├── message.types.ts
│   │   │   ├── intent.types.ts
│   │   │   └── context.types.ts
│   │   ├── error.handling/
│   │       ├── app.error.ts
│   │       └── error.handler.ts
│   ├── startup/
│   │   ├── middlewares/
│   │   │   ├── tenant.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── injector.ts
│   │   ├── request.router.ts
│   │   ├── scheduler.ts
│   │   ├── seeder.ts
│   │   ├── test.data.seeder.ts
│   │   ├── seeder.ts
│   ├── logger/
│   │   └── logger.ts
│   │   └── telemetry/
│   │       └── telemetry.service.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── app.config.ts
│   │   └── container.config.ts
│   └── app.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── bruno/
│   └── chatbot-api/
│       ├── messages/
│       └── health/
├── docs/
│   ├── index.html
│   ├── README.md
│   └── api/
├── .env.example
├── tsconfig.json
├── jest.config.js
├── package.json
└── README.md
```

## 7. Implementation Guidelines

### 7.1 Dependency Injection Setup
```typescript
// container.config.ts
import { container } from 'tsyringe';

// Register services
container.register<IMessageQueue>('MessageQueue', { useClass: InMemoryQueue });
container.register<IMessageRouter>('MessageRouter', { useClass: MessageRouterService });

// Register channel adapters
container.register<IChannelAdapter>('WhatsAppAdapter', { useClass: WhatsAppChannelAdapter });
```

### 7.2 Multi-tenancy Implementation
```typescript
// middleware/tenant.middleware.ts
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tenantCode = req.params.tenantCode;
  const tenant = await tenantService.getTenant(tenantCode);

  // Create tenant-scoped container
  const childContainer = container.createChildContainer();
  childContainer.register('TenantConfig', { useValue: tenant });
  childContainer.register('DataSource', {
    useFactory: () => createTenantConnection(tenant.dbSchema)
  });

  req.container = childContainer;
  next();
};
```

### 7.3 Message Processing Flow
```typescript
// Example controller method
export class MessageController {
  async receiveMessage(req: Request, res: Response) {
    try {
      const { channel, token } = req.params;
      const container = req.container;

      // Get channel adapter
      const adapter = container.resolve<IChannelAdapter>(`${channel}Adapter`);

      // Validate webhook token
      if (!adapter.validateWebhookToken(token)) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Parse message
      const message = adapter.parseIncomingMessage(req.body);

      // Queue for processing
      const queue = container.resolve<IMessageQueue>('MessageQueue');
      await queue.enqueue({ ...message, tenantCode: req.params.tenantCode });

      res.status(200).json({ status: 'queued' });
    } catch (error) {
      ErrorHandler.handle(error, res);
    }
  }
}
```

### 7.4 Testing Strategy
```typescript
// Example unit test
describe('MessageRouter', () => {
  let router: IMessageRouter;
  let mockContextProvider: jest.Mocked<IContextProvider>;

  beforeEach(() => {
    mockContextProvider = createMock<IContextProvider>();
    router = new MessageRouterService(mockContextProvider);
  });

  it('should route to QNA handler for knowledge queries', async () => {
    const message = { content: 'What is diabetes?', type: 'text' };
    const context = { currentMode: null };

    mockContextProvider.getContext.mockResolvedValue(context);

    const handlerType = await router.route(message, context);
    expect(handlerType).toBe('QNA_RAG');
  });
});
```

## 8. Environment Configuration

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=chatbot_service

# External Services
LLM_SERVICE_URL=http://localhost:4000
ASSESSMENT_SERVICE_URL=http://localhost:4001
WORKFLOW_SERVICE_URL=http://localhost:4002
MAIN_BACKEND_URL=http://localhost:4003

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_SERVICE_NAME=chatbot-service

# Queue Configuration
QUEUE_MAX_SIZE=1000
QUEUE_PROCESS_INTERVAL=100
```

## 9. Development Notes

### 9.1 Error Handling
- Use custom error classes extending base `AppError`
- Implement global error handler middleware
- Log errors with appropriate context using structured logging

### 9.2 Logging
- Use structured logging (e.g., winston)
- Include tenant context in all logs
- Log levels: ERROR, WARN, INFO, DEBUG

### 9.3 OpenTelemetry Setup
- Create spans for major operations
- Add custom attributes for tenant, channel, message type
- Export metrics for message processing rate, error rate, latency

### 9.4 Security Considerations
- Validate all webhook tokens
- Implement rate limiting per tenant
- Sanitize user inputs before processing
- Use parameterized queries for database operations

## 10. Deployment Considerations

### 10.1 Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

### 10.2 Health Checks
- Database connectivity
- External service availability
- Queue status
- Memory usage

This document provides the complete specification for building the chatbot REST API service. Follow the coding guidelines provided in the original document for implementation details.
