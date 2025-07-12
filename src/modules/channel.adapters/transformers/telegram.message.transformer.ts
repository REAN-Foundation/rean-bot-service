import {
    MessageContent,
    MessageMetadata,
    isTextMessageContent,
    isMediaMessageContent,
    isLocationMessageContent,
    isContactMessageContent,
    isInteractiveMessageContent,
    MediaMessageContent,
    InteractiveMessageContent
} from '../../../domain.types/message.types';
import { BaseMessageTransformer, TransformedMessage } from './base.message.transformer';

////////////////////////////////////////////////////////////

export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export interface TelegramChat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}

export interface TelegramPhotoSize {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
}

export interface TelegramDocument {
    file_id: string;
    file_unique_id: string;
    thumb?: TelegramPhotoSize;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
}

export interface TelegramAudio {
    file_id: string;
    file_unique_id: string;
    duration: number;
    performer?: string;
    title?: string;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
    thumb?: TelegramPhotoSize;
}

export interface TelegramVideo {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    duration: number;
    thumb?: TelegramPhotoSize;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
}

export interface TelegramVoice {
    file_id: string;
    file_unique_id: string;
    duration: number;
    mime_type?: string;
    file_size?: number;
}

export interface TelegramLocation {
    longitude: number;
    latitude: number;
    live_period?: number;
    heading?: number;
    proximity_alert_radius?: number;
}

export interface TelegramContact {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
    vcard?: string;
}

export interface TelegramMessageEntity {
    type: string;
    offset: number;
    length: number;
    url?: string;
    user?: TelegramUser;
    language?: string;
}

export interface TelegramInlineKeyboardButton {
    text: string;
    url?: string;
    callback_data?: string;
    web_app?: { url: string };
    switch_inline_query?: string;
    switch_inline_query_current_chat?: string;
}

export interface TelegramInlineKeyboardMarkup {
    inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    sender_chat?: TelegramChat;
    date: number;
    chat: TelegramChat;
    forward_from?: TelegramUser;
    forward_from_chat?: TelegramChat;
    forward_from_message_id?: number;
    forward_signature?: string;
    forward_sender_name?: string;
    forward_date?: number;
    is_automatic_forward?: boolean;
    reply_to_message?: TelegramMessage;
    via_bot?: TelegramUser;
    edit_date?: number;
    has_protected_content?: boolean;
    media_group_id?: string;
    author_signature?: string;
    text?: string;
    entities?: TelegramMessageEntity[];
    caption_entities?: TelegramMessageEntity[];
    audio?: TelegramAudio;
    document?: TelegramDocument;
    photo?: TelegramPhotoSize[];
    sticker?: any;
    video?: TelegramVideo;
    video_note?: any;
    voice?: TelegramVoice;
    caption?: string;
    contact?: TelegramContact;
    dice?: any;
    game?: any;
    poll?: any;
    venue?: any;
    location?: TelegramLocation;
    new_chat_members?: TelegramUser[];
    left_chat_member?: TelegramUser;
    new_chat_title?: string;
    new_chat_photo?: TelegramPhotoSize[];
    delete_chat_photo?: boolean;
    group_chat_created?: boolean;
    supergroup_chat_created?: boolean;
    channel_chat_created?: boolean;
    migrate_to_chat_id?: number;
    migrate_from_chat_id?: number;
    pinned_message?: TelegramMessage;
    invoice?: any;
    successful_payment?: any;
    connected_website?: string;
    passport_data?: any;
    proximity_alert_triggered?: any;
    video_chat_scheduled?: any;
    video_chat_started?: any;
    video_chat_ended?: any;
    video_chat_participants_invited?: any;
    web_app_data?: any;
}

export interface TelegramOutgoingMessage {
    chat_id: string | number;
    message_thread_id?: number;
    text?: string;
    parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
    entities?: TelegramMessageEntity[];
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
    protect_content?: boolean;
    reply_to_message_id?: number;
    allow_sending_without_reply?: boolean;
    reply_markup?: TelegramInlineKeyboardMarkup;
    photo?: string;
    audio?: string;
    document?: string;
    video?: string;
    voice?: string;
    caption?: string;
    caption_entities?: TelegramMessageEntity[];
    duration?: number;
    width?: number;
    height?: number;
    thumb?: string;
    supports_streaming?: boolean;
    latitude?: number;
    longitude?: number;
    live_period?: number;
    heading?: number;
    proximity_alert_radius?: number;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    vcard?: string;
}

