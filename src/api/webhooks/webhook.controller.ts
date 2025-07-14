import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { WebhookHandlerService } from '../../modules/services/webhook.handler.service';
import { MessageProcessingQueue } from '../../modules/queues/message.processing.queue';
import { logger } from '../../logger/logger';
import { InMessageQueueJobData } from '../../modules/queues/queue.types';
import { StringUtils } from '../../common/utilities/string.utils';

///////////////////////////////////////////////////////////////////////////////

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
            const data: InMessageQueueJobData = {
                JobId     : StringUtils.generateDisplayCode_RandomChars(12, 'MsgJob'),
                TenantId  : tenantId,
                Channel   : channel,
                Payload   : req.body,
                Headers   : req.headers as Record<string, string>,
                Timestamp : new Date()
            };
            await this.messageQueue.addMessage(data);

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
