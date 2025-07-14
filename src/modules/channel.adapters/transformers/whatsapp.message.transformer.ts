import {
    MessageContent,
    MessageMetadata,
    ContactMessageContent,
    InteractiveMessageContent,
    MediaMessageContent,
    ChannelType,
    TextMessageContent,
    LocationMessageContent,
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

/////////////////////////////////////////////////////////////////////////////

export interface WhatsAppWebhookMessage {
    id: string;
    from: string;
    timestamp: string;
    type: string;
    text?: {
        body: string;
    };
    image?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };
    audio?: {
        id: string;
        mime_type: string;
        sha256: string;
    };
    video?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };
    document?: {
        id: string;
        mime_type: string;
        sha256: string;
        filename?: string;
        caption?: string;
    };
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    };
    contacts?: Array<{
        name: {
            formatted_name: string;
            first_name?: string;
            last_name?: string;
        };
        phones?: Array<{
            phone: string;
            type?: string;
        }>;
        emails?: Array<{
            email: string;
            type?: string;
        }>;
        org?: {
            company?: string;
        };
    }>;
    interactive?: {
        type: string;
        button_reply?: {
            id: string;
            title: string;
        };
        list_reply?: {
            id: string;
            title: string;
            description?: string;
        };
    };
    button?: {
        text: string;
        payload: string;
    };
    context?: {
        from: string;
        id: string;
    };
}

export interface WhatsAppOutgoingMessage {
    messaging_product: ChannelType.WhatsApp;
    to: string;
    type: string;
    text?: {
        body: string;
        preview_url?: boolean;
    };
    image?: {
        id?: string;
        link?: string;
        caption?: string;
    };
    audio?: {
        id?: string;
        link?: string;
    };
    video?: {
        id?: string;
        link?: string;
        caption?: string;
    };
    document?: {
        id?: string;
        link?: string;
        filename?: string;
        caption?: string;
    };
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    };
    contacts?: Array<{
        name: {
            formatted_name: string;
            first_name?: string;
            last_name?: string;
        };
        phones?: Array<{
            phone: string;
            type?: string;
        }>;
        emails?: Array<{
            email: string;
            type?: string;
        }>;
        org?: {
            company?: string;
        };
    }>;
    interactive?: {
        type: 'button' | 'list';
        header?: {
            type: 'text' | 'image' | 'video' | 'document';
            text?: string;
            image?: { id?: string; link?: string };
            video?: { id?: string; link?: string };
            document?: { id?: string; link?: string; filename?: string };
        };
        body: {
            text: string;
        };
        footer?: {
            text: string;
        };
        action: {
            buttons?: Array<{
                type: 'reply';
                reply: {
                    id: string;
                    title: string;
                };
            }>;
            button?: string;
            sections?: Array<{
                title?: string;
                rows: Array<{
                    id: string;
                    title: string;
                    description?: string;
                }>;
            }>;
        };
    };
    template?: {
        name: string;
        language: {
            code: string;
        };
        components?: Array<{
            type: string;
            parameters?: Array<{
                type: string;
                text?: string;
                image?: { link: string };
                video?: { link: string };
                document?: { link: string; filename?: string };
            }>;
        }>;
    };
    context?: {
        message_id: string;
    };
}

export class WhatsAppMessageTransformer extends BaseMessageTransformer {

    getPlatformName(): string {
        return ChannelType.WhatsApp;
    }

    //#region Incoming Message Parsing

    parseIncomingMessage(platformMessage: WhatsAppWebhookMessage): TransformedMessage {
        if (!this.validateMessageStructure(platformMessage)) {
            throw new Error('Invalid WhatsApp message structure');
        }

        const userId = this.extractUserId(platformMessage);
        const content = this.parseMessageContent(platformMessage);
        const metadata = this.createWhatsAppMetadata(platformMessage);
        const timestamp = new Date(parseInt(platformMessage.timestamp) * 1000);

        const transformed: TransformedMessage = {
            userId,
            content,
            metadata,
            timestamp,
            platformMessageId : platformMessage.id
        };

        if (!this.validateTransformedMessage(transformed)) {
            throw new Error('Failed to create valid transformed message');
        }

        return transformed;
    }

