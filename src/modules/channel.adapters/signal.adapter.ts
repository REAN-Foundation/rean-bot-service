import { injectable } from 'tsyringe';
import * as crypto from 'crypto';
import needle from 'needle';
import { IChannelAdapter } from '../interfaces/channel.adapter.interface';
import {
    MessageContent,
    DeliveryStatus,
    ChannelType
} from '../../domain.types/message.types';
import {
    SignalMessageTransformer,
    SignalMessage,
    SignalOutgoingMessage
} from './transformers/signal.message.transformer';
import { logger } from '../../logger/logger';

export interface SignalConfig {
    apiUrl: string;
    apiKey?: string;
    webhookSecret?: string;
    phoneNumber: string;
    deviceId?: string;
    trustStore?: string;
    trustStorePassword?: string;
    keyStore?: string;
    keyStorePassword?: string;
}

export interface SignalWebhookPayload {
    envelope: {
        source: string;
        sourceUuid?: string;
        sourceDevice: number;
        timestamp: number;
        dataMessage?: any;
        syncMessage?: any;
        callMessage?: any;
        receiptMessage?: any;
        typingMessage?: any;
        serverDeliveredTimestamp?: number;
        serverUuid?: string;
        destinationUuid?: string;
        urgent?: boolean;
        story?: boolean;
        updatedPni?: string;
    };
    account: string;
}

export interface SignalApiResponse {
    success: boolean;
    error?: string;
    data?: any;
    timestamp?: number;
}

@injectable()
export class SignalAdapter implements IChannelAdapter {

    private config: SignalConfig | null = null;

    private transformer: SignalMessageTransformer;

    private isInitialized = false;

    private lastHealthCheck = new Date();

    private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';

    constructor() {
        this.transformer = new SignalMessageTransformer();
    }

    //#region IChannelAdapter Implementation

    async initialize(config: Record<string, any>): Promise<void> {
        try {
            this.validateConfig(config);
            this.config = config as SignalConfig;

            // Set defaults
            this.config.deviceId = this.config.deviceId || '1';

            // Verify configuration by testing API connection
            await this.verifyConfiguration();

            this.isInitialized = true;
            this.healthStatus = 'healthy';
            this.lastHealthCheck = new Date();

            logger.info(`Signal adapter initialized successfully: ${this.config.phoneNumber} ${this.config.deviceId} ${this.config.apiUrl}`);

        } catch (error) {
            this.healthStatus = 'unhealthy';
            logger.error(`Failed to initialize Signal adapter: ${error}`);
            throw new Error(`Signal adapter initialization failed: ${error}`);
        }
    }

    async sendMessage(
        channelUserId: string,
        content: MessageContent,
        metadata?: Record<string, any>
    ): Promise<DeliveryStatus> {
        this.ensureInitialized();

        try {
            const signalMessage = this.transformer.formatOutgoingMessage(
                channelUserId,
                content,
                metadata
            );

            const response = await this.sendSignalMessage(channelUserId, signalMessage);

            if (!response.success) {
                throw new Error(`Signal API error: ${response.error}`);
            }

            return {
                messageId        : response.timestamp?.toString() || Date.now().toString(),
                status           : 'sent',
                timestamp        : new Date(),
                platformResponse : response
            };

        } catch (error) {
            logger.error(`Failed to send Signal message: ${channelUserId} ${error.message} ${content}`);

            return {
                messageId        : metadata?.messageId || '',
                status           : 'failed',
                timestamp        : new Date(),
                error            : error.message,
                platformResponse : error.response?.data
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
                logger.warn(`Invalid Signal webhook signature: ${payload} ${headers}`);
                return { messages: [], isValid: false };
            }

            const webhookPayload = payload as SignalWebhookPayload;

            // Validate payload structure
            if (!this.isValidSignalPayload(webhookPayload)) {
                logger.warn(`Invalid Signal webhook payload structure: ${webhookPayload}`);
                return { messages: [], isValid: false };
            }

            const messages = this.extractMessagesFromWebhook(webhookPayload);

            logger.info(`Processed Signal webhook: ${messages.length} ${webhookPayload.envelope.source} ${webhookPayload.envelope.timestamp}`);

            return { messages, isValid: true };

        } catch (error) {
            logger.error(`Error processing Signal webhook: ${error.message}`);
            return { messages: [], isValid: false };
        }
    }

    async validateWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<boolean> {
        // Validate webhook signature if secret is configured
        if (this.config?.webhookSecret) {
            return this.validateWebhookSignature(payload, headers);
        }

        // Basic payload validation
        return this.isValidSignalPayload(payload);
    }

    getChannelId(): string {
        return ChannelType.Signal;
    }

    getChannelName(): string {
        return 'Signal';
    }

