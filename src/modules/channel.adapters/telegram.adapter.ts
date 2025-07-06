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
    TelegramMessageTransformer,
    TelegramMessage,
    TelegramOutgoingMessage,
    TelegramCallbackQuery
} from './transformers/telegram.message.transformer';
import { logger } from '../../logger/logger';

export interface TelegramConfig {
    botToken: string;
    webhookSecret?: string;
    apiBaseUrl?: string;
    allowedUpdates?: string[];
    maxConnections?: number;
}

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    edited_message?: TelegramMessage;
    channel_post?: TelegramMessage;
    edited_channel_post?: TelegramMessage;
    inline_query?: any;
    chosen_inline_result?: any;
    callback_query?: TelegramCallbackQuery;
    shipping_query?: any;
    pre_checkout_query?: any;
    poll?: any;
    poll_answer?: any;
    my_chat_member?: any;
    chat_member?: any;
    chat_join_request?: any;
}

export interface TelegramWebhookPayload {
    updates?: TelegramUpdate[];
    // Single update format
    update_id?: number;
    message?: TelegramMessage;
    edited_message?: TelegramMessage;
    callback_query?: TelegramCallbackQuery;
    [key: string]: any;
}

export interface TelegramApiResponse {
    ok: boolean;
    result?: any;
    error_code?: number;
    description?: string;
}

@injectable()
export class TelegramAdapter implements IChannelAdapter {

    private config: TelegramConfig | null = null;
    private transformer: TelegramMessageTransformer;
    private isInitialized = false;
    private lastHealthCheck = new Date();
    private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';
    private botInfo: any = null;

    constructor() {
        this.transformer = new TelegramMessageTransformer();
    }

    //#region IChannelAdapter Implementation

    async initialize(config: Record<string, any>): Promise<void> {
        try {
            this.validateConfig(config);
            this.config = config as TelegramConfig;

            // Set defaults
            this.config.apiBaseUrl = this.config.apiBaseUrl || 'https://api.telegram.org';
            this.config.allowedUpdates = this.config.allowedUpdates || [
                'message', 'edited_message', 'callback_query'
            ];

            // Verify bot token by getting bot info
            await this.verifyConfiguration();

            this.isInitialized = true;
            this.healthStatus = 'healthy';
            this.lastHealthCheck = new Date();

            logger.info('Telegram adapter initialized successfully', {
                botUsername: this.botInfo?.username,
                botId: this.botInfo?.id
            });

        } catch (error) {
            this.healthStatus = 'unhealthy';
            logger.error('Failed to initialize Telegram adapter', { error });
            throw new Error(`Telegram adapter initialization failed: ${error}`);
        }
    }

    async sendMessage(
        channelUserId: string,
        content: MessageContent,
        metadata?: Record<string, any>
    ): Promise<DeliveryStatus> {
        this.ensureInitialized();

        try {
            const telegramMessage = this.transformer.formatOutgoingMessage(
                channelUserId,
                content,
                metadata
            );

            let response: TelegramApiResponse;

            // Handle different message types
            if (Array.isArray(telegramMessage)) {
                // Multiple messages (e.g., media group)
                const responses = [];
                for (const msg of telegramMessage) {
                    responses.push(await this.sendSingleMessage(msg));
                }
                response = responses[responses.length - 1]; // Return last response
            } else {
                response = await this.sendSingleMessage(telegramMessage);
            }

            if (!response.ok) {
                throw new Error(`Telegram API error: ${response.description}`);
            }

            return {
                messageId: response.result.message_id.toString(),
                status: 'sent',
                timestamp: new Date(),
                platformResponse: response.result
            };

        } catch (error) {
            logger.error('Failed to send Telegram message', {
                channelUserId,
                error: error.message,
                content
            });

            return {
                messageId: metadata?.messageId || '',
                status: 'failed',
                timestamp: new Date(),
                error: error.message,
                platformResponse: error.response?.data
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
                logger.warn('Invalid Telegram webhook signature');
                return { messages: [], isValid: false };
            }

            // Handle both single update and batch update formats
            const updates = this.extractUpdates(payload);

            if (updates.length === 0) {
                logger.warn('No valid updates found in Telegram webhook');
                return { messages: [], isValid: false };
            }

            const messages = this.processUpdates(updates);

            logger.info('Processed Telegram webhook', {
                messagesCount: messages.length,
                updatesCount: updates.length
            });

            return { messages, isValid: true };

        } catch (error) {
            logger.error('Error processing Telegram webhook', { error: error.message });
            return { messages: [], isValid: false };
        }
    }

