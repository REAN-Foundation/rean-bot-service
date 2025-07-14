import {
    MessageContent,
    MessageMetadata,
    InteractiveMessageContent,
    ChannelType,
    TextMessageContent,
    MediaMessageContent,
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

export interface SlackUser {
    id: string;
    username?: string;
    name?: string;
    real_name?: string;
    display_name?: string;
    team_id?: string;
    is_bot?: boolean;
    profile?: {
        real_name?: string;
        display_name?: string;
        email?: string;
        image_24?: string;
        image_32?: string;
        image_48?: string;
        image_72?: string;
        image_192?: string;
        image_512?: string;
    };
}

export interface SlackChannel {
    id: string;
    name?: string;
    is_channel?: boolean;
    is_group?: boolean;
    is_im?: boolean;
    is_mpim?: boolean;
    is_private?: boolean;
    created?: number;
    creator?: string;
    is_archived?: boolean;
    is_general?: boolean;
    unlinked?: number;
    name_normalized?: string;
    is_shared?: boolean;
    is_ext_shared?: boolean;
    is_org_shared?: boolean;
    pending_shared?: string[];
    is_pending_ext_shared?: boolean;
    is_member?: boolean;
    is_open?: boolean;
    topic?: {
        value: string;
        creator: string;
        last_set: number;
    };
    purpose?: {
        value: string;
        creator: string;
        last_set: number;
    };
}

export interface SlackFile {
    id: string;
    created: number;
    timestamp: number;
    name?: string;
    title?: string;
    mimetype?: string;
    filetype?: string;
    pretty_type?: string;
    user?: string;
    editable?: boolean;
    size?: number;
    mode?: string;
    is_external?: boolean;
    external_type?: string;
    is_public?: boolean;
    public_url_shared?: boolean;
    display_as_bot?: boolean;
    username?: string;
    url_private?: string;
    url_private_download?: string;
    thumb_64?: string;
    thumb_80?: string;
    thumb_360?: string;
    thumb_360_w?: number;
    thumb_360_h?: number;
    thumb_480?: string;
    thumb_480_w?: number;
    thumb_480_h?: number;
    thumb_160?: string;
    thumb_720?: string;
    thumb_720_w?: number;
    thumb_720_h?: number;
    thumb_800?: string;
    thumb_800_w?: number;
    thumb_800_h?: number;
    thumb_960?: string;
    thumb_960_w?: number;
    thumb_960_h?: number;
    thumb_1024?: string;
    thumb_1024_w?: number;
    thumb_1024_h?: number;
    image_exif_rotation?: number;
    original_w?: number;
    original_h?: number;
    permalink?: string;
    permalink_public?: string;
    comments_count?: number;
    is_starred?: boolean;
    shares?: any;
    channels?: string[];
    groups?: string[];
    ims?: string[];
    has_rich_preview?: boolean;
}

export interface SlackAttachment {
    id?: number;
    color?: string;
    fallback?: string;
    title?: string;
    title_link?: string;
    text?: string;
    fields?: Array<{
        title: string;
        value: string;
        short?: boolean;
    }>;
    image_url?: string;
    thumb_url?: string;
    footer?: string;
    footer_icon?: string;
    ts?: number;
    author_name?: string;
    author_link?: string;
    author_icon?: string;
    pretext?: string;
    mrkdwn_in?: string[];
}

export interface SlackBlock {
    type: string;
    block_id?: string;
    text?: {
        type: 'plain_text' | 'mrkdwn';
        text: string;
        emoji?: boolean;
        verbatim?: boolean;
    };
    elements?: any[];
    accessory?: any;
    fields?: any[];
    image_url?: string;
    alt_text?: string;
    title?: {
        type: 'plain_text';
        text: string;
        emoji?: boolean;
    };
    dispatch_action?: boolean;
}

export interface SlackMessage {
    type: 'message';
    subtype?: string;
    ts: string;
    user?: string;
    username?: string;
    bot_id?: string;
    app_id?: string;
    team?: string;
    channel: string;
    text?: string;
    attachments?: SlackAttachment[];
    blocks?: SlackBlock[];
    files?: SlackFile[];
    upload?: boolean;
    display_as_bot?: boolean;
    thread_ts?: string;
    reply_count?: number;
    reply_users_count?: number;
    latest_reply?: string;
    reply_users?: string[];
    subscribed?: boolean;
    last_read?: string;
    unread_count?: number;
    reactions?: Array<{
        name: string;
        users: string[];
        count: number;
    }>;
    edited?: {
        user: string;
        ts: string;
    };
    is_starred?: boolean;
    pinned_to?: string[];
    permalink?: string;
    client_msg_id?: string;
    hidden?: boolean;
    deleted_ts?: string;
    event_ts?: string;
    parent_user_id?: string;
    inviter?: string;
    purpose?: string;
    name?: string;
    old_name?: string;
    members?: string[];
    topic?: string;
    x_files?: string[];
    upload_reply_to?: string;
    room?: {
        id: string;
        name: string;
    };
}

export interface SlackInteractivePayload {
    type: 'block_actions' | 'interactive_message' | 'dialog_submission' | 'message_action' | 'shortcut';
    token: string;
    action_ts: string;
    team: {
        id: string;
        domain: string;
    };
    user: SlackUser;
    channel?: SlackChannel;
    message?: SlackMessage;
    actions?: Array<{
        action_id: string;
        block_id?: string;
        type: string;
        value?: string;
        selected_option?: {
            text: {
                type: string;
                text: string;
            };
            value: string;
        };
        selected_options?: Array<{
            text: {
                type: string;
                text: string;
            };
            value: string;
        }>;
    }>;
    response_url?: string;
    trigger_id?: string;
}

export interface SlackOutgoingMessage {
    channel: string;
    text?: string;
    parse?: 'full' | 'none';
    link_names?: boolean;
    unfurl_links?: boolean;
    unfurl_media?: boolean;
    username?: string;
    as_user?: boolean;
    icon_url?: string;
    icon_emoji?: string;
    thread_ts?: string;
    reply_broadcast?: boolean;
    attachments?: SlackAttachment[];
    blocks?: SlackBlock[];
    mrkdwn?: boolean;
}

export class SlackMessageTransformer extends BaseMessageTransformer {

    getPlatformName(): string {
        return ChannelType.Slack;
    }

    //#region Incoming Message Parsing

    parseIncomingMessage(platformMessage: SlackMessage | SlackInteractivePayload): TransformedMessage {
        // Handle interactive payloads (button clicks, etc.)
        if ('actions' in platformMessage) {
            return this.parseInteractivePayload(platformMessage as SlackInteractivePayload);
        }

        const message = platformMessage as SlackMessage;

        if (!this.validateMessageStructure(message)) {
            throw new Error('Invalid Slack message structure');
        }

        const userId = this.extractUserId(message);
        const content = this.parseMessageContent(message);
        const metadata = this.createSlackMetadata(message);
        const timestamp = new Date(parseFloat(message.ts) * 1000);

        const transformed: TransformedMessage = {
            userId,
            content,
            metadata,
            timestamp,
            platformMessageId : message.ts
        };

        if (!this.validateTransformedMessage(transformed)) {
            throw new Error('Failed to create valid transformed message');
        }

        return transformed;
    }

    private parseInteractivePayload(payload: SlackInteractivePayload): TransformedMessage {
        const userId = payload.user.id;
        const content = this.parseInteractiveContent(payload);
        const metadata = this.createMetadata(payload, {
            actionTs        : payload.action_ts,
            triggerId       : payload.trigger_id,
            responseUrl     : payload.response_url,
            teamId          : payload.team.id,
            channelId       : payload.channel?.id,
            originalMessage : payload.message
        });

        return {
            userId,
            content,
            metadata,
            timestamp         : new Date(parseFloat(payload.action_ts) * 1000),
            platformMessageId : payload.action_ts
        };
    }

    private parseMessageContent(message: SlackMessage): MessageContent {

        if (message.files && message.files.length > 0) {
            const file = message.files[0];
            return {
                MediaType : this.getMediaTypeFromSlackFile(file),
                Url       : file.url_private,
                Caption   : message.text,
                Filename  : file.name,
                MimeType  : file.mimetype,
                Size      : file.size,
            } as MediaMessageContent;
        }

        if (message.blocks) {
            return this.parseBlockContent(message.blocks, message.text);
        }

        if (message.attachments) {
            return this.parseAttachmentContent(message.attachments, message.text);
        }

        if (message.text) {
            return {
                Text: this.parseSlackMarkdown(message.text)
            } as TextMessageContent;
        }

        return { Text: 'Unsupported message format' } as TextMessageContent;
    }

    private parseInteractiveContent(payload: SlackInteractivePayload): MessageContent {
        const action = payload.actions?.[0];
        if (!action) {
            return { Text: 'No action found in interactive payload' } as TextMessageContent;
        }

        const interactive: InteractiveMessageContent = {
            Type : InteractiveMessageType.Button,
            Text : payload.message?.text || 'Interactive Message',
            Buttons: [{
                Id      : action.action_id,
                Title   : action.value || action.action_id,
                Payload : action.value,
                Type    : 'reply'
            }]
        };

        return interactive;
    }

    private parseBlockContent(blocks: SlackBlock[], fallbackText?: string): MessageContent {
        let combinedText = '';
        const attachments: any[] = [];

        for (const block of blocks) {
            switch (block.type) {
                case 'section':
                    if (block.text) {
                        combinedText += this.parseSlackMarkdown(block.text.text) + '\n';
                    }
                    if (block.fields) {
                        combinedText += block.fields.map(field =>
                            `*${field.title}*: ${field.value}`
                        ).join('\n') + '\n';
                    }
                    break;

                case 'rich_text':
                    combinedText += this.parseRichTextBlock(block) + '\n';
                    break;

                case 'image':
                    attachments.push({
                        type  : 'image',
                        url   : block.image_url,
                        alt   : block.alt_text,
                        title : block.title?.text
                    });
                    break;

                case 'divider':
                    combinedText += '---\n';
                    break;

                case 'header':
                    if (block.text) {
                        combinedText += `# ${block.text.text}\n`;
                    }
                    break;
            }
        }

        const content = this.createTextContent(combinedText.trim() || fallbackText || '');

        if (attachments.length > 0) {
            (content as any).attachments = attachments;
        }

        return content;
    }

    private parseAttachmentContent(attachments: SlackAttachment[], fallbackText?: string): MessageContent {
        const attachment = attachments[0]; // Handle first attachment

        let text = attachment.fallback || attachment.text || attachment.title || fallbackText || '';

        // Add fields to text
        if (attachment.fields && attachment.fields.length > 0) {
            text += '\n' + attachment.fields.map(field =>
                `*${field.title}*: ${field.value}`
            ).join('\n');
        }

        const content = this.createTextContent(text);

        // Add rich attachment data
        (content as any).attachment = {
            color      : attachment.color,
            title      : attachment.title,
            titleLink  : attachment.title_link,
            imageUrl   : attachment.image_url,
            thumbUrl   : attachment.thumb_url,
            footer     : attachment.footer,
            footerIcon : attachment.footer_icon,
            authorName : attachment.author_name,
            authorLink : attachment.author_link,
            authorIcon : attachment.author_icon
        };

        return content;
    }

    private parseRichTextBlock(block: SlackBlock): string {
        // Parse rich text elements recursively
        if (!block.elements) return '';

        return block.elements.map(element => {
            if (element.type === 'rich_text_section') {
                return element.elements?.map((el: any) => {
                    switch (el.type) {
                        case 'text':
                            return el.text;
                        case 'link':
                            return `[${el.text || el.url}](${el.url})`;
                        case 'user':
                            return `<@${el.user_id}>`;
                        case 'channel':
                            return `<#${el.channel_id}>`;
                        default:
                            return el.text || '';
                    }
                }).join('') || '';
            }
            return '';
        }).join('\n');
    }

    private parseSlackMarkdown(text: string): string {
        if (!text) return '';

        // Convert Slack's markdown-like format to standard text
        return text
            .replace(/<@([UW][A-Z0-9]+)>/g, '@$1') // User mentions
            .replace(/<#([C][A-Z0-9]+)\|([^>]+)>/g, '#$2') // Channel mentions with names
            .replace(/<#([C][A-Z0-9]+)>/g, '#$1') // Channel mentions
            .replace(/<([^|>]+)\|([^>]+)>/g, '[$2]($1)') // Links with text
            .replace(/<([^>]+)>/g, '$1') // Plain links
            .replace(/\*([^*]+)\*/g, '$1') // Bold (remove for plain text)
            .replace(/_([^_]+)_/g, '$1') // Italic (remove for plain text)
            .replace(/~([^~]+)~/g, '$1') // Strikethrough (remove for plain text)
            .replace(/`([^`]+)`/g, '$1') // Inline code (remove for plain text)
            .replace(/```([^```]+)```/g, '$1'); // Code blocks (remove for plain text)
    }

    private getMediaTypeFromSlackFile(file: SlackFile): 'image' | 'audio' | 'video' | 'document' {
        if (!file.mimetype) return 'document';

        if (file.mimetype.startsWith('image/')) return 'image';
        if (file.mimetype.startsWith('audio/')) return 'audio';
        if (file.mimetype.startsWith('video/')) return 'video';

        return 'document';
    }

    //#endregion

    //#region Outgoing Message Formatting

    formatOutgoingMessage(
        userId: string,
        content: MessageContent,
        metadata?: MessageMetadata
    ): SlackOutgoingMessage {
        const baseMessage: SlackOutgoingMessage = {
            channel : userId
        };

        // Add thread information for replies
        if (metadata?.ReplyTo) {
            baseMessage.thread_ts = metadata.ReplyTo;
        }

        return this.addContentToMessage(baseMessage, content);
    }

    private addContentToMessage(
        message: SlackOutgoingMessage,
        content: MessageContent
    ): SlackOutgoingMessage {
        if (isTextMessageContent(content)) {
            message.text = this.formatTextForSlack(content.Text);
        } else if (isMediaMessageContent(content)) {
            message = this.addMediaContent(message, content);
        } else if (isInteractiveMessageContent(content)) {
            message.text = content.Text || '';
            message.blocks = this.formatInteractiveBlocks(content);
        } else if (isLocationMessageContent(content)) {
            message.text = `📍 Location: ${content.Latitude}, ${content.Longitude}`;
            if (content.Name || content.Address) {
                message.text += `\n${content.Name || content.Address}`;
            }
            message.text += `\nhttps://maps.google.com/?q=${content.Latitude},${content.Longitude}`;

        } else if (isContactMessageContent(content)) {
            const contact = content;
            message.text = `👤 Contact: ${contact.Name}`;
            if (contact.Phone) {
                message.text += `\n📞 ${contact.Phone}`;
            }
            if (contact.Email) {
                message.text += `\n📧 ${contact.Email}`;
            }
            if (contact.Organization) {
                message.text += `\n🏢 ${contact.Organization}`;
            }
        }
        return message;
    }

    private addMediaContent(message: SlackOutgoingMessage, content: MediaMessageContent): SlackOutgoingMessage {
        message.text = `📎 ${content.Caption || 'Media file'}`;
        message.attachments = [{
            fallback  : content.Caption || 'Media file',
            title     : content.Filename || 'File',
            text      : content.Caption || '',
            image_url : content.MediaType === 'image' ? content.Url : undefined
        }];
        return message;
    }

    private formatTextForSlack(text: string): string {
        // Convert common markdown to Slack format
        return text
            .replace(/\*\*([^*]+)\*\*/g, '*$1*') // Bold
            .replace(/\*([^*]+)\*/g, '_$1_') // Italic (if not already bold)
            .replace(/~~([^~]+)~~/g, '~$1~') // Strikethrough
            .replace(/`([^`]+)`/g, '`$1`') // Code (same)
            .replace(/```([^```]+)```/g, '```$1```'); // Code blocks (same)
    }

    private formatInteractiveBlocks(interactive: InteractiveMessageContent): SlackBlock[] {
        const blocks: SlackBlock[] = [];

        // Header
        if (interactive.Header) {
            blocks.push({
                type : 'header',
                text : {
                    type  : 'plain_text',
                    text  : interactive.Header.Content,
                    emoji : true
                }
            });
        }

        // Text
        if (interactive.Text) {
            blocks.push({
                type : 'section',
                text : {
                    type : 'mrkdwn',
                    text : interactive.Text
                }
            });
        }

        // Buttons
        if (interactive.Buttons && interactive.Buttons.length > 0) {
            blocks.push({
                type     : 'actions',
                elements : interactive.Buttons.map(btn => ({
                    type     : 'button',
                    text     : { type: 'plain_text', text: btn.Title, emoji: true },
                    value    : btn.Payload || btn.Id,
                    action_id: btn.Id
                }))
            });
        }

        // List Items
        if (interactive.ListItems && interactive.ListItems.length > 0) {
            for (const item of interactive.ListItems) {
                blocks.push({
                    type : 'section',
                    text : {
                        type : 'mrkdwn',
                        text : `*${item.Title}*\n${item.Description || ''}`
                    },
                    accessory: {
                        type     : 'button',
                        text     : { type: 'plain_text', text: 'Select', emoji: true },
                        value    : item.Payload || item.Id,
                        action_id: item.Id
                    }
                });
            }
        }

        return blocks;
    }

    //#endregion

    //#region Validation and Utility Methods

    validateMessageStructure(platformMessage: any): boolean {
        if (!platformMessage || typeof platformMessage !== 'object') {
            return false;
        }

        // Check for required fields
        const required = ['type', 'ts', 'channel'];
        for (const field of required) {
            if (!platformMessage[field]) {
                return false;
            }
        }

        // Must be a message type
        if (platformMessage.type !== 'message') {
            return false;
        }

        return true;
    }

    extractUserId(platformMessage: SlackMessage): string {
        // For DMs, use the channel ID (which is the DM channel)
        // For channels, combine channel and user ID
        if (platformMessage.channel.startsWith('D')) {
            // Direct message - use the user ID
            return platformMessage.user || platformMessage.channel;
        } else {
            // Channel message - combine channel and user
            return `${platformMessage.channel}:${platformMessage.user || 'unknown'}`;
        }
    }

    private createSlackMetadata(message: SlackMessage): MessageMetadata {
        const metadata = this.createMetadata(message, {
            platform  : ChannelType.Slack,
            timestamp : new Date(parseFloat(message.ts) * 1000)
        });

        // Add Slack-specific metadata
        if (message.thread_ts) {
            metadata.ThreadTs = message.thread_ts;
        }

        if (message.reply_count) {
            metadata.ReplyCount = message.reply_count;
        }

        if (message.reply_users) {
            metadata.ReplyUsers = message.reply_users;
        }

        if (message.edited) {
            metadata.EditedAt = new Date(parseFloat(message.edited.ts) * 1000);
            metadata.EditedBy = message.edited.user;
        }

        if (message.reactions) {
            metadata.Reactions = message.reactions.map(reaction => ({
                Emoji     : reaction.name,
                UserId    : reaction.users[0], // Take first user
                Timestamp : new Date(parseFloat(message.ts) * 1000)
            }));
        }

        return metadata;
    }

    //#endregion

}
