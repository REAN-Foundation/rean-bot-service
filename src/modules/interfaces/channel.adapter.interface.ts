import {
    MessageContent,
    DeliveryStatus,
    ChannelType,
    CommonMessage
} from '../../domain.types/message.types';

///////////////////////////////////////////////////////////////////////////////

export interface IChannelAdapter {

    //#region Core Operations

    initialize(config: Record<string, any>): Promise<void>;

    sendMessage(
        channelUserId: string,
        content: MessageContent,
        metadata?: Record<string, any>
    ): Promise<DeliveryStatus>;

    processIncomingWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<{ messages: any[]; isValid: boolean }>;

    validateWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<boolean>;

    //#endregion

    //#region Channel Information

    getChannelId(): string;

    getChannelName(): string;

    getSupportedMessageTypes(): string[];

    supportsFeature(feature: string): boolean;

    //#endregion

    //#region Status Management

    isActive(): boolean;

    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        lastCheck: Date;
        details?: string;
    }>;

    shutdown(): Promise<void>;

    //#endregion

    //#region Message Formatting

    formatMessageContent(content: MessageContent): any;

    parseIncomingMessage(rawMessage: any): CommonMessage;

    //#endregion

}
