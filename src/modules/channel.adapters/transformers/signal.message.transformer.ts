import {
    MessageContent,
    MessageMetadata,
    isTextMessageContent,
    isMediaMessageContent,
    isLocationMessageContent,
    isContactMessageContent,
    isInteractiveMessageContent,
    MediaMessageContent,
    ChannelType
} from '../../../domain.types/message.types';
import { BaseMessageTransformer, TransformedMessage } from './base.message.transformer';

////////////////////////////////////////////////////////////

export interface SignalContact {
    name?: string;
    number: string;
    uuid?: string;
    profileName?: string;
    profileAvatar?: string;
    profileKeyCredential?: string;
}

export interface SignalGroup {
    groupId: string;
    name?: string;
    members: SignalContact[];
    avatar?: string;
    description?: string;
    announcements?: boolean;
    admins?: string[];
    requestingMembers?: string[];
    pendingMembers?: string[];
}

export interface SignalAttachment {
    id: string;
    contentType: string;
    filename?: string;
    size?: number;
    width?: number;
    height?: number;
    caption?: string;
    blurhash?: string;
    uploadTimestamp?: number;
    cdnId?: string;
    cdnKey?: string;
    digest?: string;
    plaintextHash?: string;
    voiceNote?: boolean;
    borderless?: boolean;
    gif?: boolean;
    pending?: boolean;
    wasDownloaded?: boolean;
    path?: string;
    url?: string;
}

export interface SignalMessage {
    timestamp: number;
    source: string;
    sourceUuid?: string;
    sourceDevice?: number;
    sourceName?: string;
    message?: string;
    attachments?: SignalAttachment[];
    group?: {
        groupId: string;
        type: string;
    };
    groupV2?: {
        groupId: string;
        masterKey: string;
        revision: number;
        groupChange?: string;
    };
    sticker?: {
        packId: string;
        packKey: string;
        stickerId: number;
        emoji?: string;
    };
    reaction?: {
        emoji: string;
        remove: boolean;
        targetAuthor: string;
        targetSentTimestamp: number;
    };
    remoteDelete?: {
        targetSentTimestamp: number;
    };
    mentions?: Array<{
        uuid: string;
        start: number;
        length: number;
    }>;
    bodyRanges?: Array<{
        start: number;
        length: number;
        style?: string;
    }>;
    preview?: Array<{
        url: string;
        title?: string;
        description?: string;
        date?: number;
        image?: SignalAttachment;
    }>;
    contact?: {
        name: {
            givenName?: string;
            familyName?: string;
            prefix?: string;
            suffix?: string;
            middleName?: string;
            displayName?: string;
        };
        number?: Array<{
            value: string;
            type?: string;
            label?: string;
        }>;
        email?: Array<{
            value: string;
            type?: string;
            label?: string;
        }>;
        address?: Array<{
            type?: string;
            label?: string;
            street?: string;
            pobox?: string;
            neighborhood?: string;
            city?: string;
            region?: string;
            postcode?: string;
            country?: string;
        }>;
        avatar?: SignalAttachment;
        organization?: string;
    };
    dataMessage?: {
        body?: string;
        attachments?: SignalAttachment[];
        timestamp?: number;
        quote?: {
            id: number;
            author: string;
            authorUuid?: string;
            text?: string;
            attachments?: SignalAttachment[];
            bodyRanges?: Array<{
                start: number;
                length: number;
                style?: string;
            }>;
            mentions?: Array<{
                uuid: string;
                start: number;
                length: number;
            }>;
        };
        contact?: any[];
        preview?: any[];
        sticker?: any;
        requiredProtocolVersion?: number;
        isViewOnce?: boolean;
        reaction?: any;
        delete?: any;
        bodyRanges?: any[];
        groupV2?: any;
        payment?: any;
        storyContext?: any;
        giftBadge?: any;
    };
    editMessage?: {
        targetSentTimestamp: number;
        dataMessage: any;
    };
    isViewOnce?: boolean;
    profileKey?: string;
    profileKeyVersion?: number;
    expiresInSeconds?: number;
    expireTimer?: number;
    profileName?: string;
    profileAvatar?: string;
    read?: boolean;
    unidentifiedDeliveryReceived?: boolean;
    isIncoming?: boolean;
    isOutgoing?: boolean;
    delivered?: boolean;
    read_by?: string[];
    delivered_to?: string[];
    viewed?: boolean;
    serverTimestamp?: number;
    decrypted?: boolean;
    story?: boolean;
    storyDistributionList?: string;
}

