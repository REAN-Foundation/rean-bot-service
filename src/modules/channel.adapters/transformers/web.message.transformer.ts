import {
    MessageContent,
    MessageMetadata,
    TextMessageContent,
    MediaMessageContent} from '../../../domain.types/message.types';
import { BaseMessageTransformer, TransformedMessage } from './base.message.transformer';

export interface WebChatUser {
    id: string;
    sessionId: string;
    name?: string;
    email?: string;
    avatar?: string;
    ipAddress?: string;
    userAgent?: string;
    isOnline: boolean;
    lastSeen?: Date;
    metadata?: Record<string, any>;
}

export interface WebChatSession {
    sessionId: string;
    userId: string;
    startTime: Date;
    lastActivity: Date;
    isActive: boolean;
    channel: string;
    referrer?: string;
    pageUrl?: string;
    metadata?: Record<string, any>;
}

export interface WebChatMessage {
    id: string;
    sessionId: string;
    userId: string;
    timestamp: Date;
    type: 'text' | 'media' | 'location' | 'contact' | 'interactive' | 'typing' | 'system';
    content: MessageContent;
    metadata?: {
        messageId?: string;
        replyTo?: string;
        forwarded?: boolean;
        edited?: boolean;
        editedAt?: Date;
        delivered?: boolean;
        read?: boolean;
        readAt?: Date;
        userAgent?: string;
        ipAddress?: string;
        pageUrl?: string;
        referrer?: string;
        customData?: Record<string, any>;
    };
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WebChatOutgoingMessage {
    to: string; // sessionId or userId
    type: 'text' | 'media' | 'location' | 'contact' | 'interactive' | 'typing' | 'system';
    content: MessageContent;
    metadata?: {
        replyTo?: string;
        priority?: 'low' | 'normal' | 'high';
        persistent?: boolean;
        expiresAt?: Date;
        customData?: Record<string, any>;
    };
    options?: {
        requireDeliveryReceipt?: boolean;
        requireReadReceipt?: boolean;
        allowOfflineDelivery?: boolean;
        retryCount?: number;
    };
}

export interface WebChatEvent {
    type: 'message' | 'typing' | 'online' | 'offline' | 'join' | 'leave' | 'read' | 'delivered';
    sessionId: string;
    userId: string;
    timestamp: Date;
    data?: any;
}

export interface WebChatTypingIndicator {
    sessionId: string;
    userId: string;
    isTyping: boolean;
    timestamp: Date;
}

export interface WebChatDeliveryReceipt {
    messageId: string;
    sessionId: string;
    userId: string;
    status: 'delivered' | 'read';
    timestamp: Date;
}

export class WebMessageTransformer extends BaseMessageTransformer {

    getPlatformName(): string {
        return 'web';
    }

    //#region Incoming Message Parsing

    parseIncomingMessage(platformMessage: WebChatMessage | WebChatEvent): TransformedMessage {
        // Handle events (typing, presence, etc.)
        if ('type' in platformMessage && platformMessage.type !== 'message') {
            return this.parseWebChatEvent(platformMessage as WebChatEvent);
        }

        const message = platformMessage as WebChatMessage;

        if (!this.validateMessageStructure(message)) {
            throw new Error('Invalid Web Chat message structure');
        }

        const userId = this.extractUserId(message);
        const content = this.parseMessageContent(message);
        const metadata = this.createWebChatMetadata(message);
        const timestamp = message.timestamp;

        const transformed: TransformedMessage = {
            userId,
            content,
            metadata,
            timestamp,
            platformMessageId : message.id
        };

        if (!this.validateTransformedMessage(transformed)) {
            throw new Error('Failed to create valid transformed message');
        }

        return transformed;
    }

    private parseWebChatEvent(event: WebChatEvent): TransformedMessage {
        let content: MessageContent;

        switch (event.type) {
            case 'typing':
                content = this.createTextContent('User is typing...');
                break;
            case 'online':
                content = this.createTextContent('User came online');
                break;
            case 'offline':
                content = this.createTextContent('User went offline');
                break;
            case 'join':
                content = this.createTextContent('User joined the chat');
                break;
            case 'leave':
                content = this.createTextContent('User left the chat');
                break;
            case 'read':
                content = this.createTextContent('Message read');
                break;
            case 'delivered':
                content = this.createTextContent('Message delivered');
                break;
            default:
                content = this.createTextContent(`System event: ${event.type}`);
        }

        const metadata = this.createMetadata(event, {
            eventType : event.type,
            sessionId : event.sessionId,
            eventData : event.data
        });

        return {
            userId            : event.userId,
            content,
            metadata,
            timestamp         : event.timestamp,
            platformMessageId : `${event.type}-${event.timestamp.getTime()}`
        };
    }

    private parseMessageContent(message: WebChatMessage): MessageContent {
        // Since web chat uses our internal message structure, minimal transformation needed
        const content = message.content;

        // Validate and return content based on type
        if ('text' in content) {
            const textContent = content as TextMessageContent;
            return this.createTextContent(
                this.sanitizeText(textContent.text),
                textContent.formatting
            );
        }

        if ('mediaType' in content) {
            return this.createMediaContent(
                content.mediaType,
                content.url,
                content.caption,
                {
                    filename   : content.filename,
                    mimeType   : content.mimeType,
                    size       : content.size,
                    duration   : content.duration,
                    dimensions : content.dimensions
                }
            );
        }

        if ('latitude' in content) {
            return this.createLocationContent(
                content.latitude,
                content.longitude,
                content.name,
                content.address
            );
        }

        if ('name' in content && 'phone' in content) {
            return this.createContactContent([{
                name         : content.name,
                phone        : content.phone,
                email        : content.email,
                organization : content.organization,
                vcard        : content.vcard
            }]);
        }

        if ('type' in content && 'buttons' in content) {
            return this.createInteractiveContent(
                content.type,
                content.text,
                content.buttons,
                content.listItems,
                content.header
            );
        }

        // Fallback for unknown content
        return this.createTextContent('Unsupported message content');
    }