    private parseMessageContent(message: WhatsAppWebhookMessage): MessageContent {
        switch (message.type) {
            case 'text':
                return {
                    Text: this.sanitizeText(message.text?.body || '')
                } as TextMessageContent;

            case 'image':
                return {
                    MediaType : 'image',
                    Url       : `whatsapp://media/${message.image?.id}`,
                    Caption   : message.image?.caption,
                } as MediaMessageContent;

            case 'audio':
                return {
                    MediaType : 'audio',
                    Url       : `whatsapp://media/${message.audio?.id}`,
                } as MediaMessageContent;

            case 'video':
                return {
                    MediaType : 'video',
                    Url       : `whatsapp://media/${message.video?.id}`,
                    Caption   : message.video?.caption,
                } as MediaMessageContent;

            case 'document':
                return {
                    MediaType : 'document',
                    Url       : `whatsapp://media/${message.document?.id}`,
                    Caption   : message.document?.caption,
                    Filename  : message.document?.filename,
                } as MediaMessageContent;

            case 'location':
                return {
                    Latitude  : message.location.latitude,
                    Longitude : message.location.longitude,
                    Name      : message.location.name,
                    Address   : message.location.address,
                } as LocationMessageContent;

            case 'contacts':
                const contact = message.contacts[0];
                return {
                    Name         : contact.name.formatted_name,
                    Phone        : contact.phones?.[0]?.phone,
                    Email        : contact.emails?.[0]?.email,
                    Organization : contact.org?.company
                } as ContactMessageContent;

            case 'interactive':
                return this.parseInteractiveMessage(message);

            default:
                return { Text: 'Unsupported message type' } as TextMessageContent;
        }
    }

    private parseInteractiveMessage(message: WhatsAppWebhookMessage): MessageContent {
        const interactive = message.interactive;
        if (interactive.type === 'button_reply') {
            return {
                Type : InteractiveMessageType.Button,
                Text : interactive.button_reply.title,
                Buttons: [{
                    Id      : interactive.button_reply.id,
                    Title   : interactive.button_reply.title,
                    Type    : 'reply',
                    Payload : interactive.button_reply.id
                }]
            } as InteractiveMessageContent;
        }
        if (interactive.type === 'list_reply') {
            return {
                Type : InteractiveMessageType.List,
                Text : interactive.list_reply.title,
                ListItems: [{
                    Id          : interactive.list_reply.id,
                    Title       : interactive.list_reply.title,
                    Description : interactive.list_reply.description,
                    Payload     : interactive.list_reply.id
                }]
            } as InteractiveMessageContent;
        }
        return { Text: 'Unsupported interactive message' } as TextMessageContent;
    }

    //#endregion

    //#region Outgoing Message Formatting

    formatOutgoingMessage(
        userId: string,
        content: MessageContent,
        metadata?: MessageMetadata
    ): WhatsAppOutgoingMessage {
        const baseMessage: WhatsAppOutgoingMessage = {
            messaging_product : ChannelType.WhatsApp,
            to                : userId,
            type              : this.getWhatsAppMessageType(content)
        };

        // Add context for replies
        if (metadata?.ReplyTo) {
            baseMessage.context = {
                message_id : metadata.ReplyTo
            };
        }

        return this.addContentToMessage(baseMessage, content);
    }

    private getWhatsAppMessageType(content: MessageContent): string {
        if (isTextMessageContent(content)) return 'text';
        if (isMediaMessageContent(content)) return content.MediaType;
        if (isLocationMessageContent(content)) return 'location';
        if (isContactMessageContent(content)) return 'contacts';
        if (isInteractiveMessageContent(content)) return 'interactive';
        return 'text';
    }