export interface TelegramCallbackQuery {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    inline_message_id?: string;
    chat_instance: string;
    data?: string;
    game_short_name?: string;
}

export class TelegramMessageTransformer extends BaseMessageTransformer {

    getPlatformName(): string {
        return 'telegram';
    }

    //#region Incoming Message Parsing

    parseIncomingMessage(platformMessage: TelegramMessage | TelegramCallbackQuery): TransformedMessage {
        // Handle callback queries (button presses)
        if ('chat_instance' in platformMessage) {
            return this.parseCallbackQuery(platformMessage as TelegramCallbackQuery);
        }

        const message = platformMessage as TelegramMessage;

        if (!this.validateMessageStructure(message)) {
            throw new Error('Invalid Telegram message structure');
        }

        const userId = this.extractUserId(message);
        const content = this.parseMessageContent(message);
        const metadata = this.createTelegramMetadata(message);
        const timestamp = new Date(message.date * 1000);

        const transformed: TransformedMessage = {
            userId,
            content,
            metadata,
            timestamp,
            platformMessageId : message.message_id.toString()
        };

        if (!this.validateTransformedMessage(transformed)) {
            throw new Error('Failed to create valid transformed message');
        }

        return transformed;
    }

    private parseCallbackQuery(query: TelegramCallbackQuery): TransformedMessage {
        const userId = query.from.id.toString();
        const content = this.createInteractiveContent(
            'callback_query',
            query.data || '',
            [{
                id    : query.data || '',
                title : query.data || 'Button pressed'
            }]
        );

        const metadata = this.createMetadata(query, {
            callbackQueryId   : query.id,
            chatInstance      : query.chat_instance,
            inlineMessageId   : query.inline_message_id,
            originalMessageId : query.message?.message_id
        });

        return {
            userId,
            content,
            metadata,
            timestamp         : new Date(),
            platformMessageId : query.id
        };
    }

    private parseMessageContent(message: TelegramMessage): MessageContent {
        // Text message
        if (message.text) {
            return this.createTextContent(
                this.sanitizeText(message.text),
                this.parseTextEntities(message.entities || [])
            );
        }

        // Photo message
        if (message.photo && message.photo.length > 0) {
            const largestPhoto = message.photo.reduce((prev, current) =>
                (prev.file_size || 0) > (current.file_size || 0) ? prev : current
            );

            return this.createMediaContent(
                'image',
                `telegram://file/${largestPhoto.file_id}`,
                message.caption,
                {
                    fileId       : largestPhoto.file_id,
                    fileUniqueId : largestPhoto.file_unique_id,
                    width        : largestPhoto.width,
                    height       : largestPhoto.height,
                    fileSize     : largestPhoto.file_size
                }
            );
        }

        // Audio message
        if (message.audio) {
            return this.createMediaContent(
                'audio',
                `telegram://file/${message.audio.file_id}`,
                message.caption,
                {
                    fileId       : message.audio.file_id,
                    fileUniqueId : message.audio.file_unique_id,
                    duration     : message.audio.duration,
                    performer    : message.audio.performer,
                    title        : message.audio.title,
                    fileName     : message.audio.file_name,
                    mimeType     : message.audio.mime_type,
                    fileSize     : message.audio.file_size
                }
            );
        }

        // Voice message
        if (message.voice) {
            return this.createMediaContent(
                'audio',
                `telegram://file/${message.voice.file_id}`,
                undefined,
                {
                    fileId       : message.voice.file_id,
                    fileUniqueId : message.voice.file_unique_id,
                    duration     : message.voice.duration,
                    mimeType     : message.voice.mime_type,
                    fileSize     : message.voice.file_size,
                    isVoiceNote  : true
                }
            );
        }

        // Video message
        if (message.video) {
            return this.createMediaContent(
                'video',
                `telegram://file/${message.video.file_id}`,
                message.caption,
                {
                    fileId       : message.video.file_id,
                    fileUniqueId : message.video.file_unique_id,
                    width        : message.video.width,
                    height       : message.video.height,
                    duration     : message.video.duration,
                    fileName     : message.video.file_name,
                    mimeType     : message.video.mime_type,
                    fileSize     : message.video.file_size
                }
            );
        }

        // Document message
        if (message.document) {
            return this.createMediaContent(
                'document',
                `telegram://file/${message.document.file_id}`,
                message.caption,
                {
                    fileId       : message.document.file_id,
                    fileUniqueId : message.document.file_unique_id,
                    fileName     : message.document.file_name,
                    mimeType     : message.document.mime_type,
                    fileSize     : message.document.file_size
                }
            );
        }

        // Location message
        if (message.location) {
            return this.createLocationContent(
                message.location.latitude,
                message.location.longitude,
                undefined,
                undefined
            );
        }

        // Contact message
        if (message.contact) {
            return this.createContactContent([{
                name   : `${message.contact.first_name} ${message.contact.last_name || ''}`.trim(),
                phones : [message.contact.phone_number],
                emails : [],
                userId : message.contact.user_id?.toString(),
                vcard  : message.contact.vcard
            }]);
        }

        // Default fallback
        return this.createTextContent('Unsupported message type received');
    }