    //#endregion

    //#region Outgoing Message Formatting

    formatOutgoingMessage(
        userId: string,
        content: MessageContent,
        metadata?: MessageMetadata
    ): WebChatOutgoingMessage {
        const message: WebChatOutgoingMessage = {
            to       : userId,
            type     : this.getWebChatMessageType(content),
            content,
            metadata : {
                replyTo    : metadata?.CustomData?.replyTo,
                priority   : metadata?.Priority as any || 'normal',
                customData : metadata?.CustomData
            },
            options : {
                requireDeliveryReceipt : true,
                requireReadReceipt     : true,
                allowOfflineDelivery   : true,
                retryCount             : 3
            }
        };

        return message;
    }

    private getWebChatMessageType(content: MessageContent): 'text' | 'media' | 'location' | 'contact' | 'interactive' {
        if ('text' in content) return 'text';
        if ('mediaType' in content) return 'media';
        if ('latitude' in content) return 'location';
        if ('name' in content && 'phone' in content) return 'contact';
        if ('type' in content && 'buttons' in content) return 'interactive';
        return 'text'; // fallback
    }

    //#endregion

    //#region Validation and Utility Methods

    validateMessageStructure(platformMessage: any): boolean {
        if (!platformMessage || typeof platformMessage !== 'object') {
            return false;
        }

        // For WebChatMessage
        if (platformMessage.id && platformMessage.sessionId && platformMessage.userId && platformMessage.content) {
            return true;
        }

        // For WebChatEvent
        if (platformMessage.type && platformMessage.sessionId && platformMessage.userId && platformMessage.timestamp) {
            return true;
        }

        return false;
    }

    extractUserId(platformMessage: WebChatMessage | WebChatEvent): string {
        return platformMessage.userId;
    }

    private createWebChatMetadata(message: WebChatMessage): MessageMetadata {
        const metadata = this.createMetadata(message, {
            sessionId   : message.sessionId,
            messageType : message.type,
            status      : message.status,
            userAgent   : message.metadata?.userAgent,
            ipAddress   : message.metadata?.ipAddress,
            pageUrl     : message.metadata?.pageUrl,
            referrer    : message.metadata?.referrer
        });

        // Add web-specific metadata
        if (message.metadata?.replyTo) {
            metadata.CustomData!.replyTo = message.metadata.replyTo;
        }

        if (message.metadata?.edited) {
            metadata.EditedAt = message.metadata.editedAt || new Date();
        }

        if (message.metadata?.forwarded) {
            metadata.IsForwarded = true;
        }

        if (message.metadata?.delivered || message.metadata?.read) {
            metadata.DeliveryStatus = {
                delivered : message.metadata.delivered ? new Date() : undefined,
                read      : message.metadata.read ? (message.metadata.readAt || new Date()) : undefined
            };
        }

        return metadata;
    }

    //#endregion

    //#region Web Chat Specific Methods

    /**
     * Create typing indicator message
     */
    createTypingIndicator(userId: string, sessionId: string, isTyping: boolean): WebChatEvent {
        return {
            type      : 'typing',
            sessionId,
            userId,
            timestamp : new Date(),
            data      : { isTyping }
        };
    }

    /**
     * Create delivery receipt
     */
    createDeliveryReceipt(
        messageId: string,
        sessionId: string,
        userId: string,
        status: 'delivered' | 'read'
    ): WebChatDeliveryReceipt {
        return {
            messageId,
            sessionId,
            userId,
            status,
            timestamp : new Date()
        };
    }

    /**
     * Create presence event
     */
    createPresenceEvent(
        userId: string,
        sessionId: string,
        type: 'online' | 'offline'
    ): WebChatEvent {
        return {
            type,
            sessionId,
            userId,
            timestamp : new Date()
        };
    }

    /**
     * Parse file upload for media messages
     */
    parseFileUpload(fileData: any): MediaMessageContent {
        return this.createMediaContent(
            this.getMediaTypeFromFile(fileData),
            fileData.url || fileData.path,
            fileData.caption,
            {
                filename   : fileData.originalName || fileData.filename,
                mimeType   : fileData.mimetype || fileData.mimeType,
                size       : fileData.size,
                dimensions : fileData.dimensions
            }
        );
    }

    private getMediaTypeFromFile(fileData: any): 'image' | 'audio' | 'video' | 'document' {
        if (!fileData.mimetype) return 'document';

        if (fileData.mimetype.startsWith('image/')) return 'image';
        if (fileData.mimetype.startsWith('audio/')) return 'audio';
        if (fileData.mimetype.startsWith('video/')) return 'video';

        return 'document';
    }

    /**
     * Validate session data
     */
    validateSession(session: WebChatSession): boolean {
        return !!(session.sessionId &&
                 session.userId &&
                 session.startTime &&
                 session.channel);
    }

    /**
     * Create system message
     */
    createSystemMessage(
        sessionId: string,
        userId: string,
        message: string,
        data?: any
    ): WebChatMessage {
        return {
            id        : `system-${Date.now()}`,
            sessionId,
            userId,
            timestamp : new Date(),
            type      : 'system',
            content   : this.createTextContent(message),
            metadata  : {
                customData : data
            },
            status : 'sent'
        };
    }

    //#endregion

}