    private addContentToMessage(
        message: WhatsAppOutgoingMessage,
        content: MessageContent
    ): WhatsAppOutgoingMessage {
        if (isTextMessageContent(content)) {
            message.text = {
                body        : content.Text,
                preview_url : this.hasUrl(content.Text)
            };
        } else if (isMediaMessageContent(content)) {
            this.addMediaContent(message, content);
        } else if (isLocationMessageContent(content)) {
            message.location = {
                latitude  : content.Latitude,
                longitude : content.Longitude,
                name      : content.Name,
                address   : content.Address
            };
        } else if (isContactMessageContent(content)) {
            message.contacts = this.formatContactsForWhatsApp([content]);
        } else if (isInteractiveMessageContent(content)) {
            message.interactive = this.formatInteractiveForWhatsApp(content);
        }
        return message;
    }

    private addMediaContent(message: WhatsAppOutgoingMessage, content: MediaMessageContent): void {
        const mediaType = content.MediaType;
        const mediaData: any = {
            link : content.Url
        };

        if (content.Caption) {
            mediaData.caption = content.Caption;
        }

        if (mediaType === 'document' && content.Filename) {
            mediaData.filename = content.Filename;
        }

        message[mediaType as keyof WhatsAppOutgoingMessage] = mediaData;
    }

    private formatContactsForWhatsApp(contacts: ContactMessageContent[]): any[] {
        return contacts.map(contact => ({
            name: {
                formatted_name : contact.Name,
                first_name     : contact.Name.split(' ')[0]
            },
            phones: contact.Phone ? [{
                phone : contact.Phone,
                type  : 'main'
            }] : undefined,
            emails: contact.Email ? [{
                email : contact.Email,
                type  : 'work'
            }] : undefined,
            org: contact.Organization ? {
                company: contact.Organization
            } : undefined
        }));
    }

    private formatInteractiveForWhatsApp(interactive: InteractiveMessageContent): any {
        const action: any = {};
        if (interactive.Buttons) {
            action.buttons = interactive.Buttons.map(b => ({
                type  : 'reply',
                reply : { id: b.Id, title: b.Title }
            }));
        } else if (interactive.ListItems) {
            action.button = interactive.Text || 'Select an option';
            action.sections = [{
                title : interactive.Header?.Content || 'Options',
                rows  : interactive.ListItems.map(item => ({
                    id          : item.Id,
                    title       : item.Title,
                    description : item.Description
                }))
            }];
        }

        const interactivePayload = {
            type   : interactive.Type,
            header : interactive.Header ? {
                type    : interactive.Header.Type,
                text    : interactive.Header.Content,
                // TODO: Add support for other header types
            } : undefined,
            body: {
                text: interactive.Text
            },
            footer: interactive.Footer ? {
                text: interactive.Footer
            } : undefined,
            action
        };
        return interactivePayload;
    }

    //#endregion

    //#region Validation and Utility Methods

    validateMessageStructure(platformMessage: any): boolean {
        if (!platformMessage || typeof platformMessage !== 'object') {
            return false;
        }

        const required = ['id', 'from', 'timestamp', 'type'];
        for (const field of required) {
            if (!platformMessage[field]) {
                return false;
            }
        }

        // Validate based on message type
        switch (platformMessage.type) {
            case 'text':
                return !!(platformMessage.text?.body);
            case 'image':
            case 'audio':
            case 'video':
            case 'document':
                return !!(platformMessage[platformMessage.type]?.id);
            case 'location':
                return !!(platformMessage.location?.latitude && platformMessage.location?.longitude);
            case 'contacts':
                return Array.isArray(platformMessage.contacts) && platformMessage.contacts.length > 0;
            case 'interactive':
                return !!(platformMessage.interactive);
            case 'button':
                return !!(platformMessage.button);
            default:
                return true; // Allow unknown types to pass through
        }
    }

    extractUserId(platformMessage: WhatsAppWebhookMessage): string {
        return platformMessage.from;
    }

    private createWhatsAppMetadata(message: WhatsAppWebhookMessage): MessageMetadata {
        const metadata = this.createMetadata(message, {
            platform  : ChannelType.WhatsApp,
            timestamp : new Date(parseInt(message.timestamp) * 1000)
        });

        // Add WhatsApp-specific metadata
        if (message.context) {
            metadata.ReplyTo = message.context.id;
            metadata.QuotedFrom = message.context.from;
        }

        return metadata;
    }

    private hasUrl(text: string): boolean {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return urlRegex.test(text);
    }

    //#endregion

}
