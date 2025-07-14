import { injectable } from 'tsyringe';
import * as crypto from 'crypto';
import needle from 'needle';
import { IChannelAdapter } from '../interfaces/channel.adapter.interface';
import {
    MessageContent,
    ChannelType,
    DeliveryStatus,
    CommonMessage,
    MessageDirection,
    MessageStatus
} from '../../domain.types/message.types';
import { WhatsAppMessageTransformer, WhatsAppWebhookMessage, WhatsAppOutgoingMessage } from './transformers/whatsapp.message.transformer';
import { logger } from '../../logger/logger';

////////////////////////////////////////////////////////////

export interface WhatsAppConfig {
    accessToken: string;
    webhookVerifyToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    apiVersion?: string;
    webhookSecret?: string;
    baseUrl?: string;
}

export interface WhatsAppWebhookEntry {
    id: string;
    changes: Array<{
        value: {
            messaging_product: ChannelType.WhatsApp;
            metadata: {
                display_phone_number: string;
                phone_number_id: string;
            };
            contacts?: Array<{
                profile: {
                    name: string;
                };
                wa_id: string;
            }>;
            messages?: WhatsAppWebhookMessage[];
            statuses?: Array<{
                id: string;
                status: string;
                timestamp: string;
                recipient_id: string;
                errors?: Array<{
                    code: number;
                    title: string;
                    message: string;
                }>;
            }>;
            errors?: Array<{
                code: number;
                title: string;
                message: string;
                error_data: {
                    details: string;
                };
            }>;
        };
        field: string;
    }>;
}

export interface WhatsAppWebhookPayload {
    object: string;
    entry: WhatsAppWebhookEntry[];
}

@injectable()
export class WhatsAppAdapter implements IChannelAdapter {

    private config: WhatsAppConfig | null = null;

    private transformer: WhatsAppMessageTransformer;

    private isInitialized = false;

    private lastHealthCheck = new Date();

    private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';

    constructor() {
        this.transformer = new WhatsAppMessageTransformer();
    }

    //#region IChannelAdapter Implementation

    async initialize(config: Record<string, any>): Promise<void> {
        try {
            this.validateConfig(config);
            this.config = config as WhatsAppConfig;

            // Set defaults
            this.config.apiVersion = this.config.apiVersion || 'v18.0';
            this.config.baseUrl = this.config.baseUrl || 'https://graph.facebook.com';

            // Verify configuration by making a test API call
            await this.verifyConfiguration();

            this.isInitialized = true;
            this.healthStatus = 'healthy';
            this.lastHealthCheck = new Date();

            logger.info(`WhatsApp adapter initialized successfully, phoneNumberId: ${this.config.phoneNumberId}, apiVersion: ${this.config.apiVersion}`);

        } catch (error) {
            this.healthStatus = 'unhealthy';
            logger.error(`Failed to initialize WhatsApp adapter: ${error}`);
            throw new Error(`WhatsApp adapter initialization failed: ${error}`);
        }
    }

    async sendMessage(
        channelUserId: string,
        content: MessageContent,
        metadata?: Record<string, any>
    ): Promise<DeliveryStatus> {
        this.ensureInitialized();

        try {
            const whatsappMessage = this.transformer.formatOutgoingMessage(
                channelUserId,
                content,
                metadata
            );

            const response = await this.makeApiCall('POST', 'messages', whatsappMessage);

            return {
                Sent             : new Date(),
                MessageId        : response.messages[0].id,
                Status           : 'sent',
                Timestamp        : new Date(),
                PlatformResponse : response
            };

        } catch (error) {
            logger.error(`Failed to send WhatsApp message, channelUserId: ${channelUserId}, error: ${error.message}, content: ${content}`);

            return {
                Failed           : new Date(),
                MessageId        : metadata?.messageId || '',
                Status           : 'failed',
                Timestamp        : new Date(),
                Error            : error,
                PlatformResponse : null
            };
        }
    }

    async processIncomingWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<{ messages: any[]; isValid: boolean }> {
        try {
            // Validate webhook signature if secret is configured
            if (this.config?.webhookSecret && !this.validateWebhookSignature(payload, headers)) {
                logger.warn('Invalid WhatsApp webhook signature');
                return { messages: [], isValid: false };
            }

            const webhookPayload = payload as WhatsAppWebhookPayload;

            // Validate payload structure
            if (!this.isValidWebhookPayload(webhookPayload)) {
                logger.warn('Invalid WhatsApp webhook payload structure');
                return { messages: [], isValid: false };
            }

            const messages = this.extractMessagesFromWebhook(webhookPayload);

            logger.info(`Processed WhatsApp webhook, messagesCount: ${messages.length}, entriesCount: ${webhookPayload.entry.length}`);

            return { messages, isValid: true };

        } catch (error) {
            logger.error(`Error processing WhatsApp webhook: ${error.message}`);
            return { messages: [], isValid: false };
        }
    }

    async validateWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<boolean> {
        // Handle verification challenge for webhook setup
        const mode = payload['hub.mode'];
        const token = payload['hub.verify_token'];
        const challenge = payload['hub.challenge'];

        if (mode === 'subscribe' && token === this.config?.webhookVerifyToken) {
            logger.info('WhatsApp webhook verification successful');
            return true;
        }

        // Validate ongoing webhook signatures
        if (this.config?.webhookSecret) {
            return this.validateWebhookSignature(payload, headers);
        }

        return true; // Allow if no secret configured
    }

    getChannelId(): string {
        return ChannelType.WhatsApp;
    }

    getChannelName(): string {
        return 'WhatsApp Business';
    }

    getSupportedMessageTypes(): string[] {
        return [
            'text',
            'image',
            'audio',
            'video',
            'document',
            'location',
            'contacts',
            'interactive',
            'template'
        ];
    }

