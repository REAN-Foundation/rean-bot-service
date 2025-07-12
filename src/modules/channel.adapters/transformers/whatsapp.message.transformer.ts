import {
    MessageContent,
    MessageMetadata
} from '../../../domain.types/message.types';
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
    messaging_product: 'whatsapp';
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
        return 'whatsapp';
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
            platformMessageId: platformMessage.id
        };

        if (!this.validateTransformedMessage(transformed)) {
            throw new Error('Failed to create valid transformed message');
        }

        return transformed;
    }

    private parseMessageContent(message: WhatsAppWebhookMessage): MessageContent {
        switch (message.type) {
            case 'text':
                return this.createTextContent(
                    this.sanitizeText(message.text?.body || '')
                );

            case 'image':
                return this.createMediaContent(
                    'image',
                    `whatsapp://media/${message.image?.id}`,
                    message.image?.caption,
                    {
                        mimeType: message.image?.mime_type,
                        sha256: message.image?.sha256,
                        whatsappId: message.image?.id
                    }
                );

            case 'audio':
                return this.createMediaContent(
                    'audio',
                    `whatsapp://media/${message.audio?.id}`,
                    undefined,
                    {
                        mimeType: message.audio?.mime_type,
                        sha256: message.audio?.sha256,
                        whatsappId: message.audio?.id
                    }
                );

            case 'video':
                return this.createMediaContent(
                    'video',
                    `whatsapp://media/${message.video?.id}`,
                    message.video?.caption,
                    {
                        mimeType: message.video?.mime_type,
                        sha256: message.video?.sha256,
                        whatsappId: message.video?.id
                    }
                );

            case 'document':
                return this.createMediaContent(
                    'document',
                    `whatsapp://media/${message.document?.id}`,
                    message.document?.caption,
                    {
                        filename: message.document?.filename,
                        mimeType: message.document?.mime_type,
                        sha256: message.document?.sha256,
                        whatsappId: message.document?.id
                    }
                );

            case 'location':
                return this.createLocationContent(
                    message.location!.latitude,
                    message.location!.longitude,
                    message.location?.name,
                    message.location?.address
                );

            case 'contacts':
                return this.createContactContent(
                    message.contacts?.map(contact => ({
                        name: contact.name.formatted_name,
                        phones: contact.phones?.map(p => p.phone) || [],
                        emails: contact.emails?.map(e => e.email) || [],
                        organization: contact.org?.company
                    })) || []
                );

            case 'interactive':
                return this.parseInteractiveMessage(message);

            case 'button':
                return this.createInteractiveContent(
                    'button_reply',
                    message.button?.text,
                    [{
                        id: message.button?.payload || '',
                        title: message.button?.text || ''
                    }]
                );

            default:
                return this.createTextContent(`Unsupported message type: ${message.type}`);
        }
    }

    private parseInteractiveMessage(message: WhatsAppWebhookMessage): MessageContent {
        const interactive = message.interactive!;

        if (interactive.button_reply) {
            return this.createInteractiveContent(
                'button_reply',
                interactive.button_reply.title,
                [{
                    id: interactive.button_reply.id,
                    title: interactive.button_reply.title
                }]
            );
        }

        if (interactive.list_reply) {
            return this.createInteractiveContent(
                'list_reply',
                interactive.list_reply.title,
                undefined,
                [{
                    id: interactive.list_reply.id,
                    title: interactive.list_reply.title,
                    description: interactive.list_reply.description
                }]
            );
        }

        return this.createTextContent('Interactive message received');
    }

    //#endregion

    //#region Outgoing Message Formatting

    formatOutgoingMessage(
        userId: string,
        content: MessageContent,
        metadata?: MessageMetadata
    ): WhatsAppOutgoingMessage {
        const baseMessage: WhatsAppOutgoingMessage = {
            messaging_product: 'whatsapp',
            to: userId,
            type: this.getWhatsAppMessageType(content)
        };

        // Add context for replies
        if (metadata?.replyTo) {
            baseMessage.context = {
                message_id: metadata.replyTo
            };
        }

        return this.addContentToMessage(baseMessage, content);
    }

    private getWhatsAppMessageType(content: MessageContent): string {
        if (content.text) return 'text';
        if (content.type) return content.type;
        if (content.latitude !== undefined) return 'location';
        if (content.contacts) return 'contacts';
        if (content.interactive) return 'interactive';
        return 'text';
    }

    private addContentToMessage(
        message: WhatsAppOutgoingMessage,
        content: MessageContent
    ): WhatsAppOutgoingMessage {
        if (content.text) {
            message.text = {
                body: content.text,
                preview_url: this.hasUrl(content.text)
            };
        } else if (content.type) {
            this.addMediaContent(message, content);
        } else if (content.latitude !== undefined) {
            message.location = {
                latitude: content.latitude,
                longitude: content.longitude!,
                name: content.name,
                address: content.address
            };
        } else if (content.contacts) {
            message.contacts = this.formatContactsForWhatsApp(content.contacts);
        } else if (content.interactive) {
            message.interactive = this.formatInteractiveForWhatsApp(content.interactive);
        }

        return message;
    }

    private addMediaContent(message: WhatsAppOutgoingMessage, content: any): void {
        const mediaType = content.type;
        const mediaData: any = {
            link: content.url
        };

        if (content.caption) {
            mediaData.caption = content.caption;
        }

        if (mediaType === 'document' && content.filename) {
            mediaData.filename = content.filename;
        }

        message[mediaType as keyof WhatsAppOutgoingMessage] = mediaData;
    }

    private formatContactsForWhatsApp(contacts: any[]): any[] {
        return contacts.map(contact => ({
            name: {
                formatted_name: contact.name,
                first_name: contact.firstName,
                last_name: contact.lastName
            },
            phones: contact.phones?.map((phone: string) => ({
                phone,
                type: 'CELL'
            })),
            emails: contact.emails?.map((email: string) => ({
                email,
                type: 'WORK'
            })),
            org: contact.organization ? {
                company: contact.organization
            } : undefined
        }));
    }

    private formatInteractiveForWhatsApp(interactive: any): any {
        const formatted: any = {
            type: interactive.type,
            body: {
                text: interactive.body || ''
            }
        };

        if (interactive.header) {
            formatted.header = interactive.header;
        }

        if (interactive.type === 'button' && interactive.buttons) {
            formatted.action = {
                buttons: interactive.buttons.map((btn: any) => ({
                    type: 'reply',
                    reply: {
                        id: btn.id,
                        title: btn.title
                    }
                }))
            };
        } else if (interactive.type === 'list' && interactive.listItems) {
            formatted.action = {
                button: 'Select an option',
                sections: [{
                    rows: interactive.listItems.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        description: item.description
                    }))
                }]
            };
        }

        return formatted;
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
            whatsappMessageId: message.id,
            messageType: message.type
        });

        // Add context information if available
        if (message.context) {
            metadata.replyTo = message.context.id;
            metadata.quotedFrom = message.context.from;
        }

        return metadata;
    }

    private hasUrl(text: string): boolean {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return urlRegex.test(text);
    }

    //#endregion

}