export interface SignalOutgoingMessage {
    message?: string;
    attachments?: Array<{
        filename: string;
        contentType: string;
        data?: Buffer | string;
        url?: string;
        caption?: string;
        width?: number;
        height?: number;
        voiceNote?: boolean;
        gif?: boolean;
        borderless?: boolean;
        isViewOnce?: boolean;
    }>;
    quote?: {
        id: number;
        author: string;
        authorUuid?: string;
        text?: string;
        attachments?: any[];
        mentions?: any[];
    };
    contacts?: Array<{
        name: {
            givenName?: string;
            familyName?: string;
            displayName?: string;
        };
        number?: Array<{
            value: string;
            type?: string;
            label?: string;
        }>;
        email?: Array<{
            value: string;
            type?: string;
            label?: string;
        }>;
        address?: Array<{
            type?: string;
            label?: string;
            street?: string;
            city?: string;
            region?: string;
            postcode?: string;
            country?: string;
        }>;
        organization?: string;
        avatar?: {
            filename: string;
            contentType: string;
            data: Buffer | string;
        };
    }>;
    sticker?: {
        packId: string;
        packKey: string;
        stickerId: number;
    };
    reaction?: {
        emoji: string;
        remove: boolean;
        targetAuthor: string;
        targetSentTimestamp: number;
    };
    remoteDelete?: {
        targetSentTimestamp: number;
    };
    mentions?: Array<{
        uuid: string;
        start: number;
        length: number;
    }>;
    bodyRanges?: Array<{
        start: number;
        length: number;
        style?: 'BOLD' | 'ITALIC' | 'STRIKETHROUGH' | 'MONOSPACE';
    }>;
    preview?: Array<{
        url: string;
        title?: string;
        description?: string;
        date?: number;
        image?: {
            filename: string;
            contentType: string;
            data: Buffer | string;
        };
    }>;
    isViewOnce?: boolean;
    expireTimer?: number;
    profileKey?: string;
    timestamp?: number;
}

export class SignalMessageTransformer extends BaseMessageTransformer {

    getPlatformName(): string {
        return ChannelType.Signal;
    }

    //#region Incoming Message Parsing

    parseIncomingMessage(platformMessage: SignalMessage): TransformedMessage {
        if (!this.validateMessageStructure(platformMessage)) {
            throw new Error('Invalid Signal message structure');
        }

        const userId = this.extractUserId(platformMessage);
        const content = this.parseMessageContent(platformMessage);
        const metadata = this.createSignalMetadata(platformMessage);
        const timestamp = new Date(platformMessage.timestamp);

        const transformed: TransformedMessage = {
            userId,
            content,
            metadata,
            timestamp,
            platformMessageId : platformMessage.timestamp.toString()
        };

        if (!this.validateTransformedMessage(transformed)) {
            throw new Error('Failed to create valid transformed message');
        }

        return transformed;
    }

