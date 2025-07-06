import 'reflect-metadata';
import { container, Lifecycle } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { WebhookHandlerService } from '../modules/services/webhook.handler.service';
import { MessageProcessingService } from '../modules/services/message.processing.service';
// import { IntentRecognitionService } from '../services/intent.recognition.service';
// import { RAGQAService } from '../services/rag.service';
import { AssessmentHandler } from '../modules/message.handlers/assessment.handler';
import { WorkflowHandler } from '../modules/message.handlers/workflow.handler';
import { ReminderHandler } from '../modules/message.handlers/reminder.handler';
import { TaskHandler } from '../modules/message.handlers/task.handler';
import { SmallTalkHandler } from '../modules/message.handlers/smalltalk.handler';
import { FeedbackHandler } from '../modules/message.handlers/feedback.handler';
import { FallbackHandler } from '../modules/message.handlers/fallback.handler';

// Register core services
// container.register('TenantConnectionService', {
//     useClass : TenantConnectionService
// }, { lifecycle: Lifecycle.Singleton });

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

export const requestScopeInjector = (req: Request, res: Response, next: NextFunction): void => {
    // Create a child container for this request
    const childContainer = container.createChildContainer();

    // Register request-scoped services
    childContainer.registerSingleton('MessageProcessingService', MessageProcessingService);
    childContainer.registerSingleton('WebhookHandlerService', WebhookHandlerService);

    // Register message handlers
    childContainer.registerSingleton('AssessmentHandler', AssessmentHandler);
    childContainer.registerSingleton('WorkflowHandler', WorkflowHandler);
    childContainer.registerSingleton('ReminderHandler', ReminderHandler);
    childContainer.registerSingleton('TaskHandler', TaskHandler);
    childContainer.registerSingleton('SmallTalkHandler', SmallTalkHandler);
    childContainer.registerSingleton('FeedbackHandler', FeedbackHandler);
    childContainer.registerSingleton('FallbackHandler', FallbackHandler);

    // Store the container in the request for later use
    (req as any).container = childContainer;

    next();
};

export { container };
