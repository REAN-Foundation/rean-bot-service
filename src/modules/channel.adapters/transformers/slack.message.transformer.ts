import {
    MessageContent,
    MessageMetadata,
    isTextMessageContent,
    isMediaMessageContent,
    isLocationMessageContent,
    isContactMessageContent,
    isInteractiveMessageContent,
    InteractiveMessageContent
} from '../../../domain.types/message.types';
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
        return 'slack';
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
        // Handle file uploads
        if (message.files && message.files.length > 0) {
            const file = message.files[0]; // Handle first file
            return this.createMediaContent(
                this.getMediaTypeFromSlackFile(file),
                file.url_private || file.permalink || '',
                message.text || file.title,
                {
                    fileId             : file.id,
                    filename           : file.name,
                    title              : file.title,
                    mimeType           : file.mimetype,
                    fileType           : file.filetype,
                    size               : file.size,
                    isPublic           : file.is_public,
                    thumbUrl           : file.thumb_360 || file.thumb_160,
                    originalDimensions : file.original_w && file.original_h ? {
                        width  : file.original_w,
                        height : file.original_h
                    } : undefined
                }
            );
        }

        // Handle rich message with blocks
        if (message.blocks && message.blocks.length > 0) {
            return this.parseBlockContent(message.blocks, message.text);
        }

        // Handle message with attachments
        if (message.attachments && message.attachments.length > 0) {
            return this.parseAttachmentContent(message.attachments, message.text);
        }

        // Handle plain text message
        if (message.text) {
            return this.createTextContent(
                this.parseSlackMarkdown(message.text)
            );
        }

        // Handle subtypes
        switch (message.subtype) {
            case 'file_share':
                return this.createTextContent('File shared');
            case 'channel_join':
                return this.createTextContent('User joined channel');
            case 'channel_leave':
                return this.createTextContent('User left channel');
            case 'channel_topic':
                return this.createTextContent(`Topic changed: ${message.topic}`);
            case 'channel_purpose':
                return this.createTextContent(`Purpose changed: ${message.purpose}`);
            case 'channel_name':
                return this.createTextContent(`Channel renamed from ${message.old_name} to ${message.name}`);
            default:
                return this.createTextContent(message.text || 'Message received');
        }
    }

    private parseInteractiveContent(payload: SlackInteractivePayload): MessageContent {
        if (payload.actions && payload.actions.length > 0) {
            const action = payload.actions[0];

            return this.createInteractiveContent(
                'button_click',
                action.value || action.selected_option?.value,
                [{
                    id      : action.action_id,
                    title   : action.selected_option?.text?.text || action.value || 'Button clicked',
                    payload : action.value
                }]
            );
        }

        return this.createTextContent('Interactive action received');
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
            channel: userId
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
            message.text = this.formatTextForSlack(content.text);
        } else if (isMediaMessageContent(content)) {
            message.text = `📎 ${content.caption || 'Media file'}`;
            message.attachments = [{
                fallback: content.caption || 'Media file',
                title: content.filename || 'File',
                text: content.caption || '',
                image_url: content.mediaType === 'image' ? content.url : undefined
            }];
        } else if (isInteractiveMessageContent(content)) {
            message.text = content.text || '';
            message.blocks = this.formatInteractiveBlocks(content);
        } else if (isLocationMessageContent(content)) {
            message.text = `📍 Location: ${content.latitude}, ${content.longitude}`;
            if (content.name || content.address) {
                message.text += `\n${content.name || content.address}`;
            }
            message.text += `\nhttps://maps.google.com/?q=${content.latitude},${content.longitude}`;
        } else if (isContactMessageContent(content)) {
            const contact = content;
            message.text = `👤 Contact: ${contact.name}`;
            if (contact.phone) {
                message.text += `\n📞 ${contact.phone}`;
            }
            if (contact.email) {
                message.text += `\n📧 ${contact.email}`;
            }
            if (contact.organization) {
                message.text += `\n🏢 ${contact.organization}`;
            }
        }

        return message;
    }

    private addMediaContent(message: SlackOutgoingMessage, content: any): SlackOutgoingMessage {
        // For media, we use blocks with image/file elements
        const blocks: SlackBlock[] = [];

        if (content.caption) {
            blocks.push({
                type : 'section',
                text : {
                    type : 'mrkdwn',
                    text : content.caption
                }
            });
        }

        if (content.type === 'image') {
            blocks.push({
                type      : 'image',
                image_url : content.url,
                alt_text  : content.caption || 'Image'
            });
        } else {
            // For non-images, create a context block with file info
            blocks.push({
                type : 'section',
                text : {
                    type : 'mrkdwn',
                    text : `📎 <${content.url}|${content.filename || 'Download File'}>`
                }
            });
        }

        message.blocks = blocks;
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

        // Add header if available
        if (interactive.header) {
            blocks.push({
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: interactive.header.content
                }
            });
        }

        // Add body text
        if (interactive.text) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: interactive.text
                }
            });
        }

        // Add buttons if available
        if (interactive.buttons && interactive.buttons.length > 0) {
            const elements = interactive.buttons.map(button => ({
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: button.title
                },
                value: button.payload || button.id,
                action_id: button.id
            }));

            blocks.push({
                type: 'actions',
                elements
            });
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
            platform: 'slack',
            timestamp: new Date(parseFloat(message.ts) * 1000)
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
                Emoji: reaction.name,
                UserId: reaction.users[0], // Take first user
                Timestamp: new Date(parseFloat(message.ts) * 1000)
            }));
        }

        return metadata;
    }

    //#endregion

}