    private parseMessageContent(message: SignalMessage): MessageContent {
        // Handle different message types
        if (message.reaction) {
            return this.createInteractiveContent(
                'reaction',
                message.reaction.emoji,
                undefined,
                undefined,
                {
                    emoji           : message.reaction.emoji,
                    remove          : message.reaction.remove,
                    targetAuthor    : message.reaction.targetAuthor,
                    targetTimestamp : message.reaction.targetSentTimestamp
                }
            );
        }

        if (message.remoteDelete) {
            return this.createTextContent('Message deleted');
        }

        if (message.sticker) {
            return this.createMediaContent(
                'image',
                `signal://sticker/${message.sticker.packId}/${message.sticker.stickerId}`,
                message.sticker.emoji,
                {
                    packId    : message.sticker.packId,
                    packKey   : message.sticker.packKey,
                    stickerId : message.sticker.stickerId,
                    isSticker : true
                }
            );
        }

        // Handle attachments
        if (message.attachments && message.attachments.length > 0) {
            const attachment = message.attachments[0];
            const mediaType = this.getMediaTypeFromSignalAttachment(attachment);

            return this.createMediaContent(
                mediaType,
                attachment.url || attachment.path || `signal://attachment/${attachment.id}`,
                attachment.caption || message.message,
                {
                    filename    : attachment.filename,
                    contentType : attachment.contentType,
                    size        : attachment.size,
                    dimensions  : attachment.width && attachment.height ? {
                        width  : attachment.width,
                        height : attachment.height
                    } : undefined,
                    isVoiceNote  : attachment.voiceNote,
                    isGif        : attachment.gif,
                    isBorderless : attachment.borderless,
                    isViewOnce   : message.isViewOnce,
                    blurhash     : attachment.blurhash
                }
            );
        }

        // Handle contact sharing
        if (message.contact) {
            return this.createContactContent([{
                name : message.contact.name.displayName ||
                      `${message.contact.name.givenName || ''} ${message.contact.name.familyName || ''}`.trim(),
                phones       : message.contact.number?.map(n => n.value) || [],
                emails       : message.contact.email?.map(e => e.value) || [],
                organization : message.contact.organization,
                addresses    : message.contact.address?.map(addr => ({
                    type     : addr.type,
                    street   : addr.street,
                    city     : addr.city,
                    region   : addr.region,
                    postcode : addr.postcode,
                    country  : addr.country
                })) || []
            }]);
        }

        // Handle data message (main message content)
        if (message.dataMessage) {
            return this.parseDataMessage(message.dataMessage, message.message);
        }

        // Handle text message
        if (message.message) {
            return this.createTextContent(
                this.sanitizeText(message.message),
                this.parseSignalFormatting(message.bodyRanges || [])
            );
        }

        // Handle group updates
        if (message.group || message.groupV2) {
            return this.createTextContent(this.parseGroupUpdate(message));
        }

        return this.createTextContent('Message received');
    }

    private parseDataMessage(dataMessage: any, fallbackText?: string): MessageContent {
        // Handle quoted messages
        if (dataMessage.quote) {
            const content = this.createTextContent(
                this.sanitizeText(dataMessage.body || fallbackText || ''),
                this.parseSignalFormatting(dataMessage.bodyRanges || [])
            );

            (content as any).quote = {
                id          : dataMessage.quote.id,
                author      : dataMessage.quote.author,
                authorUuid  : dataMessage.quote.authorUuid,
                text        : dataMessage.quote.text,
                attachments : dataMessage.quote.attachments
            };

            return content;
        }

        // Handle attachments in data message
        if (dataMessage.attachments && dataMessage.attachments.length > 0) {
            const attachment = dataMessage.attachments[0];
            const mediaType = this.getMediaTypeFromSignalAttachment(attachment);

            return this.createMediaContent(
                mediaType,
                attachment.url || attachment.path || `signal://attachment/${attachment.id}`,
                attachment.caption || dataMessage.body || fallbackText,
                {
                    filename    : attachment.filename,
                    contentType : attachment.contentType,
                    size        : attachment.size,
                    dimensions  : attachment.width && attachment.height ? {
                        width  : attachment.width,
                        height : attachment.height
                    } : undefined,
                    isVoiceNote : attachment.voiceNote,
                    isViewOnce  : dataMessage.isViewOnce
                }
            );
        }

        // Handle sticker in data message
        if (dataMessage.sticker) {
            return this.createMediaContent(
                'image',
                `signal://sticker/${dataMessage.sticker.packId}/${dataMessage.sticker.stickerId}`,
                undefined,
                {
                    packId    : dataMessage.sticker.packId,
                    packKey   : dataMessage.sticker.packKey,
                    stickerId : dataMessage.sticker.stickerId,
                    isSticker : true
                }
            );
        }

        // Handle text content
        if (dataMessage.body) {
            return this.createTextContent(
                this.sanitizeText(dataMessage.body),
                this.parseSignalFormatting(dataMessage.bodyRanges || [])
            );
        }

        return this.createTextContent(fallbackText || 'Data message received');
    }

