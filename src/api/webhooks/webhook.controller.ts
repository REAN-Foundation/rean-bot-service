import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { WebhookHandlerService } from '../../modules/services/webhook.handler.service';
import { MessageProcessingQueue } from '../../modules/queues/message.processing.queue';
import { logger } from '../../logger/logger';

@injectable()
export class WebhookController {

    constructor(
    @inject('WebhookHandlerService') private webhookHandler: WebhookHandlerService,
    @inject('MessageProcessingQueue') private messageQueue: MessageProcessingQueue
    ) {}

    async receiveWebhook(req: Request, res: Response): Promise<void> {
        try {
            const { tenantId, channel, token } = req.params;

            // Verify webhook signature
            const isValid = await this.webhookHandler.verifySignature(req, channel, token);
            if (!isValid) {
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }

            // Queue for async processing
            await this.messageQueue.addMessage({
                tenantId,
                channel,
                payload   : req.body,
                headers   : req.headers as Record<string, string>,
                timestamp : new Date()
            });

            // Respond immediately
            res.status(200).json({ received: true });

        } catch (error) {
            logger.error(`Webhook processing error: ${error}`);
            res.status(500).json({ error: 'Processing failed' });
        }
    }

    async verifyWebhook(req: Request, res: Response): Promise<void> {
        const { channel } = req.params;

        try {
            const result = await this.webhookHandler.handleVerification(req, channel);
            res.status(result.status).send(result.response);
        } catch (error) {
            logger.error(`Webhook verification error: ${error}`);
            res.status(500).json({ error: 'Verification failed' });
        }
    }

}
