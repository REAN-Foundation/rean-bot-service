import {
    MessageContent,
    TextMessageContent,
    MediaMessageContent,
    LocationMessageContent,
    ContactMessageContent,
    InteractiveMessageContent,
    MessageType,
    MessageMetadata,
    InteractiveMessageType
} from '../../../domain.types/message.types';

export interface PlatformMessage {
    id?: string;
    userId: string;
    timestamp: Date;
    platformSpecific: any;
}

export interface TransformedMessage {
    userId: string;
    content: MessageContent;
    metadata: MessageMetadata;
    timestamp: Date;
    platformMessageId?: string;
}

export abstract class BaseMessageTransformer {

    //#region Abstract Methods - Platform Specific

    /**
     * Parse platform-specific incoming message to our standard format
     */
    abstract parseIncomingMessage(platformMessage: any): TransformedMessage;

    /**
     * Format our standard message to platform-specific outgoing format
     */
    abstract formatOutgoingMessage(
        userId: string,
        content: MessageContent,
        metadata?: MessageMetadata
    ): any;

    /**
     * Validate platform-specific message structure
     */
    abstract validateMessageStructure(platformMessage: any): boolean;

    /**
     * Extract platform-specific user identifier
     */
    abstract extractUserId(platformMessage: any): string;

    /**
     * Get platform name
     */
    abstract getPlatformName(): string;

    //#endregion

    //#region Common Helper Methods

    /**
     * Determine message type from content
     */
    protected determineMessageType(content: any): MessageType {
        if (content.text) return MessageType.Text;
        if (content.mediaType) {
            switch (content.mediaType) {
                case 'image': return MessageType.Image;
                case 'audio': return MessageType.Audio;
                case 'video': return MessageType.Video;
                case 'document': return MessageType.Document;
                default: return MessageType.Document;
            }
        }
        if (content.latitude && content.longitude) return MessageType.Location;
        if (content.name && content.phone) return MessageType.Contact;
        if (content.type && content.buttons) return MessageType.Interactive;
        return MessageType.Text; // Default fallback
    }

    /**
     * Create text message content
     */
    protected createTextContent(text: string, formatting?: any): TextMessageContent {
        return {
            text,
            formatting: formatting ? this.parseTextFormatting(formatting) : undefined
        };
    }

    /**
     * Create media message content
     */
    protected createMediaContent(
        type: 'image' | 'audio' | 'video' | 'document',
        url: string,
        caption?: string,
        metadata?: any
    ): MediaMessageContent {
        return {
            mediaType: type,
            url,
            caption,
            filename: metadata?.filename,
            mimeType: metadata?.mimeType,
            size: metadata?.size,
            dimensions: metadata?.dimensions,
            duration: metadata?.duration
        };
    }

    /**
     * Create location message content
     */
    protected createLocationContent(
        latitude: number,
        longitude: number,
        name?: string,
        address?: string
    ): LocationMessageContent {
        return {
            latitude,
            longitude,
            name,
            address
        };
    }

    /**
     * Create contact message content
     */
    protected createContactContent(contacts: any[]): ContactMessageContent {
        const contact = contacts[0] || {};
        return {
            name: contact.name || '',
            phone: Array.isArray(contact.phones) ? contact.phones[0] : contact.phone,
            email: Array.isArray(contact.emails) ? contact.emails[0] : contact.email,
            organization: contact.organization,
            vcard: contact.vcard
        };
    }

    /**
     * Create interactive message content
     */
    protected createInteractiveContent(
        type: string,
        text?: string,
        buttons?: any[],
        listItems?: any[],
        header?: any
    ): InteractiveMessageContent {
        return {
            type: type as InteractiveMessageType,
            text,
            buttons: buttons?.map(btn => ({
                id: btn.id,
                title: btn.title || btn.text,
                type: 'reply' as const,
                payload: btn.payload || btn.id
            })),
            listItems: listItems?.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                payload: item.payload
            })),
            header: header ? {
                type: header.type,
                content: header.text || header.content
            } : undefined
        };
    }

    /**
     * Parse text formatting from platform-specific format
     */
    protected parseTextFormatting(formatting: any): any {
        // Common formatting parsing logic
        return {
            bold: formatting.bold || [],
            italic: formatting.italic || [],
            strikethrough: formatting.strikethrough || [],
            underline: formatting.underline || [],
            mentions: formatting.mentions || [],
            links: formatting.links || []
        };
    }

    /**
     * Create standardized metadata
     */
    protected createMetadata(
        platformMessage: any,
        additionalData?: Record<string, any>
    ): MessageMetadata {
        return {
            channelMessageId: platformMessage.id || platformMessage.message_id,
            forwardedFrom: platformMessage.forwarded_from,
            isForwarded: Boolean(platformMessage.forwarded_from),
            editedAt: platformMessage.edited ? this.extractTimestamp(platformMessage) : undefined,
            customData: {
                platform: this.getPlatformName(),
                timestamp: this.extractTimestamp(platformMessage),
                replyTo: platformMessage.reply_to,
                channelSpecific: platformMessage,
                ...additionalData
            }
        };
    }

    /**
     * Extract timestamp from platform message
     */
    protected extractTimestamp(platformMessage: any): Date {
        if (platformMessage.timestamp) {
            return new Date(platformMessage.timestamp * 1000);
        }
        if (platformMessage.date) {
            return new Date(platformMessage.date * 1000);
        }
        if (platformMessage.ts) {
            return new Date(parseFloat(platformMessage.ts) * 1000);
        }
        return new Date();
    }

    /**
     * Sanitize text content
     */
    protected sanitizeText(text: string): string {
        if (!text) return '';
        return text.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    }

    /**
     * Validate URL format
     */
    protected isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Extract file extension from URL or filename
     */
    protected extractFileExtension(urlOrFilename: string): string {
        const lastDot = urlOrFilename.lastIndexOf('.');
        if (lastDot === -1) return '';
        return urlOrFilename.substring(lastDot + 1).toLowerCase();
    }

    /**
     * Get MIME type from file extension
     */
    protected getMimeTypeFromExtension(extension: string): string {
        const mimeTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'avi': 'video/avi',
            'mov': 'video/quicktime',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        return mimeTypes[extension] || 'application/octet-stream';
    }

    //#endregion

    //#region Validation Methods

    /**
     * Validate transformed message structure
     */
    protected validateTransformedMessage(message: TransformedMessage): boolean {
        if (!message.userId || !message.content || !message.timestamp) {
            return false;
        }

        // Validate content based on type using type guards
        if ('text' in message.content) {
            return this.validateTextContent(message.content as TextMessageContent);
        }
        if ('mediaType' in message.content) {
            return this.validateMediaContent(message.content as MediaMessageContent);
        }
        if ('latitude' in message.content) {
            return this.validateLocationContent(message.content as LocationMessageContent);
        }

        return true;
    }

    /**
     * Validate text content
     */
    protected validateTextContent(content: TextMessageContent): boolean {
        return content.text !== undefined && content.text.length > 0;
    }

        /**
     * Validate media content
     */
    protected validateMediaContent(content: MediaMessageContent): boolean {
        return content.mediaType !== undefined &&
               content.url !== undefined &&
               this.isValidUrl(content.url);
    }

    /**
     * Validate location content
     */
    protected validateLocationContent(content: LocationMessageContent): boolean {
        return content.latitude !== undefined &&
               content.longitude !== undefined &&
               content.latitude >= -90 && content.latitude <= 90 &&
               content.longitude >= -180 && content.longitude <= 180;
    }

    //#endregion

}