    private parseGroupUpdate(message: SignalMessage): string {
        if (message.group) {
            return `Group message (${message.group.groupId})`;
        }
        if (message.groupV2) {
            return `Group v2 message (${message.groupV2.groupId})`;
        }
        return 'Group update';
    }

    private parseSignalFormatting(bodyRanges: any[]): any {
        const formatting: any = {
            bold          : [],
            italic        : [],
            strikethrough : [],
            monospace     : [],
            mentions      : []
        };

        for (const range of bodyRanges) {
            const rangeData = {
                offset : range.start,
                length : range.length
            };

            if (range.style) {
                switch (range.style) {
                    case 'BOLD':
                        formatting.bold.push(rangeData);
                        break;
                    case 'ITALIC':
                        formatting.italic.push(rangeData);
                        break;
                    case 'STRIKETHROUGH':
                        formatting.strikethrough.push(rangeData);
                        break;
                    case 'MONOSPACE':
                        formatting.monospace.push(rangeData);
                        break;
                }
            }
        }

        return formatting;
    }

    private getMediaTypeFromSignalAttachment(attachment: SignalAttachment): 'image' | 'audio' | 'video' | 'document' {
        if (!attachment.contentType) return 'document';

        if (attachment.contentType.startsWith('image/')) return 'image';
        if (attachment.contentType.startsWith('audio/') || attachment.voiceNote) return 'audio';
        if (attachment.contentType.startsWith('video/')) return 'video';

        return 'document';
    }

    //#endregion

    //#region Outgoing Message Formatting

    formatOutgoingMessage(
        userId: string,
        content: MessageContent,
        metadata?: MessageMetadata
    ): SignalOutgoingMessage {
        const message: SignalOutgoingMessage = {};

        // Add quote information if available
        if (metadata?.ReplyTo) {
            message.quote = {
                id         : parseInt(metadata.ReplyTo),
                author     : metadata.QuotedFrom || userId,
                authorUuid : metadata.QuotedFromUuid
            };
        }

        return this.addContentToMessage(message, content);
    }

    private addContentToMessage(
        message: SignalOutgoingMessage,
        content: MessageContent
    ): SignalOutgoingMessage {
        if (isTextMessageContent(content)) {
            message.message = content.text;
            if (content.formatting) {
                message.bodyRanges = this.formatSignalRanges(content.formatting);
            }
        } else if (isMediaMessageContent(content)) {
            if (content.caption) {
                message.message = content.caption;
            }
            message.attachments = [this.createSignalAttachment(content)];
        } else if (isContactMessageContent(content)) {
            message.contacts = [{
                name : {
                    givenName   : content.name.split(' ')[0],
                    familyName  : content.name.split(' ').slice(1).join(' '),
                    displayName : content.name
                },
                number : content.phone ? [{
                    value : content.phone,
                    type  : 'CELL',
                    label : 'Mobile'
                }] : [],
                email : content.email ? [{
                    value : content.email,
                    type  : 'WORK',
                    label : 'Work'
                }] : [],
                organization : content.organization
            }];
        } else if (isInteractiveMessageContent(content)) {
            message.message = content.text || 'Interactive message';
            if (content.type === 'reaction' as any) {
                message.reaction = {
                    emoji               : (content as any).emoji,
                    remove              : (content as any).remove || false,
                    targetAuthor        : (content as any).targetAuthor,
                    targetSentTimestamp : (content as any).targetTimestamp
                };
            }
        }

        return message;
    }