    async validateWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<boolean> {
        // Telegram doesn't have a verification challenge like WhatsApp
        // Just validate the webhook signature if secret is configured
        if (this.config?.webhookSecret) {
            return this.validateWebhookSignature(payload, headers);
        }

        // Basic payload validation
        return this.isValidTelegramPayload(payload);
    }

    getChannelId(): string {
        return ChannelType.Telegram;
    }

    getChannelName(): string {
        return 'Telegram';
    }

    getSupportedMessageTypes(): string[] {
        return [
            'text',
            'photo',
            'audio',
            'voice',
            'video',
            'video_note',
            'document',
            'location',
            'contact',
            'sticker',
            'animation',
            'poll',
            'inline_keyboard'
        ];
    }

    supportsFeature(feature: string): boolean {
        const supportedFeatures = [
            'media_messages',
            'interactive_messages',
            'location_sharing',
            'contact_sharing',
            'inline_keyboards',
            'callback_queries',
            'file_uploads',
            'message_formatting',
            'message_editing',
            'message_deletion',
            'typing_indicators',
            'file_downloads',
            'group_management',
            'channel_management'
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
                status: 'unhealthy',
                lastCheck: new Date(),
                details: 'Adapter not initialized'
            };
        }

        try {
            // Perform health check by getting bot info
            const response = await this.makeApiCall('getMe');

            if (!response.ok) {
                throw new Error(`API error: ${response.description}`);
            }

            this.healthStatus = 'healthy';
            this.lastHealthCheck = new Date();

            return {
                status: this.healthStatus,
                lastCheck: this.lastHealthCheck
            };

        } catch (error) {
            this.healthStatus = 'unhealthy';
            this.lastHealthCheck = new Date();

            return {
                status: this.healthStatus,
                lastCheck: this.lastHealthCheck,
                details: `Health check failed: ${error.message}`
            };
        }
    }

    async shutdown(): Promise<void> {
        this.isInitialized = false;
        this.config = null;
        this.botInfo = null;
        this.healthStatus = 'unhealthy';
        logger.info('Telegram adapter shut down');
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
            userId: transformed.userId,
            content: transformed.content,
            metadata: transformed.metadata,
            timestamp: transformed.timestamp
        };
    }

    //#endregion

    //#region Private Methods

    private validateConfig(config: Record<string, any>): void {
        if (!config.botToken) {
            throw new Error('Missing required Telegram config field: botToken');
        }

        if (!config.botToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
            throw new Error('Invalid Telegram bot token format');
        }
    }

    private async verifyConfiguration(): Promise<void> {
        try {
            const response = await this.makeApiCall('getMe');

            if (!response.ok) {
                throw new Error(`Bot verification failed: ${response.description}`);
            }

            this.botInfo = response.result;

            if (!this.botInfo.is_bot) {
                throw new Error('Token does not belong to a bot');
            }

        } catch (error) {
            throw new Error(`Configuration verification failed: ${error.message}`);
        }
    }

    private ensureInitialized(): void {
        if (!this.isInitialized || !this.config) {
            throw new Error('Telegram adapter not initialized');
        }
    }

    private async makeApiCall(method: string, data?: any): Promise<TelegramApiResponse> {
        const url = `${this.config!.apiBaseUrl}/bot${this.config!.botToken}/${method}`;

        const options = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await needle('post', url, data || {}, options);

            if (response.statusCode >= 400) {
                throw new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`);
            }

            return response.body;

        } catch (error) {
            logger.error('Telegram API call failed', {
                method,
                error: error.message
            });
            throw error;
        }
    }

    private async sendSingleMessage(message: TelegramOutgoingMessage): Promise<TelegramApiResponse> {
        // Determine the appropriate API method based on message content
        let method = 'sendMessage';
        let data = { ...message };

        if (message.photo) {
            method = 'sendPhoto';
        } else if (message.audio) {
            method = 'sendAudio';
        } else if (message.video) {
            method = 'sendVideo';
        } else if (message.voice) {
            method = 'sendVoice';
        } else if (message.document) {
            method = 'sendDocument';
        } else if (message.latitude !== undefined) {
            method = 'sendLocation';
        } else if (message.phone_number) {
            method = 'sendContact';
        }

        return this.makeApiCall(method, data);
    }

    private validateWebhookSignature(payload: any, headers: Record<string, string>): boolean {
        const signature = headers['x-telegram-bot-api-secret-token'];
        if (!signature || signature !== this.config?.webhookSecret) {
            return false;
        }
        return true;
    }

    private isValidTelegramPayload(payload: any): boolean {
        // Check if it's a valid Telegram update structure
        if (!payload || typeof payload !== 'object') {
            return false;
        }

        // Single update format
        if (payload.update_id !== undefined) {
            return true;
        }

        // Batch updates format
        if (Array.isArray(payload.updates)) {
            return payload.updates.every((update: any) => update.update_id !== undefined);
        }

        return false;
    }

    private extractUpdates(payload: TelegramWebhookPayload): TelegramUpdate[] {
        const updates: TelegramUpdate[] = [];

        // Handle batch updates
        if (payload.updates && Array.isArray(payload.updates)) {
            updates.push(...payload.updates);
        }
        // Handle single update
        else if (payload.update_id !== undefined) {
            updates.push(payload as TelegramUpdate);
        }

        return updates.filter(update => this.isValidUpdate(update));
    }

    private isValidUpdate(update: TelegramUpdate): boolean {
        return update.update_id !== undefined && (
            update.message ||
            update.edited_message ||
            update.callback_query ||
            update.channel_post ||
            update.edited_channel_post
        );
    }

    private processUpdates(updates: TelegramUpdate[]): any[] {
        const messages: any[] = [];

        for (const update of updates) {
            try {
                // Handle regular messages
                if (update.message) {
                    const transformed = this.transformer.parseIncomingMessage(update.message);
                    messages.push({
                        ...transformed,
                        updateId: update.update_id,
                        messageType: 'message'
                    });
                }

                // Handle edited messages
                if (update.edited_message) {
                    const transformed = this.transformer.parseIncomingMessage(update.edited_message);
                    messages.push({
                        ...transformed,
                        updateId: update.update_id,
                        messageType: 'edited_message'
                    });
                }

                // Handle callback queries (button presses)
                if (update.callback_query) {
                    const transformed = this.transformer.parseIncomingMessage(update.callback_query);
                    messages.push({
                        ...transformed,
                        updateId: update.update_id,
                        messageType: 'callback_query',
                        callbackQueryId: update.callback_query.id
                    });
                }

                // Handle channel posts
                if (update.channel_post) {
                    const transformed = this.transformer.parseIncomingMessage(update.channel_post);
                    messages.push({
                        ...transformed,
                        updateId: update.update_id,
                        messageType: 'channel_post'
                    });
                }

                // Handle edited channel posts
                if (update.edited_channel_post) {
                    const transformed = this.transformer.parseIncomingMessage(update.edited_channel_post);
                    messages.push({
                        ...transformed,
                        updateId: update.update_id,
                        messageType: 'edited_channel_post'
                    });
                }

            } catch (error) {
                logger.warn('Failed to transform Telegram update', {
                    updateId: update.update_id,
                    error: error.message
                });
            }
        }

        return messages;
    }

    //#endregion

    //#region Telegram-specific Methods

    /**
     * Answer callback query (for button interactions)
     */
    async answerCallbackQuery(
        callbackQueryId: string,
        text?: string,
        showAlert = false
    ): Promise<boolean> {
        try {
            const response = await this.makeApiCall('answerCallbackQuery', {
                callback_query_id: callbackQueryId,
                text,
                show_alert: showAlert
            });

            return response.ok;
        } catch (error) {
            logger.error('Failed to answer callback query', { error, callbackQueryId });
            return false;
        }
    }

    /**
     * Set typing action
     */
    async sendChatAction(chatId: string, action: string): Promise<boolean> {
        try {
            const response = await this.makeApiCall('sendChatAction', {
                chat_id: chatId,
                action
            });

            return response.ok;
        } catch (error) {
            logger.error('Failed to send chat action', { error, chatId, action });
            return false;
        }
    }

    /**
     * Get file URL for download
     */
    async getFileUrl(fileId: string): Promise<string | null> {
        try {
            const response = await this.makeApiCall('getFile', { file_id: fileId });

            if (response.ok && response.result.file_path) {
                return `${this.config!.apiBaseUrl}/file/bot${this.config!.botToken}/${response.result.file_path}`;
            }

            return null;
        } catch (error) {
            logger.error('Failed to get file URL', { error, fileId });
            return null;
        }
    }

    //#endregion

}
