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
    SlackMessageTransformer,
    SlackMessage,
    SlackOutgoingMessage,
    SlackInteractivePayload
} from './transformers/slack.message.transformer';
import { logger } from '../../logger/logger';

export interface SlackConfig {
    botToken: string;
    signingSecret: string;
    appToken?: string;
    clientId?: string;
    clientSecret?: string;
    apiBaseUrl?: string;
    verificationToken?: string;
}

export interface SlackEventWrapper {
    token: string;
    team_id: string;
    api_app_id: string;
    event: SlackMessage;
    type: 'event_callback';
    event_id: string;
    event_time: number;
    authed_users?: string[];
    authed_teams?: string[];
    authorizations?: Array<{
        enterprise_id?: string;
        team_id: string;
        user_id: string;
        is_bot: boolean;
        is_enterprise_install?: boolean;
    }>;
    is_ext_shared_channel?: boolean;
    event_context?: string;
}

export interface SlackWebhookPayload {
    token?: string;
    challenge?: string;
    type?: string;
    team_id?: string;
    api_app_id?: string;
    event?: SlackMessage;
    event_id?: string;
    event_time?: number;
    authed_users?: string[];
    // Interactive components
    payload?: string; // JSON string for interactive components
    // Direct event (for testing)
    [key: string]: any;
}

export interface SlackApiResponse {
    ok: boolean;
    error?: string;
    warning?: string;
    response_metadata?: {
        next_cursor?: string;
        warnings?: string[];
    };
    [key: string]: any;
}

@injectable()
export class SlackAdapter implements IChannelAdapter {

    private config: SlackConfig | null = null;

    private transformer: SlackMessageTransformer;

    private isInitialized = false;

    private lastHealthCheck = new Date();

    private healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';

    private botInfo: any = null;

    constructor() {
        this.transformer = new SlackMessageTransformer();
    }

    //#region IChannelAdapter Implementation

    async initialize(config: Record<string, any>): Promise<void> {
        try {
            this.validateConfig(config);
            this.config = config as SlackConfig;

            // Set defaults
            this.config.apiBaseUrl = this.config.apiBaseUrl || 'https://slack.com/api';

            // Verify configuration by testing the bot token
            await this.verifyConfiguration();

            this.isInitialized = true;
            this.healthStatus = 'healthy';
            this.lastHealthCheck = new Date();

            logger.info(`Slack adapter initialized successfully: ${this.botInfo?.user_id} ${this.botInfo?.team_id} ${this.botInfo?.app_id}`);

        } catch (error) {
            this.healthStatus = 'unhealthy';
            logger.error(`Failed to initialize Slack adapter: ${error}`);
            throw new Error(`Slack adapter initialization failed: ${error}`);
        }
    }

    async sendMessage(
        channelUserId: string,
        content: MessageContent,
        metadata?: Record<string, any>
    ): Promise<DeliveryStatus> {
        this.ensureInitialized();

        try {
            const slackMessage = this.transformer.formatOutgoingMessage(
                channelUserId,
                content,
                metadata
            );

            const response = await this.makeApiCall('chat.postMessage', slackMessage);

            if (!response.ok) {
                throw new Error(`Slack API error: ${response.error}`);
            }

            return {
                messageId        : response.ts,
                status           : 'sent',
                timestamp        : new Date(),
                platformResponse : response
            };

        } catch (error) {
            logger.error('Failed to send Slack message', {
                channelUserId,
                error : error.message,
                content
            });

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
            // Validate webhook signature
            if (!this.validateWebhookSignature(payload, headers)) {
                logger.warn('Invalid Slack webhook signature');
                return { messages: [], isValid: false };
            }

            // Handle URL verification challenge
            if (payload.challenge) {
                logger.info('Slack webhook verification challenge received');
                return { messages: [{ challenge: payload.challenge }], isValid: true };
            }

            // Handle interactive components (buttons, etc.)
            if (payload.payload) {
                const interactivePayload = JSON.parse(payload.payload) as SlackInteractivePayload;
                const message = this.processInteractivePayload(interactivePayload);
                return { messages: [message], isValid: true };
            }

            // Handle regular events
            const messages = this.processEventPayload(payload);

            logger.info(`Processed Slack webhook: ${messages.length} ${payload.type} ${payload.event_id}`);

            return { messages, isValid: true };

        } catch (error) {
            logger.error(`Error processing Slack webhook: ${error.message}`);
            return { messages: [], isValid: false };
        }
    }

