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
    InteractiveMessageContent,
    InteractiveMessageType
} from '../../domain.types/message.types';
import { logger } from '../../logger/logger';

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
    return 'Text' in content;
}

export function isMediaMessage(content: MessageContent): content is MediaMessageContent {
    return 'MediaType' in content;
}

export function isLocationMessage(content: MessageContent): content is LocationMessageContent {
    return 'Latitude' in content;
}

export function isContactMessage(content: MessageContent): content is ContactMessageContent {
    return 'Name' in content && 'Phone' in content;
}

export function isInteractiveMessage(content: MessageContent): content is InteractiveMessageContent {
    return 'Type' in content && 'Buttons' in content;
}

// Helper function to safely access metadata fields
export function getMetadataField(metadata: MessageMetadata, field: string): any {
    return metadata.CustomData?.[field];
}

export function setMetadataField(metadata: MessageMetadata, field: string, value: any): void {
    if (!metadata.CustomData) {
        metadata.CustomData = {};
    }
    metadata.CustomData[field] = value;
}

// Logger wrapper that accepts multiple arguments
export function safeLog(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
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
                Text       : data.text || '',
                Formatting : data.formatting
            } as TextMessageContent;

        case 'media':
            return {
                MediaType  : data.mediaType || 'document',
                Url        : data.url || '',
                Caption    : data.caption,
                Filename   : data.filename,
                MimeType   : data.mimeType,
                Size       : data.size,
                Duration   : data.duration,
                Dimensions : data.dimensions
            } as MediaMessageContent;

        case 'location':
            return {
                Latitude  : data.latitude || 0,
                Longitude : data.longitude || 0,
                Name      : data.name,
                Address   : data.address,
                Url       : data.url
            } as LocationMessageContent;

        case 'contact':
            return {
                Name         : data.name || '',
                Phone        : data.phone,
                Email        : data.email,
                Organization : data.organization,
                Vcard        : data.vcard
            } as ContactMessageContent;

        case 'interactive':
            return {
                Type      : data.type || InteractiveMessageType.Button,
                Text      : data.text,
                Buttons   : data.buttons || [],
                ListItems : data.listItems || [],
                Header    : data.header,
                Footer    : data.footer
            } as InteractiveMessageContent;

        default:
            return {
                Text       : 'Unknown message type',
                Formatting : undefined
            } as TextMessageContent;
    }
}

// Create standardized metadata
export function createStandardMetadata(platformData: any, platform: string): MessageMetadata {
    return {
        ChannelMessageId : platformData.id || platformData.message_id,
        ForwardedFrom    : platformData.forwarded_from,
        IsForwarded      : Boolean(platformData.forwarded_from),
        EditedAt         : platformData.edited ? new Date() : undefined,
        CustomData       : {
            platform,
            platformData,
            replyTo   : platformData.reply_to,
            timestamp : platformData.timestamp || Date.now()
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
        recipient : recipientId,
        timestamp : Date.now()
    };

    if (isTextMessage(content)) {
        return {
            ...baseMessage,
            type : 'text',
            text : content.Text
        };
    }

    if (isMediaMessage(content)) {
        return {
            ...baseMessage,
            type     : content.MediaType,
            url      : content.Url,
            caption  : content.Caption,
            filename : content.Filename
        };
    }

    if (isLocationMessage(content)) {
        return {
            ...baseMessage,
            type      : 'location',
            latitude  : content.Latitude,
            longitude : content.Longitude,
            name      : content.Name,
            address   : content.Address
        };
    }

    if (isContactMessage(content)) {
        return {
            ...baseMessage,
            type         : 'contact',
            name         : content.Name,
            phone        : content.Phone,
            email        : content.Email,
            organization : content.Organization
        };
    }

    if (isInteractiveMessage(content)) {
        return {
            ...baseMessage,
            type            : 'interactive',
            interactiveType : content.Type,
            text            : content.Text,
            buttons         : content.Buttons,
            listItems       : content.ListItems
        };
    }

    // Fallback
    return {
        ...baseMessage,
        type : 'text',
        text : 'Unsupported message type'
    };
}
