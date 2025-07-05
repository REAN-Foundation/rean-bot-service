import 'reflect-metadata';
import { container, Lifecycle } from 'tsyringe';
import { Request } from 'express';
import { TenantConnectionService } from '../../database/tenant.db.connection.service';
import { WebhookHandlerService } from '../services/webhook.handler.service';
import { MessageProcessingService } from '../services/message.processing.service';
// import { IntentRecognitionService } from '../services/intent.recognition.service';
// import { RAGQAService } from '../services/rag.service';
import { AssessmentHandler } from '../message.handlers/assessment.handler';
import { WorkflowHandler } from '../message.handlers/workflow.handler';
import { ReminderHandler } from '../message.handlers/reminder.handler';
import { TaskHandler } from '../message.handlers/task.handler';
import { SmallTalkHandler } from '../message.handlers/smalltalk.handler';
import { FeedbackHandler } from '../message.handlers/feedback.handler';
import { FallbackHandler } from '../message.handlers/fallback.handler';

// Register core services
container.register('TenantConnectionService', {
    useClass : TenantConnectionService
}, { lifecycle: Lifecycle.Singleton });

container.register('WebhookHandlerService', {
    useClass : WebhookHandlerService
});

container.register('MessageProcessingService', {
    useClass : MessageProcessingService
});

// container.register('IntentRecognitionService', {
//     useClass : IntentRecognitionService
// });

// container.register('RAGQAService', {
//   useClass: RAGQAService
// });

// Register handlers
container.register('AssessmentHandler', { useClass: AssessmentHandler });
container.register('WorkflowHandler', { useClass: WorkflowHandler });
container.register('ReminderHandler', { useClass: ReminderHandler });
container.register('TaskHandler', { useClass: TaskHandler });
container.register('SmallTalkHandler', { useClass: SmallTalkHandler });
container.register('FeedbackHandler', { useClass: FeedbackHandler });
container.register('FallbackHandler', { useClass: FallbackHandler });

export interface TenantRequest extends Request {
  tenantId?: string;
  tenantSchema?: string;
}

export class ApplicationContainer {

    static createScopedContainer(request: TenantRequest) {
        const childContainer = container.createChildContainer();
        childContainer.register('REQUEST', { useValue: request });
        return childContainer;
    }

}

export { container };
