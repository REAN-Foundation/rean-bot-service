import {
    MessageContent,
    DeliveryStatus,
    ChannelType
} from '../../domain.types/message.types';

export interface IChannelAdapter {

    //#region Core Operations

    /**
     * Initialize the channel adapter with configuration
     */
    initialize(config: Record<string, any>): Promise<void>;

    /**
     * Send a message through the channel
     */
    sendMessage(
        channelUserId: string,
        content: MessageContent,
        metadata?: Record<string, any>
    ): Promise<DeliveryStatus>;

    /**
     * Process incoming webhook from the channel
     */
    processIncomingWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<{ messages: any[]; isValid: boolean }>;

    /**
     * Validate webhook signature/authenticity
     */
    validateWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<boolean>;

    //#endregion

    //#region Channel Information

    /**
     * Get channel identifier
     */
    getChannelId(): string;

    /**
     * Get channel name
     */
    getChannelName(): string;

    /**
     * Get supported message types
     */
    getSupportedMessageTypes(): string[];

    /**
     * Check if channel supports specific feature
     */
    supportsFeature(feature: string): boolean;

    //#endregion

    //#region Status Management

    /**
     * Check if channel is active and ready
     */
    isActive(): boolean;

    /**
     * Get channel health status
     */
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        lastCheck: Date;
        details?: string;
    }>;

    /**
     * Gracefully shutdown the channel adapter
     */
    shutdown(): Promise<void>;

    //#endregion

    //#region Message Formatting

    /**
     * Format message content for the specific channel
     */
    formatMessageContent(content: MessageContent): any;

    /**
     * Parse incoming message to standard format
     */
    parseIncomingMessage(rawMessage: any): {
        userId: string;
        content: MessageContent;
        metadata: Record<string, any>;
        timestamp: Date;
    };

    //#endregion

}
