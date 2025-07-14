import {
    MessageContent,
    MessageMetadata,
    MediaMessageContent,
    ChannelType,
    TextMessageContent,
    ContactMessageContent,
    InteractiveMessageContent,
    InteractiveMessageType
} from '../../../domain.types/message.types';
import {
    isTextMessageContent,
    isMediaMessageContent,
    isLocationMessageContent,
    isContactMessageContent,
    isInteractiveMessageContent
} from "../message.utils";
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
        if (message.dataMessage) {
            return this.parseDataMessage(message.dataMessage, message.message);
        }
        if (message.message) {
            const textMessage: TextMessageContent = {
                Text: this.sanitizeText(message.message),
            };
            if (message.bodyRanges) {
                textMessage.Formatting = this.parseSignalFormatting(message.bodyRanges);
            }
            return textMessage;
        }
        if (message.attachments && message.attachments.length > 0) {
            const attachment = message.attachments[0];
            const mediaType = this.getMediaTypeFromSignalAttachment(attachment);
            return {
                MediaType  : mediaType,
                Url        : attachment.url || attachment.path || `signal://attachment/${attachment.id}`,
                Caption    : attachment.caption,
                Filename   : attachment.filename,
                MimeType   : attachment.contentType,
                Size       : attachment.size,
                Dimensions : {
                    Width  : attachment.width,
                    Height : attachment.height,
                },
            } as MediaMessageContent;
        }
        if (message.contact) {
            const contact = message.contact;
            return {
                Name         : contact.name.displayName || `${contact.name.givenName || ''} ${contact.name.familyName || ''}`.trim(),
                Phone        : contact.number?.[0]?.value,
                Email        : contact.email?.[0]?.value,
                Organization : contact.organization,
            } as ContactMessageContent;
        }
        if (message.sticker) {
            return {
                MediaType : 'image',
                Url       : `signal://sticker/${message.sticker.packId}/${message.sticker.stickerId}`,
                Caption   : message.sticker.emoji,
            } as MediaMessageContent;
        }
        if (message.reaction) {
            return {
                Type : InteractiveMessageType.Button,
                Text : message.reaction.emoji,
            } as InteractiveMessageContent;
        }
        if (message.remoteDelete) {
            return { Text: 'Message deleted' } as TextMessageContent;
        }
        if (message.group || message.groupV2) {
            return { Text: this.parseGroupUpdate(message) } as TextMessageContent;
        }
        return { Text: 'Message received' } as TextMessageContent;
    }

    private parseDataMessage(dataMessage: any, fallbackText?: string): MessageContent {
        if (dataMessage.body) {
            const content: TextMessageContent = {
                Text : this.sanitizeText(dataMessage.body),
            };
            if (dataMessage.bodyRanges) {
                content.Formatting = this.parseSignalFormatting(dataMessage.bodyRanges);
            }
            return content;
        }
        if (dataMessage.attachments && dataMessage.attachments.length > 0) {
            const attachment = dataMessage.attachments[0];
            const mediaType = this.getMediaTypeFromSignalAttachment(attachment);
            return {
                MediaType : mediaType,
                Url       : attachment.url || attachment.path || `signal://attachment/${attachment.id}`,
                Caption   : attachment.caption || fallbackText,
                Filename  : attachment.filename,
                MimeType  : attachment.contentType,
                Size      : attachment.size,
            } as MediaMessageContent;
        }
        return { Text: fallbackText || 'Data message received' } as TextMessageContent;
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
        const formatting = {
            bold          : [],
            italic        : [],
            strikethrough : [],
            monospace     : []
        };
        for (const range of bodyRanges) {
            const style = range.style.toLowerCase();
            if (formatting[style]) {
                formatting[style].push({
                    start  : range.start,
                    length : range.length
                });
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
            message.message = content.Text;
            if (content.Formatting) {
                message.bodyRanges = this.formatSignalRanges(content.Formatting);
            }
        } else if (isMediaMessageContent(content)) {
            message.attachments = [this.createSignalAttachment(content)];
            if (content.Caption) {
                message.message = content.Caption;
            }
        } else if (isContactMessageContent(content)) {
            message.contacts = [{
                name: {
                    displayName : content.Name,
                    givenName   : content.Name.split(' ')[0],
                    familyName  : content.Name.split(' ').slice(1).join(' ')
                },
                number : content.Phone ? [{ value: content.Phone, type: 'CELL' }] : [],
                email  : content.Email ? [{ value: content.Email, type: 'WORK' }] : [],
                organization: content.Organization
            }];
        } else if (isInteractiveMessageContent(content)) {
            message.message = content.Text || 'Interactive message';
        }
        return message;
    }

    private createSignalAttachment(content: MediaMessageContent): any {
        return {
            filename    : content.Filename || `file.${this.extractFileExtension(content.Url)}`,
            contentType : content.MimeType || this.getMimeTypeFromExtension(this.extractFileExtension(content.Url)),
            data        : content.Url,
            caption     : content.Caption,
            width       : content.Dimensions?.Width,
            height      : content.Dimensions?.Height,
        };
    }

    private formatSignalRanges(formatting: any): any[] {
        const ranges = [];

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
