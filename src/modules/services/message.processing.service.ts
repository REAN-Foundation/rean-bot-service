import { inject, scoped, Lifecycle } from 'tsyringe';
import { MessageRepository } from '../../database/repositories/message.repository';
import { ConversationRepository } from '../../database/repositories/conversation.repository';
import { MessageDirection } from '../../database/models/message.entity';
import { IMessageHandler } from '../interfaces/handler.interface';
import { logger } from '../../logger/logger';
import { HandlerType } from '../../domain.types/intent.types';
import { ChannelFactory } from '../channel.adapters';
import { MessageStatus } from '../../domain.types/message.types';

///////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class MessageProcessingService {

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

    async processMessage(messageData: any): Promise<void> {
        try {

            const conversation = await this.getOrCreateConversation(messageData);

            //Convert incoming message to our internal message format
            const channelFactory = ChannelFactory.getInstance();
            const channelAdapter = await channelFactory.createAdapter(
                messageData.channel,
                messageData.tenantId,
                messageData.config
            );
            const inMessage = await channelAdapter.parseIncomingMessage(messageData);
            if (!inMessage) {
                throw new Error('Failed to parse incoming message');
            }

            // Save message
            const message = await this._messageRepo.create({
                ConversationId            : conversation.id,
                UserId                    : inMessage.UserId,
                Channel                   : inMessage.Channel,
                ChannelMessageId          : inMessage.Metadata?.ChannelMessageId,
                ReferenceChannelMessageId : inMessage.Metadata?.ReferenceMessageId,
                MessageType               : inMessage.MessageType,
                Direction                 : MessageDirection.Inbound,
                Content                   : inMessage.Content,
                Metadata                  : inMessage.Metadata,
                ProcessedContent          : inMessage.ProcessedContent,
                Status                    : MessageStatus.Processing
            });

            // Recognize intent
            // const intentResult = await this.intentService.recognizeIntent(
            //     messageData.content.text || messageData.content,
            //     conversation.context
            // );

            const intentResult = {
                intent     : 'assessment',
                confidence : 1.0,
                entities   : {}
            };

            // Route to appropriate handler
            const handler = this.handlers.get(intentResult.intent) || this._fallbackHandler;
            const response = await handler.handle(messageData, conversation, intentResult);

            // Update conversation context
            await this.updateConversationContext(conversation, messageData, response, intentResult);

            // Update message status
            await this._messageRepo.update(message.id, { Status: 'processed' });
            logger.info(`Message processed successfully, messageId: ${message.id}, intent: ${intentResult.intent}, confidence: ${intentResult.confidence}`);

        } catch (error) {
            logger.error(`Message processing failed: ${error}, messageData: ${JSON.stringify(messageData)}`);
            throw error;
        }
    }

    private async getOrCreateConversation(messageData: any): Promise<any> {
        const existingConversation = await this._conversationRepo.findOne({
            where : {
                UserId  : messageData.from,
                Channel : messageData.channel,
                Status  : 'active'
            }
        });

        if (existingConversation) {
            return existingConversation;
        }

        return this._conversationRepo.create({
            UserId  : messageData.from,
            Channel : messageData.channel,
            Status  : 'active'
        });
    }

    private async updateConversationContext(
        conversation: any,
        message: any,
        response: any,
        intentResult: any
    ): Promise<void> {
        conversation.context.intent = intentResult.intent;
        conversation.context.entities = { ...conversation.context.entities, ...intentResult.entities };
        conversation.context.history.push({
            message   : message.content.text || JSON.stringify(message.content),
            response  : response.text || JSON.stringify(response),
            timestamp : new Date()
        });

        // Keep only last 10 exchanges
        if (conversation.context.history.length > 10) {
            conversation.context.history = conversation.context.history.slice(-10);
        }

        await this._conversationRepo.update(conversation.id, {
            Status : 'active'
        });
    }

}
