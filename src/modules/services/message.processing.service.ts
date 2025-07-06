import { injectable, inject } from 'tsyringe';
import { MessageRepository } from '../../database/repositories/message.repository';
import { ConversationRepository } from '../../database/repositories/conversation.repository';
import { MessageDirection } from '../../database/models/message.entity';
// import { IntentRecognitionService } from './intent.recognition.service';
import { IMessageHandler } from '../message.handlers/interfaces/handler.interface';
import { logger } from '../../logger/logger';

@injectable()
export class MessageProcessingService {

    private handlers = new Map<string, IMessageHandler>();

    constructor(
    @inject('MessageRepository') private messageRepo: MessageRepository,
    @inject('ConversationRepository') private conversationRepo: ConversationRepository,
    // @inject('IntentRecognitionService') private intentService: IntentRecognitionService,
    @inject('AssessmentHandler') assessmentHandler: IMessageHandler,
    @inject('WorkflowHandler') workflowHandler: IMessageHandler,
    @inject('ReminderHandler') reminderHandler: IMessageHandler,
    @inject('TaskHandler') taskHandler: IMessageHandler,
    @inject('SmallTalkHandler') smallTalkHandler: IMessageHandler,
    @inject('FeedbackHandler') feedbackHandler: IMessageHandler,
    @inject('FallbackHandler') private fallbackHandler: IMessageHandler
    ) {
    // Register handlers
        this.handlers.set('assessment', assessmentHandler);
        this.handlers.set('workflow', workflowHandler);
        this.handlers.set('reminder', reminderHandler);
        this.handlers.set('task', taskHandler);
        this.handlers.set('small_talk', smallTalkHandler);
        this.handlers.set('feedback', feedbackHandler);
    }

    async processMessage(messageData: any): Promise<void> {
        try {
            // Save message
            const message = await this.messageRepo.create({
                id               : messageData.id,
                ConversationId   : '', // Will be set after conversation creation
                UserId           : messageData.from,
                Channel          : messageData.channel,
                MessageType      : messageData.type,
                Direction        : MessageDirection.Inbound,
                Content          : messageData.content,
                Status           : 'processing'
            });

            // Get or create conversation
            const conversation = await this.getOrCreateConversation(messageData);

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
            const handler = this.handlers.get(intentResult.intent) || this.fallbackHandler;
            const response = await handler.handle(messageData, conversation, intentResult);

            // Update conversation context
            await this.updateConversationContext(conversation, messageData, response, intentResult);

            // Update message status
            await this.messageRepo.update(message.id, { Status: 'processed' });
            logger.info(`Message processed successfully, messageId: ${message.id}, intent: ${intentResult.intent}, confidence: ${intentResult.confidence}`);

        } catch (error) {
            logger.error(`Message processing failed: ${error}, messageData: ${JSON.stringify(messageData)}`);
            throw error;
        }
    }

    private async getOrCreateConversation(messageData: any): Promise<any> {
        const existingConversation = await this.conversationRepo.findOne({
            where : {
                UserId  : messageData.from,
                Channel : messageData.channel,
                Status  : 'active'
            }
        });

        if (existingConversation) {
            return existingConversation;
        }

        return this.conversationRepo.create({
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

        await this.conversationRepo.update(conversation.id, {
            Status : 'active'
        });
    }

}