    private createSignalAttachment(content: MediaMessageContent): any {
        return {
            filename    : content.filename || `file.${this.extractFileExtension(content.url)}`,
            contentType : content.mimeType || this.getMimeTypeFromExtension(this.extractFileExtension(content.url)),
            data        : content.url, // In real implementation, this would be the actual file data
            caption     : content.caption,
            width       : content.dimensions?.width,
            height      : content.dimensions?.height,
            voiceNote   : content.mediaType === 'audio',
            gif         : content.mimeType === 'image/gif',
            borderless  : false
        };
    }

    private formatSignalRanges(formatting: any): any[] {
        const ranges: any[] = [];

        // Bold formatting
        if (formatting.bold) {
            formatting.bold.forEach((range: any) => {
                ranges.push({
                    start  : range.offset,
                    length : range.length,
                    style  : 'BOLD'
                });
            });
        }

        // Italic formatting
        if (formatting.italic) {
            formatting.italic.forEach((range: any) => {
                ranges.push({
                    start  : range.offset,
                    length : range.length,
                    style  : 'ITALIC'
                });
            });
        }

        // Strikethrough formatting
        if (formatting.strikethrough) {
            formatting.strikethrough.forEach((range: any) => {
                ranges.push({
                    start  : range.offset,
                    length : range.length,
                    style  : 'STRIKETHROUGH'
                });
            });
        }

        // Monospace formatting
        if (formatting.monospace) {
            formatting.monospace.forEach((range: any) => {
                ranges.push({
                    start  : range.offset,
                    length : range.length,
                    style  : 'MONOSPACE'
                });
            });
        }

        return ranges;
    }

    //#endregion

    //#region Validation and Utility Methods

    validateMessageStructure(platformMessage: any): boolean {
        if (!platformMessage || typeof platformMessage !== 'object') {
            return false;
        }

        const required = ['timestamp', 'source'];
        for (const field of required) {
            if (!platformMessage[field]) {
                return false;
            }
        }

        return true;
    }

    extractUserId(platformMessage: SignalMessage): string {
        // For groups, combine group ID and user ID
        if (platformMessage.group || platformMessage.groupV2) {
            const groupId = platformMessage.group?.groupId || platformMessage.groupV2?.groupId;
            return `${groupId}:${platformMessage.source}`;
        }

        // For individual chats, use the source number/UUID
        return platformMessage.sourceUuid || platformMessage.source;
    }

    private createSignalMetadata(message: SignalMessage): MessageMetadata {
        const metadata = this.createMetadata(message, {
            platform  : ChannelType.Signal,
            timestamp : new Date(message.timestamp)
        });

        // Add Signal-specific metadata
        if (message.group) {
            metadata.Group = {
                groupId : message.group.groupId,
                type    : message.group.type
            };
        }

        if (message.groupV2) {
            metadata.GroupV2 = {
                groupId   : message.groupV2.groupId,
                masterKey : message.groupV2.masterKey,
                revision  : message.groupV2.revision
            };
        }

        if (message.dataMessage?.quote) {
            metadata.ReplyTo = message.dataMessage.quote.id.toString();
            metadata.QuotedFrom = message.dataMessage.quote.author;
            metadata.QuotedFromUuid = message.dataMessage.quote.authorUuid;
        }

        return metadata;
    }

    private extractFirstName(fullName: string): string {
        return fullName.split(' ')[0] || '';
    }

    private extractLastName(fullName: string): string {
        const parts = fullName.split(' ');
        return parts.length > 1 ? parts.slice(1).join(' ') : '';
    }

    //#endregion

}