    private parseTextEntities(entities: TelegramMessageEntity[]): any {
        const formatting: any = {
            bold          : [],
            italic        : [],
            underline     : [],
            strikethrough : [],
            mentions      : [],
            links         : [],
            code          : [],
            pre           : []
        };

        for (const entity of entities) {
            const range = { offset: entity.offset, length: entity.length };

            switch (entity.type) {
                case 'bold':
                    formatting.bold.push(range);
                    break;
                case 'italic':
                    formatting.italic.push(range);
                    break;
                case 'underline':
                    formatting.underline.push(range);
                    break;
                case 'strikethrough':
                    formatting.strikethrough.push(range);
                    break;
                case 'mention':
                case 'text_mention':
                    formatting.mentions.push({
                        ...range,
                        username : entity.user?.username,
                        userId   : entity.user?.id
                    });
                    break;
                case 'url':
                case 'text_link':
                    formatting.links.push({
                        ...range,
                        url : entity.url
                    });
                    break;
                case 'code':
                    formatting.code.push(range);
                    break;
                case 'pre':
                    formatting.pre.push({
                        ...range,
                        language : entity.language
                    });
                    break;
            }
        }

        return formatting;
    }

    //#endregion

    //#region Outgoing Message Formatting

    formatOutgoingMessage(
        userId: string,
        content: MessageContent,
        metadata?: MessageMetadata
    ): TelegramOutgoingMessage | TelegramOutgoingMessage[] {
        const baseMessage: TelegramOutgoingMessage = {
            chat_id : userId
        };

        // Add reply information
        if (metadata?.ReplyTo) {
            baseMessage.reply_to_message_id = parseInt(metadata.ReplyTo);
        }

        return this.addContentToMessage(baseMessage, content);
    }

    private addContentToMessage(
        message: TelegramOutgoingMessage,
        content: MessageContent
    ): TelegramOutgoingMessage | TelegramOutgoingMessage[] {
        if (isTextMessageContent(content)) {
            message.text = content.text;

            // Add formatting if available
            if (content.formatting) {
                message.entities = this.formatTextEntities(content.formatting);
            }

            // Disable web preview for URLs
            message.disable_web_page_preview = !this.shouldShowWebPreview(content.text);

        } else if (isMediaMessageContent(content)) {
            return this.createMediaMessage(message, content as MediaMessageContent);
        } else if (isLocationMessageContent(content)) {
            message.latitude = content.latitude;
            message.longitude = content.longitude!;

            // Add location name/address if available
            if (content.name || content.address) {
                message.text = `${content.name || content.address}`;
            }
        } else if (isContactMessageContent(content)) {
            const contact = content; // Telegram supports one contact per message
            message.phone_number = contact.phone || '';
            message.first_name = contact.name.split(' ')[0];
            message.last_name = contact.name.split(' ').slice(1).join(' ') || undefined;
            message.vcard = content.vcard;
        } else if (isInteractiveMessageContent(content)) {
            message.text = content.text || '';
            message.reply_markup = this.formatInlineKeyboard(content);
        }

        return message;
    }

