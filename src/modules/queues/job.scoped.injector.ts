import 'reflect-metadata';
import { container, DependencyContainer } from 'tsyringe';
import { WebhookHandlerService } from '../services/webhook.handler.service';
import { MessageProcessingService } from '../services/message.processing.service';
import { AssessmentHandler } from '../message.handlers/assessment.handler';
import { WorkflowHandler } from '../message.handlers/workflow.handler';
import { ReminderHandler } from '../message.handlers/reminder.handler';
import { TaskHandler } from '../message.handlers/task.handler';
import { SmallTalkHandler } from '../message.handlers/smalltalk.handler';
import { FeedbackHandler } from '../message.handlers/feedback.handler';
import { FallbackHandler } from '../message.handlers/fallback.handler';

///////////////////////////////////////////////////////////////////////////////

export default class JobScopedInjector {

    static createScopedContainer(): DependencyContainer {
        const childContainer = container.createChildContainer();
        this.registerServices(childContainer);
        this.registerHandlers(childContainer);
        return childContainer;
    }

    static registerServices(container: DependencyContainer) {
        container.register('MessageProcessingService', {
            useClass : MessageProcessingService
        });
        container.register('WebhookHandlerService', {
            useClass : WebhookHandlerService
        });
    }

    static registerHandlers(container: DependencyContainer) {
        container.register('AssessmentHandler', {
            useClass : AssessmentHandler
        });
        container.register('WorkflowHandler', {
            useClass : WorkflowHandler
        });
        container.register('ReminderHandler', {
            useClass : ReminderHandler
        });
        container.register('TaskHandler', {
            useClass : TaskHandler
        });
        container.register('SmallTalkHandler', {
            useClass : SmallTalkHandler
        });
        container.register('FeedbackHandler', {
            useClass : FeedbackHandler
        });
        container.register('FallbackHandler', {
            useClass : FallbackHandler
        });
    }

}