    async validateWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<boolean> {
        // Handle verification challenge
        if (payload.challenge && payload.type === 'url_verification') {
            return true;
        }

        // Validate webhook signature
        return this.validateWebhookSignature(payload, headers);
    }

    getChannelId(): string {
        return ChannelType.Slack;
    }

    getChannelName(): string {
        return 'Slack';
    }

    getSupportedMessageTypes(): string[] {
        return [
            'message',
            'file_share',
            'app_mention',
            'channel_join',
            'channel_leave',
            'channel_topic',
            'channel_purpose',
            'channel_name',
            'file_comment',
            'reaction_added',
            'reaction_removed'
        ];
    }

    supportsFeature(feature: string): boolean {
        const supportedFeatures = [
            'media_messages',
            'interactive_messages',
            'file_sharing',
            'threading',
            'reactions',
            'mentions',
            'rich_formatting',
            'blocks',
            'attachments',
            'slash_commands',
            'interactive_components',
            'app_home',
            'modals',
            'shortcuts'
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
            const response = await this.makeApiCall('auth.test');

            if (!response.ok) {
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
        this.botInfo = null;
        this.healthStatus = 'unhealthy';
        logger.info('Slack adapter shut down');
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
        const required = ['botToken', 'signingSecret'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`Missing required Slack config field: ${field}`);
            }
        }

        if (!config.botToken.startsWith('xoxb-')) {
            throw new Error('Invalid Slack bot token format');
        }
    }

    private async verifyConfiguration(): Promise<void> {
        try {
            const response = await this.makeApiCall('auth.test');

            if (!response.ok) {
                throw new Error(`Bot verification failed: ${response.error}`);
            }

            this.botInfo = response;

            if (!this.botInfo.user_id) {
                throw new Error('Invalid bot token - no user ID returned');
            }

        } catch (error) {
            throw new Error(`Configuration verification failed: ${error.message}`);
        }
    }

    private ensureInitialized(): void {
        if (!this.isInitialized || !this.config) {
            throw new Error('Slack adapter not initialized');
        }
    }