    private createMediaMessage(
        baseMessage: TelegramOutgoingMessage,
        content: MediaMessageContent
    ): TelegramOutgoingMessage {
        const message = { ...baseMessage };

        switch (content.mediaType) {
            case 'image':
                message.photo = content.url;
                if (content.caption) {
                    message.caption = content.caption;
                }
                break;
            case 'audio':
                message.audio = content.url;
                if (content.caption) {
                    message.caption = content.caption;
                }
                break;
            case 'video':
                message.video = content.url;
                if (content.caption) {
                    message.caption = content.caption;
                }
                break;
            case 'document':
                message.document = content.url;
                if (content.caption) {
                    message.caption = content.caption;
                }
                break;
        }

        return message;
    }

    private formatTextEntities(formatting: any): TelegramMessageEntity[] {
        const entities: TelegramMessageEntity[] = [];

        // Bold formatting
        if (formatting.bold) {
            formatting.bold.forEach((range: any) => {
                entities.push({
                    type   : 'bold',
                    offset : range.offset,
                    length : range.length
                });
            });
        }

        // Italic formatting
        if (formatting.italic) {
            formatting.italic.forEach((range: any) => {
                entities.push({
                    type   : 'italic',
                    offset : range.offset,
                    length : range.length
                });
            });
        }

        // Add other formatting types...
        // (underline, strikethrough, code, etc.)

        return entities;
    }

    private formatInlineKeyboard(interactive: InteractiveMessageContent): TelegramInlineKeyboardMarkup {
        const keyboard: TelegramInlineKeyboardButton[][] = [];

        if (interactive.buttons) {
            const row: TelegramInlineKeyboardButton[] = [];
            for (const button of interactive.buttons) {
                row.push({
                    text: button.title,
                    callback_data: button.payload || button.id
                });
            }
            keyboard.push(row);
        }

        return { inline_keyboard: keyboard };
    }

    //#endregion

    //#region Validation and Utility Methods

    validateMessageStructure(platformMessage: any): boolean {
        if (!platformMessage || typeof platformMessage !== 'object') {
            return false;
        }

        const required = ['message_id', 'date', 'chat'];
        for (const field of required) {
            if (platformMessage[field] === undefined) {
                return false;
            }
        }

        return true;
    }

    extractUserId(platformMessage: TelegramMessage): string {
        // For private chats, use the user ID
        if (platformMessage.chat.type === 'private') {
            return platformMessage.from?.id.toString() || platformMessage.chat.id.toString();
        }

        // For groups, use chat ID with user ID combination
        return `${platformMessage.chat.id}:${platformMessage.from?.id || 'unknown'}`;
    }

    private createTelegramMetadata(message: TelegramMessage): MessageMetadata {
        const metadata = this.createMetadata(message, {
            platform: 'telegram',
            timestamp: new Date(message.date * 1000)
        });

        // Add Telegram-specific metadata
        if (message.forward_from) {
            metadata.ForwardedFrom = JSON.stringify({
                from: message.forward_from,
                fromChat: message.forward_from_chat,
                messageId: message.forward_from_message_id,
                date: message.forward_date
            });
        }

        if (message.reply_to_message) {
            metadata.ReplyTo = message.reply_to_message.message_id.toString();
        }

        if (message.edit_date) {
            metadata.EditedAt = new Date(message.edit_date * 1000);
        }

        return metadata;
    }

    private shouldShowWebPreview(text: string): boolean {
        // Show preview for explicit links, hide for links in certain contexts
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = text.match(urlRegex);

        if (!urls || urls.length === 0) return false;
        if (urls.length > 2) return false; // Too many links, likely spam

        return true;
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
