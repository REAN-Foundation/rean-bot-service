import {
    MessageContent,
    MessageMetadata,
    MediaMessageContent,
    InteractiveMessageContent,
    ChannelType,
    TextMessageContent,
    LocationMessageContent,
    ContactMessageContent,
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
        return ChannelType.Telegram;
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
            InteractiveMessageType.Button,
            query.data,
            [{
                id      : query.id,
                title   : query.data,
                payload : query.data
            }]
        );

        const metadata = this.createMetadata(query.message || {}, {
            callbackQueryId : query.id,
            chatInstance    : query.chat_instance
        });

        const transformed: TransformedMessage = {
            userId,
            content,
            metadata,
            timestamp         : new Date(),
            platformMessageId : query.id
        };

        return transformed;
    }

    private parseMessageContent(message: TelegramMessage): MessageContent {

        if (message.text) {
            const content: TextMessageContent = {
                Text: message.text
            };
            if (message.entities) {
                content.Formatting = this.parseTextEntities(message.entities);
            }
            return content;
        }
        if (message.photo) {
            const photo = message.photo[message.photo.length - 1]; // Largest one
            return {
                MediaType : 'image',
                Url       : photo.file_id,
                Caption   : message.caption,
            } as MediaMessageContent;
        }
        if (message.document) {
            return {
                MediaType : 'document',
                Url       : message.document.file_id,
                Caption   : message.caption,
                Filename  : message.document.file_name,
                MimeType  : message.document.mime_type,
                Size      : message.document.file_size,
            } as MediaMessageContent;
        }
        if (message.audio) {
            return {
                MediaType : 'audio',
                Url       : message.audio.file_id,
                Caption   : message.caption,
                Duration  : message.audio.duration,
            } as MediaMessageContent;
        }
        if (message.video) {
            return {
                MediaType : 'video',
                Url       : message.video.file_id,
                Caption   : message.caption,
                Duration  : message.video.duration,
            } as MediaMessageContent;
        }
        if (message.voice) {
            return {
                MediaType : 'audio',
                Url       : message.voice.file_id,
                Caption   : message.caption,
                Duration  : message.voice.duration,
            } as MediaMessageContent;
        }
        if (message.location) {
            return {
                Latitude  : message.location.latitude,
                Longitude : message.location.longitude,
            } as LocationMessageContent;
        }
        if (message.contact) {
            return {
                Name  : `${message.contact.first_name} ${message.contact.last_name || ''}`.trim(),
                Phone : message.contact.phone_number,
                Vcard : message.contact.vcard,
            } as ContactMessageContent;
        }

        return { Text: 'Unsupported message type' } as TextMessageContent;
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
            message.text = content.Text;
            if (content.Formatting) {
                message.entities = this.formatTextEntities(content.Formatting);
            }
            // Simple heuristic to disable web preview for links
            message.disable_web_page_preview = !this.shouldShowWebPreview(content.Text);

        } else if (isMediaMessageContent(content)) {
            return this.createMediaMessage(message, content);

        } else if (isLocationMessageContent(content)) {
            message.latitude = content.Latitude;
            message.longitude = content.Longitude;
            if (content.Name || content.Address) {
                message.text = `${content.Name || content.Address}`;
            }

        } else if (isContactMessageContent(content)) {
            const contact = content;
            message.phone_number = contact.Phone || '';
            message.first_name = contact.Name.split(' ')[0];
            message.last_name = contact.Name.split(' ').slice(1).join(' ') || undefined;
            message.vcard = content.Vcard;

        } else if (isInteractiveMessageContent(content)) {
            message.text = content.Text || '';
            message.reply_markup = this.formatInlineKeyboard(content);
        }

        return message;
    }

    private createMediaMessage(
        baseMessage: TelegramOutgoingMessage,
        content: MediaMessageContent
    ): TelegramOutgoingMessage {
        const message = { ...baseMessage };

        switch (content.MediaType) {
            case 'image':
                message.photo = content.Url;
                if (content.Caption) {
                    message.caption = content.Caption;
                }
                break;
            case 'audio':
                message.audio = content.Url;
                if (content.Caption) {
                    message.caption = content.Caption;
                }
                break;
            case 'video':
                message.video = content.Url;
                if (content.Caption) {
                    message.caption = content.Caption;
                }
                break;
            case 'document':
                message.document = content.Url;
                if (content.Caption) {
                    message.caption = content.Caption;
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

        if (interactive.Buttons) {
            let row: TelegramInlineKeyboardButton[] = [];
            interactive.Buttons.forEach((button, index) => {
                row.push({
                    text          : button.Title,
                    callback_data : button.Payload || button.Id
                });
                if ((index + 1) % 3 === 0) { // Max 3 buttons per row
                    keyboard.push(row);
                    row = [];
                }
            });
            if (row.length > 0) {
                keyboard.push(row);
            }
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
            platform  : ChannelType.Telegram,
            timestamp : new Date(message.date * 1000)
        });

        // Add Telegram-specific metadata
        if (message.forward_from) {
            metadata.ForwardedFrom = JSON.stringify({
                from      : message.forward_from,
                fromChat  : message.forward_from_chat,
                messageId : message.forward_from_message_id,
                date      : message.forward_date
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