    supportsFeature(feature: string): boolean {
        const supportedFeatures = [
            'media_messages',
            'interactive_messages',
            'location_sharing',
            'contact_sharing',
            'message_templates',
            'delivery_receipts',
            'read_receipts',
            'typing_indicators',
            'message_reactions',
            'quoted_replies'
        ];
        return supportedFeatures.includes(feature);
    }

    isActive(): boolean {
        return this.isInitialized && this.config !== null;
    }

    async getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        lastCheck: Date;
        details?: string;
    }> {
        if (!this.isInitialized) {
            return {
                status    : 'unhealthy',
                lastCheck : new Date(),
                details   : 'Adapter not initialized'
            };
        }

        try {
            // Perform health check by verifying account info
            await this.makeApiCall('GET', '');
            this.healthStatus = 'healthy';
            this.lastHealthCheck = new Date();

            return {
                status    : this.healthStatus,
                lastCheck : this.lastHealthCheck
            };

        } catch (error) {
            this.healthStatus = 'unhealthy';
            this.lastHealthCheck = new Date();

            return {
                status    : this.healthStatus,
                lastCheck : this.lastHealthCheck,
                details   : `Health check failed: ${error.message}`
            };
        }
    }

    async shutdown(): Promise<void> {
        this.isInitialized = false;
        this.config = null;
        this.healthStatus = 'unhealthy';
        logger.info(`WhatsApp adapter shut down`);
    }

    formatMessageContent(content: MessageContent): any {
        return this.transformer.formatOutgoingMessage('dummy_user', content);
    }

    parseIncomingMessage(rawMessage: any): CommonMessage {
        const transformed = this.transformer.parseIncomingMessage(rawMessage);
        const messageType = this.transformer.determineMessageType(transformed.content);

        const commonMessage: CommonMessage = {
            id             : crypto.randomUUID(),
            ConversationId : transformed.userId,
            UserId         : transformed.userId,
            Channel        : ChannelType.WhatsApp,
            MessageType    : messageType,
            Direction      : MessageDirection.Inbound,
            Content        : transformed.content,
            Metadata       : transformed.metadata,
            Timestamp      : transformed.timestamp,
            Status         : MessageStatus.Sent,
        };

        return commonMessage;
    }

    //#endregion

    //#region Private Methods

    private validateConfig(config: Record<string, any>): void {
        const required = ['accessToken', 'webhookVerifyToken', 'phoneNumberId'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`Missing required WhatsApp config field: ${field}`);
            }
        }
    }

    private async verifyConfiguration(): Promise<void> {
        try {
            const response = await this.makeApiCall('GET', '');
            if (!response.id) {
                throw new Error('Invalid API response during configuration verification');
            }
        } catch (error) {
            throw new Error(`Configuration verification failed: ${error.message}`);
        }
    }

    private ensureInitialized(): void {
        if (!this.isInitialized || !this.config) {
            throw new Error('WhatsApp adapter not initialized');
        }
    }

    private async makeApiCall(method: string, endpoint: string, data?: any): Promise<any> {
        const url = `${this.config?.baseUrl}/${this.config?.apiVersion}/${this.config?.phoneNumberId}/${endpoint}`;

        const options = {
            headers : {
                'Authorization' : `Bearer ${this.config?.accessToken}`,
                'Content-Type'  : 'application/json'
            }
        };

        let response: any = null;
        try {
            if (method === 'GET') {
                response = await needle('get', url, options);
            } else {
                response = await needle('post', url, data, options);
            }

            if (response.statusCode >= 400) {
                throw new Error(`API call failed: ${response.statusCode} - ${response.body?.error?.message || response.statusMessage}`);
            }

            return response.body;

        } catch (error) {
            logger.error(`WhatsApp API call failed, method: ${method}, endpoint: ${endpoint}, status: ${response?.statusCode}, error: ${error.message}`);
            throw error;
        }
    }

    private validateWebhookSignature(payload: any, headers: Record<string, string>): boolean {
        const signature = headers['x-hub-signature-256'];
        if (!signature) {
            return false;
        }

        const payloadBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const expectedSignature = crypto
            .createHmac('sha256', this.config?.webhookSecret || '')
            .update(payloadBody, 'utf8')
            .digest('hex');

        const expectedHeader = `sha256=${expectedSignature}`;
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedHeader)
        );
    }

    private isValidWebhookPayload(payload: WhatsAppWebhookPayload): boolean {
        return payload &&
               payload.object === 'whatsapp_business_account' &&
               Array.isArray(payload.entry) &&
               payload.entry.length > 0;
    }

    private extractMessagesFromWebhook(payload: WhatsAppWebhookPayload): any[] {
        const messages: any[] = [];

        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                if (change.field === 'messages' && change.value.messages) {
                    for (const message of change.value.messages) {
                        try {
                            const transformed = this.transformer.parseIncomingMessage(message);
                            messages.push({
                                ...transformed,
                                channelData : {
                                    phoneNumberId      : change.value.metadata.phone_number_id,
                                    displayPhoneNumber : change.value.metadata.display_phone_number
                                }
                            });
                        } catch (error) {
                            logger.warn(`Failed to transform WhatsApp message, messageId: ${message.id}, error: ${error.message}`);
                        }
                    }
                }

                // Handle status updates
                if (change.field === 'messages' && change.value.statuses) {
                    for (const status of change.value.statuses) {
                        messages.push({
                            type        : 'status_update',
                            messageId   : status.id,
                            status      : status.status,
                            timestamp   : new Date(parseInt(status.timestamp) * 1000),
                            recipientId : status.recipient_id,
                            errors      : status.errors
                        });
                    }
                }
            }
        }

        return messages;
    }

    //#endregion

}
