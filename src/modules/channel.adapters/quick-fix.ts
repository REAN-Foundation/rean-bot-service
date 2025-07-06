// Quick fix for Channel Adapters compilation errors
// This provides the corrected types and interfaces

import {
    MessageContent,
    ChannelType,
    MessageMetadata,
    TextMessageContent,
    MediaMessageContent,
    LocationMessageContent,
    ContactMessageContent,
    InteractiveMessageContent
} from '../../domain.types/message.types';

// Corrected DeliveryStatus for adapters
export interface AdapterDeliveryStatus {
    messageId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: Date;
    error?: string;
    platformResponse?: any;
}

// Type guards for MessageContent
export function isTextMessage(content: MessageContent): content is TextMessageContent {
    return 'text' in content;
}

export function isMediaMessage(content: MessageContent): content is MediaMessageContent {
    return 'mediaType' in content;
}

export function isLocationMessage(content: MessageContent): content is LocationMessageContent {
    return 'latitude' in content;
}

export function isContactMessage(content: MessageContent): content is ContactMessageContent {
    return 'name' in content && 'phone' in content;
}

export function isInteractiveMessage(content: MessageContent): content is InteractiveMessageContent {
    return 'type' in content && 'buttons' in content;
}

// Helper function to safely access metadata fields
export function getMetadataField(metadata: MessageMetadata, field: string): any {
    return metadata.customData?.[field];
}

export function setMetadataField(metadata: MessageMetadata, field: string, value: any): void {
    if (!metadata.customData) {
        metadata.customData = {};
    }
    metadata.customData[field] = value;
}

// Logger wrapper that accepts multiple arguments
export function safeLog(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const { logger } = require('../../logger/logger');
    if (data) {
        logger[level](`${message} - ${JSON.stringify(data)}`);
    } else {
        logger[level](message);
    }
}

// Create a unified message content from platform-specific data
export function createUnifiedContent(
    type: 'text' | 'media' | 'location' | 'contact' | 'interactive',
    data: any
): MessageContent {
    switch (type) {
        case 'text':
            return {
                text: data.text || '',
                formatting: data.formatting
            } as TextMessageContent;

        case 'media':
            return {
                mediaType: data.mediaType || 'document',
                url: data.url || '',
                caption: data.caption,
                filename: data.filename,
                mimeType: data.mimeType,
                size: data.size,
                duration: data.duration,
                dimensions: data.dimensions
            } as MediaMessageContent;

        case 'location':
            return {
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                name: data.name,
                address: data.address,
                url: data.url
            } as LocationMessageContent;

        case 'contact':
            return {
                name: data.name || '',
                phone: data.phone,
                email: data.email,
                organization: data.organization,
                vcard: data.vcard
            } as ContactMessageContent;

        case 'interactive':
            return {
                type: data.type || 'button',
                text: data.text,
                buttons: data.buttons || [],
                listItems: data.listItems || [],
                header: data.header,
                footer: data.footer
            } as InteractiveMessageContent;

        default:
            return {
                text: 'Unknown message type',
                formatting: undefined
            } as TextMessageContent;
    }
}

// Create standardized metadata
export function createStandardMetadata(platformData: any, platform: string): MessageMetadata {
    return {
        channelMessageId: platformData.id || platformData.message_id,
        forwardedFrom: platformData.forwarded_from,
        isForwarded: Boolean(platformData.forwarded_from),
        editedAt: platformData.edited ? new Date() : undefined,
        customData: {
            platform,
            platformData,
            replyTo: platformData.reply_to,
            timestamp: platformData.timestamp || Date.now()
        }
    };
}

// Format outgoing message for platform
export function formatMessageForPlatform(
    content: MessageContent,
    platform: ChannelType,
    recipientId: string
): any {
    const baseMessage = {
        recipient: recipientId,
        timestamp: Date.now()
    };

    if (isTextMessage(content)) {
        return {
            ...baseMessage,
            type: 'text',
            text: content.text
        };
    }

    if (isMediaMessage(content)) {
        return {
            ...baseMessage,
            type: content.mediaType,
            url: content.url,
            caption: content.caption,
            filename: content.filename
        };
    }

    if (isLocationMessage(content)) {
        return {
            ...baseMessage,
            type: 'location',
            latitude: content.latitude,
            longitude: content.longitude,
            name: content.name,
            address: content.address
        };
    }

    if (isContactMessage(content)) {
        return {
            ...baseMessage,
            type: 'contact',
            name: content.name,
            phone: content.phone,
            email: content.email,
            organization: content.organization
        };
    }

    if (isInteractiveMessage(content)) {
        return {
            ...baseMessage,
            type: 'interactive',
            interactiveType: content.type,
            text: content.text,
            buttons: content.buttons,
            listItems: content.listItems
        };
    }

    // Fallback
    return {
        ...baseMessage,
        type: 'text',
        text: 'Unsupported message type'
    };
}

export default {
    AdapterDeliveryStatus,
    isTextMessage,
    isMediaMessage,
    isLocationMessage,
    isContactMessage,
    isInteractiveMessage,
    getMetadataField,
    setMetadataField,
    safeLog,
    createUnifiedContent,
    createStandardMetadata,
    formatMessageForPlatform
};