    getSupportedMessageTypes(): string[] {
        return [
            'text',
            'image',
            'audio',
            'video',
            'document',
            'contact',
            'sticker',
            'reaction',
            'remote_delete',
            'group_update'
        ];
    }

    supportsFeature(feature: string): boolean {
        const supportedFeatures = [
            'media_messages',
            'contact_sharing',
            'message_reactions',
            'message_deletion',
            'message_editing',
            'disappearing_messages',
            'voice_messages',
            'stickers',
            'read_receipts',
            'typing_indicators',
            'message_quotes',
            'group_messaging',
            'end_to_end_encryption'
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
            // Perform health check by testing API connection
            const response = await this.makeApiCall('GET', '/v1/health');

            if (!response.success) {
                throw new Error(`API error: ${response.error}`);
            }

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
        logger.info('Signal adapter shut down');
    }

    formatMessageContent(content: MessageContent): any {
        return this.transformer.formatOutgoingMessage('', content);
    }

    parseIncomingMessage(rawMessage: any): {
        userId: string;
        content: MessageContent;
        metadata: Record<string, any>;
        timestamp: Date;
    } {
        const transformed = this.transformer.parseIncomingMessage(rawMessage);
        return {
            userId    : transformed.userId,
            content   : transformed.content,
            metadata  : transformed.metadata,
            timestamp : transformed.timestamp
        };
    }

    //#endregion

    //#region Private Methods

    private validateConfig(config: Record<string, any>): void {
        const required = ['apiUrl', 'phoneNumber'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`Missing required Signal config field: ${field}`);
            }
        }

        // Validate phone number format
        if (!config.phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
            throw new Error('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
        }
    }

    private async verifyConfiguration(): Promise<void> {
        try {
            const response = await this.makeApiCall('GET', '/v1/accounts');

            if (!response.success) {
                throw new Error(`Configuration verification failed: ${response.error}`);
            }

            // Check if our phone number is in the accounts list
            const accounts = response.data || [];
            const ourAccount = accounts.find((acc: any) => acc.number === this.config?.phoneNumber);

            if (!ourAccount) {
                throw new Error(`Phone number ${this.config?.phoneNumber} not found in Signal accounts`);
            }

        } catch (error) {
            throw new Error(`Configuration verification failed: ${error.message}`);
        }
    }

    private ensureInitialized(): void {
        if (!this.isInitialized || !this.config) {
            throw new Error('Signal adapter not initialized');
        }
    }