    private async makeApiCall(method: string, data?: any): Promise<SlackApiResponse> {
        const url = `${this.config?.apiBaseUrl}/${method}`;

        const options = {
            headers : {
                'Authorization' : `Bearer ${this.config?.botToken}`,
                'Content-Type'  : 'application/json; charset=utf-8'
            }
        };

        try {
            const response = await needle('post', url, data || {}, options);

            if (response.statusCode >= 400) {
                throw new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`);
            }

            return response.body;

        } catch (error) {
            logger.error(`Slack API call failed: ${method} ${error.message}`);
            throw error;
        }
    }

    private validateWebhookSignature(payload: any, headers: Record<string, string>): boolean {
        const signature = headers['x-slack-signature'];
        const timestamp = headers['x-slack-request-timestamp'];

        if (!signature || !timestamp) {
            logger.warn('Missing Slack signature headers');
            return false;
        }

        // Check if the timestamp is too old (more than 5 minutes)
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - parseInt(timestamp)) > 300) {
            logger.warn('Slack webhook timestamp too old');
            return false;
        }

        // Create the signature base string
        const payloadBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const sigBaseString = `v0:${timestamp}:${payloadBody}`;

        // Generate the expected signature
        const expectedSignature = 'v0=' + crypto
            .createHmac('sha256', this.config?.signingSecret)
            .update(sigBaseString, 'utf8')
            .digest('hex');

        // Compare signatures
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    private processEventPayload(payload: SlackWebhookPayload): any[] {
        const messages: any[] = [];

        // Skip bot messages and messages from our own bot
        if (payload.event?.bot_id === this.botInfo?.user_id ||
            payload.event?.user === this.botInfo?.user_id) {
            return messages;
        }

        // Skip certain subtypes that we don't want to process
        const skipSubtypes = ['bot_message', 'message_changed', 'message_deleted'];
        if (payload.event?.subtype && skipSubtypes.includes(payload.event.subtype)) {
            return messages;
        }

        if (payload.event && payload.type === 'event_callback') {
            try {
                const transformed = this.transformer.parseIncomingMessage(payload.event);
                messages.push({
                    ...transformed,
                    eventId     : payload.event_id,
                    eventTime   : payload.event_time,
                    teamId      : payload.team_id,
                    messageType : 'event'
                });
            } catch (error) {
                logger.warn(`Failed to transform Slack event: ${payload.event_id} ${error.message}`);
            }
        }

        return messages;
    }

    private processInteractivePayload(payload: SlackInteractivePayload): any {
        try {
            const transformed = this.transformer.parseIncomingMessage(payload);
            return {
                ...transformed,
                actionTs    : payload.action_ts,
                triggerId   : payload.trigger_id,
                responseUrl : payload.response_url,
                teamId      : payload.team.id,
                messageType : 'interactive'
            };
        } catch (error) {
            logger.warn(`Failed to transform Slack interactive payload: ${payload.action_ts} ${error.message}`);
            throw error;
        }
    }

    //#endregion

    //#region Slack-specific Methods

    /**
     * Update a message (edit)
     */
    async updateMessage(
        channel: string,
        messageTs: string,
        content: MessageContent,
        metadata?: Record<string, any>
    ): Promise<boolean> {
        try {
            const slackMessage = this.transformer.formatOutgoingMessage(
                channel,
                content,
                metadata
            );

            const response = await this.makeApiCall('chat.update', {
                ...slackMessage,
                ts : messageTs
            });

            return response.ok;
        } catch (error) {
            logger.error(`Failed to update Slack message: ${error.message} ${channel} ${messageTs}`);
            return false;
        }
    }

    /**
     * Delete a message
     */
    async deleteMessage(channel: string, messageTs: string): Promise<boolean> {
        try {
            const response = await this.makeApiCall('chat.delete', {
                channel,
                ts : messageTs
            });

            return response.ok;
        } catch (error) {
            logger.error(`Failed to delete Slack message: ${error.message} ${channel} ${messageTs}`);
            return false;
        }
    }

    /**
     * Add reaction to a message
     */
    async addReaction(channel: string, messageTs: string, emoji: string): Promise<boolean> {
        try {
            const response = await this.makeApiCall('reactions.add', {
                channel,
                timestamp : messageTs,
                name      : emoji
            });

            return response.ok;
        } catch (error) {
            logger.error(`Failed to add reaction: ${error.message} ${channel} ${messageTs} ${emoji}`);
            return false;
        }
    }

    /**
     * Remove reaction from a message
     */
    async removeReaction(channel: string, messageTs: string, emoji: string): Promise<boolean> {
        try {
            const response = await this.makeApiCall('reactions.remove', {
                channel,
                timestamp : messageTs,
                name      : emoji
            });

            return response.ok;
        } catch (error) {
            logger.error(`Failed to remove reaction: ${error.message} ${channel} ${messageTs} ${emoji}`);
            return false;
        }
    }

    /**
     * Get channel info
     */
    async getChannelInfo(channelId: string): Promise<any> {
        try {
            const response = await this.makeApiCall('conversations.info', {
                channel : channelId
            });

            return response.ok ? response.channel : null;
        } catch (error) {
            logger.error(`Failed to get channel info: ${error.message} ${channelId}`);
            return null;
        }
    }

    /**
     * Get user info
     */
    async getUserInfo(userId: string): Promise<any> {
        try {
            const response = await this.makeApiCall('users.info', {
                user : userId
            });

            return response.ok ? response.user : null;
        } catch (error) {
            logger.error(`Failed to get user info: ${error.message} ${userId}`);
            return null;
        }
    }

    /**
     * Send ephemeral message (only visible to specific user)
     */
    async sendEphemeralMessage(
        channel: string,
        userId: string,
        content: MessageContent
    ): Promise<boolean> {
        try {
            const slackMessage = this.transformer.formatOutgoingMessage(
                channel,
                content
            );

            const response = await this.makeApiCall('chat.postEphemeral', {
                ...slackMessage,
                user : userId
            });

            return response.ok;
        } catch (error) {
            logger.error(`Failed to send ephemeral message: ${error.message} ${channel} ${userId}`);
            return false;
        }
    }

    /**
     * Open a modal dialog
     */
    async openModal(triggerId: string, view: any): Promise<boolean> {
        try {
            const response = await this.makeApiCall('views.open', {
                trigger_id : triggerId,
                view
            });

            return response.ok;
        } catch (error) {
            logger.error(`Failed to open modal: ${error.message} ${triggerId}`);
            return false;
        }
    }

    //#endregion

}
