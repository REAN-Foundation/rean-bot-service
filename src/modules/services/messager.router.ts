import { inject, scoped, Lifecycle } from 'tsyringe';
import { MessageRepository } from '../../database/repositories/message.repository';
import { ConversationRepository } from '../../database/repositories/conversation.repository';
import { Message } from '../../database/models/message.entity';
import { Conversation } from '../../database/models/conversation.entity';
import { IMessageHandler } from '../interfaces/handler.interface';
import { logger } from '../../logger/logger';
import { HandlerType } from '../../domain.types/intent.types';

///////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class MessagerRouter {

    private handlers = new Map<string, IMessageHandler>();

    constructor(
    @inject('MessageRepository') private _messageRepo: MessageRepository,
    @inject('ConversationRepository') private _conversationRepo: ConversationRepository,
    @inject('AssessmentHandler') _assessmentHandler: IMessageHandler,
    @inject('WorkflowHandler') _workflowHandler: IMessageHandler,
    @inject('ReminderHandler') _reminderHandler: IMessageHandler,
    @inject('TaskHandler') _taskHandler: IMessageHandler,
    @inject('SmallTalkHandler') _smallTalkHandler: IMessageHandler,
    @inject('FeedbackHandler') _feedbackHandler: IMessageHandler,
    @inject('FallbackHandler') private _fallbackHandler: IMessageHandler
    ) {
    // Register handlers
        this.handlers.set(HandlerType.Assessment, _assessmentHandler);
        this.handlers.set(HandlerType.Workflow, _workflowHandler);
        this.handlers.set(HandlerType.Reminder, _reminderHandler);
        this.handlers.set(HandlerType.Task, _taskHandler);
        this.handlers.set(HandlerType.SmallTalk, _smallTalkHandler);
        this.handlers.set(HandlerType.Feedback, _feedbackHandler);
    }

    async routeMessage(message: Message, conversation: Conversation, intentResult: any): Promise<void> {
        // TODO: Implement message routing logic
        logger.info(`Routing message: ${message.id}, intent: ${intentResult.intent}`);
        const handler = this.handlers.get(intentResult.intent) || this._fallbackHandler;
        await handler.handle(message, conversation, intentResult);
    }

}