    private async makeApiCall(method: string, endpoint: string, data?: any): Promise<SignalApiResponse> {
        const url = `${this.config!.apiUrl}${endpoint}`;

        const options = {
            headers : {
                'Content-Type' : 'application/json'
            } as Record<string, string>
        };

        // Add API key if configured
        if (this.config?.apiKey) {
            options.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        try {
            let response;

            if (method.toUpperCase() === 'GET') {
                response = await needle('get', url, options);
            } else {
                response = await needle('post', url, data || {}, options);
            }

            if (response.statusCode >= 400) {
                throw new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`);
            }

            // Handle different response formats
            if (response.body && typeof response.body === 'object') {
                return {
                    success   : true,
                    data      : response.body,
                    timestamp : Date.now()
                };
            }

            return {
                success   : true,
                data      : response.body,
                timestamp : Date.now()
            };

        } catch (error) {
            logger.error(`Signal API call failed: ${method} ${endpoint} ${error.message}`);

            return {
                success : false,
                error   : error.message
            };
        }
    }

    private async sendSignalMessage(
        recipient: string,
        message: SignalOutgoingMessage
    ): Promise<SignalApiResponse> {
        // Extract recipient number from potentially composite ID
        const recipientNumber = recipient.includes(':') ? recipient.split(':')[1] : recipient;

        const payload = {
            number       : this.config!.phoneNumber,
            recipients   : [recipientNumber],
            message      : message.message,
            attachments  : message.attachments,
            quote        : message.quote,
            contacts     : message.contacts,
            sticker      : message.sticker,
            reaction     : message.reaction,
            remoteDelete : message.remoteDelete,
            mentions     : message.mentions,
            bodyRanges   : message.bodyRanges,
            preview      : message.preview,
            isViewOnce   : message.isViewOnce,
            expireTimer  : message.expireTimer
        };

        return this.makeApiCall('POST', '/v2/send', payload);
    }

    private validateWebhookSignature(payload: any, headers: Record<string, string>): boolean {
        const signature = headers['x-signal-signature'];
        if (!signature) {
            return false;
        }

        const payloadBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const expectedSignature = crypto
            .createHmac('sha256', this.config!.webhookSecret!)
            .update(payloadBody, 'utf8')
            .digest('hex');

        const expectedHeader = `sha256=${expectedSignature}`;
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedHeader)
        );
    }

    private isValidSignalPayload(payload: SignalWebhookPayload): boolean {
        return payload &&
               payload.envelope &&
               payload.envelope.source &&
               payload.envelope.timestamp &&
               payload.account;
    }

    private extractMessagesFromWebhook(payload: SignalWebhookPayload): any[] {
        const messages: any[] = [];
        const envelope = payload.envelope;

        try {
            // Create a Signal message from the envelope
            const signalMessage: SignalMessage = {
                timestamp    : envelope.timestamp,
                source       : envelope.source,
                sourceUuid   : envelope.sourceUuid,
                sourceDevice : envelope.sourceDevice,
                dataMessage  : envelope.dataMessage,
                isIncoming   : true
            };

            // Add message content from dataMessage if present
            if (envelope.dataMessage) {
                signalMessage.message = envelope.dataMessage.body;
                signalMessage.attachments = envelope.dataMessage.attachments;
                signalMessage.quote = envelope.dataMessage.quote;
                signalMessage.contact = envelope.dataMessage.contact;
                signalMessage.sticker = envelope.dataMessage.sticker;
                signalMessage.reaction = envelope.dataMessage.reaction;
                signalMessage.remoteDelete = envelope.dataMessage.delete;
                signalMessage.mentions = envelope.dataMessage.mentions;
                signalMessage.bodyRanges = envelope.dataMessage.bodyRanges;
                signalMessage.preview = envelope.dataMessage.preview;
                signalMessage.isViewOnce = envelope.dataMessage.isViewOnce;
                signalMessage.expireTimer = envelope.dataMessage.expireTimer;
            }

            const transformed = this.transformer.parseIncomingMessage(signalMessage);
            messages.push({
                ...transformed,
                account      : payload.account,
                sourceDevice : envelope.sourceDevice,
                messageType  : 'message'
            });

        } catch (error) {
            logger.warn(`Failed to transform Signal message: ${envelope.timestamp} ${envelope.source} ${error.message}`);
        }

        return messages;
    }

    //#endregion

    //#region Signal-specific Methods

    /**
     * Send a reaction to a message
     */
    async sendReaction(
        recipient: string,
        emoji: string,
        targetAuthor: string,
        targetTimestamp: number,
        remove = false
    ): Promise<boolean> {
        try {
            const payload = {
                number     : this.config!.phoneNumber,
                recipients : [recipient],
                reaction   : {
                    emoji,
                    remove,
                    targetAuthor,
                    targetSentTimestamp : targetTimestamp
                }
            };

            const response = await this.makeApiCall('POST', '/v2/send', payload);
            return response.success;

        } catch (error) {
            logger.error(`Failed to send Signal reaction: ${error.message} ${recipient} ${emoji}`);
            return false;
        }
    }

    /**
     * Delete a message remotely
     */
    async deleteMessage(recipient: string, targetTimestamp: number): Promise<boolean> {
        try {
            const payload = {
                number       : this.config!.phoneNumber,
                recipients   : [recipient],
                remoteDelete : {
                    targetSentTimestamp : targetTimestamp
                }
            };

            const response = await this.makeApiCall('POST', '/v2/send', payload);
            return response.success;

        } catch (error) {
            logger.error(`Failed to delete Signal message: ${error.message} ${recipient} ${targetTimestamp}`);
            return false;
        }
    }

    /**
     * Send typing indicator
     */
    async sendTypingIndicator(recipient: string, typing = true): Promise<boolean> {
        try {
            const payload = {
                number : this.config!.phoneNumber,
                recipient,
                typing
            };

            const response = await this.makeApiCall('POST', '/v1/typing', payload);
            return response.success;

        } catch (error) {
            logger.error(`Failed to send typing indicator: ${error.message} ${recipient}`);
            return false;
        }
    }

    /**
     * Get profile information
     */
    async getProfile(number: string): Promise<any> {
        try {
            const response = await this.makeApiCall('GET', `/v1/profiles/${number}`);
            return response.success ? response.data : null;

        } catch (error) {
            logger.error(`Failed to get Signal profile: ${error.message} ${number}`);
            return null;
        }
    }

    /**
     * Join a group
     */
    async joinGroup(groupId: string): Promise<boolean> {
        try {
            const payload = {
                number : this.config!.phoneNumber,
                groupId
            };

            const response = await this.makeApiCall('POST', '/v1/groups/join', payload);
            return response.success;

        } catch (error) {
            logger.error(`Failed to join Signal group: ${error.message} ${groupId}`);
            return false;
        }
    }

    /**
     * Leave a group
     */
    async leaveGroup(groupId: string): Promise<boolean> {
        try {
            const payload = {
                number : this.config!.phoneNumber,
                groupId
            };

            const response = await this.makeApiCall('POST', '/v1/groups/leave', payload);
            return response.success;

        } catch (error) {
            logger.error(`Failed to leave Signal group: ${error.message} ${groupId}`);
            return false;
        }
    }

    //#endregion

}
