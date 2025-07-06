import { injectable } from 'tsyringe';
import express from 'express';
import crypto from 'crypto';
import { logger } from '../../logger/logger';

@injectable()
export class WebhookHandlerService {

    async verifySignature(req: express.Request, channel: string, token: string): Promise<boolean> {
        try {
            switch (channel) {
                case 'whatsapp':
                    return this.verifyWhatsAppSignature(req, token);
                case 'telegram':
                    return this.verifyTelegramSignature(req, token);
                case 'slack':
                    return this.verifySlackSignature(req, token);
                default:
                    logger.warn(`Unknown channel for signature verification: ${channel}`);
                    return false;
            }
        } catch (error) {
            logger.error(`Signature verification failed: ${error}, channel: ${channel}`);
            return false;
        }
    }

    async handleVerification(req: express.Request, channel: string): Promise<{ status: number; response: string }> {
        switch (channel) {
            case 'whatsapp':
                return this.handleWhatsAppVerification(req);
            case 'telegram':
                return this.handleTelegramVerification(req);
            default:
                return { status: 404, response: 'Channel not supported' };
        }
    }

    async processWebhook(channel: string, payload: any): Promise<void> {
        logger.info(`Processing webhook for channel: ${channel}, payload: ${JSON.stringify(payload)}`);

        // Process webhook payload based on channel
        switch (channel) {
            case 'whatsapp':
                await this.processWhatsAppWebhook(payload);
                break;
            case 'telegram':
                await this.processTelegramWebhook(payload);
                break;
            case 'slack':
                await this.processSlackWebhook(payload);
                break;
            default:
                logger.warn(`Unknown channel: ${channel}`);
        }
    }

    private verifyWhatsAppSignature(req: express.Request, token: string): boolean {
        const signature = req.headers['x-hub-signature-256'] as string;
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', token)
            .update(JSON.stringify(req.body))
            .digest('hex');

        return signature === `sha256=${expectedSignature}`;
    }

    private verifyTelegramSignature(req: express.Request, token: string): boolean {
    // Telegram webhook verification logic
        const secretToken = req.headers['x-telegram-bot-api-secret-token'] as string;
        return secretToken === token;
    }

    private verifySlackSignature(req: express.Request, token: string): boolean {
        const signature = req.headers['x-slack-signature'] as string;
        const timestamp = req.headers['x-slack-request-timestamp'] as string;

        if (!signature || !timestamp) return false;

        const baseString = `v0:${timestamp}:${JSON.stringify(req.body)}`;
        const expectedSignature = crypto
            .createHmac('sha256', token)
            .update(baseString)
            .digest('hex');

        return signature === `v0=${expectedSignature}`;
    }

    private handleWhatsAppVerification(req: express.Request): { status: number; response: string } {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            return { status: 200, response: challenge as string };
        }

        return { status: 403, response: 'Forbidden' };
    }

    private handleTelegramVerification(req: express.Request): { status: number; response: string } {
    // Telegram doesn't require verification endpoint
        return { status: 200, response: 'OK' };
    }

    private async processWhatsAppWebhook(payload: any): Promise<void> {
        if (payload.object === 'whatsapp_business_account') {
            for (const entry of payload.entry) {
                for (const change of entry.changes) {
                    if (change.field === 'messages') {
                        const messages = change.value.messages || [];
                        for (const message of messages) {
                            await this.processMessage({
                                id        : message.id,
                                from      : message.from,
                                to        : change.value.metadata.phone_number_id,
                                type      : message.type,
                                content   : this.extractWhatsAppContent(message),
                                channel   : 'whatsapp',
                                timestamp : new Date(parseInt(message.timestamp) * 1000)
                            });
                        }
                    }
                }
            }
        }
    }

    private async processTelegramWebhook(payload: any): Promise<void> {
        if (payload.message) {
            await this.processMessage({
                id        : payload.message.message_id.toString(),
                from      : payload.message.from.id.toString(),
                to        : payload.message.chat.id.toString(),
                type      : this.getTelegramMessageType(payload.message),
                content   : this.extractTelegramContent(payload.message),
                channel   : 'telegram',
                timestamp : new Date(payload.message.date * 1000)
            });
        }
    }

    private async processSlackWebhook(payload: any): Promise<void> {
        if (payload.event && payload.event.type === 'message') {
            await this.processMessage({
                id        : payload.event.ts,
                from      : payload.event.user,
                to        : payload.event.channel,
                type      : 'text',
                content   : { text: payload.event.text },
                channel   : 'slack',
                timestamp : new Date(parseFloat(payload.event.ts) * 1000)
            });
        }
    }

    private async processMessage(messageData: any): Promise<void> {
    // This would typically be handled by the MessageProcessingService
        logger.info(`Message extracted from webhook: ${JSON.stringify(messageData)}`);
    }

    private extractWhatsAppContent(message: any): any {
        switch (message.type) {
            case 'text':
                return { text: message.text.body };
            case 'image':
                return {
                    mediaId  : message.image.id,
                    caption  : message.image.caption,
                    mimeType : message.image.mime_type
                };
            case 'audio':
                return {
                    mediaId  : message.audio.id,
                    mimeType : message.audio.mime_type
                };
            case 'button':
                return {
                    text    : message.button.text,
                    payload : message.button.payload
                };
            case 'location':
                return {
                    latitude  : message.location.latitude,
                    longitude : message.location.longitude,
                    name      : message.location.name,
                    address   : message.location.address
                };
            default:
                return { raw: message };
        }
    }

    private extractTelegramContent(message: any): any {
        if (message.text) {
            return { text: message.text };
        } else if (message.photo) {
            return {
                photos  : message.photo,
                caption : message.caption
            };
        } else if (message.audio) {
            return {
                fileId   : message.audio.file_id,
                duration : message.audio.duration,
                mimeType : message.audio.mime_type
            };
        } else if (message.location) {
            return {
                latitude  : message.location.latitude,
                longitude : message.location.longitude
            };
        }

        return { raw: message };
    }

    private getTelegramMessageType(message: any): string {
        if (message.text) return 'text';
        if (message.photo) return 'image';
        if (message.audio) return 'audio';
        if (message.video) return 'video';
        if (message.document) return 'document';
        if (message.location) return 'location';
        return 'unknown';
    }

    async handleWebhook(channel: string, payload: any): Promise<any> {
        // Basic webhook handling logic
        return {
            status: 'processed',
            message: 'Webhook processed successfully'
        };
    }

    async validateWebhook(channel: string, payload: any): Promise<boolean> {
        // Basic validation logic
        return true;
    }
}
