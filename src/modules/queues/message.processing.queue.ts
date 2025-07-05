import * as async from 'async';
import { injectable } from 'tsyringe';
import { ApplicationContainer } from '../injections/application.injector';
import { logger } from '../../logger/logger';
import { WebhookHandlerService } from '../services/webhook.handler.service';

interface WebhookJobData {
    tenantId: string;
    channel: string;
    payload: any;
    headers: Record<string, string>;
    timestamp: Date;
}

interface QueueJob {
    id: string;
    data: WebhookJobData;
    attempts: number;
    maxAttempts: number;
}

@injectable()
export class MessageProcessingQueue {

    private queue: async.QueueObject<QueueJob>;

    private jobCounter = 0;

    constructor() {
        this.queue = async.queue(this.processMessage.bind(this), 10); // concurrency: 10
        this.setupEventHandlers();
    }

    async addMessage(data: WebhookJobData): Promise<void> {
        const job: QueueJob = {
            id          : `job_${++this.jobCounter}_${Date.now()}`,
            data,
            attempts    : 0,
            maxAttempts : 3
        };

        this.queue.push(job);
        logger.debug(`Message queued: ${job.id}`);
    }

    private async processMessage(job: QueueJob): Promise<void> {
        const { tenantId, channel, payload } = job.data;
        job.attempts++;

        // Create tenant-scoped container
        const scopedContainer = ApplicationContainer.createScopedContainer({
            tenantId,
            tenantSchema : `tenant_${tenantId}`
        } as any);

        const webhookHandler = scopedContainer.resolve('WebhookHandlerService') as WebhookHandlerService;

        try {
            await webhookHandler.processWebhook(channel, payload);
            logger.info(`Message processed successfully: tenantId=${tenantId}, channel=${channel}, jobId=${job.id}`);
        } catch (error) {
            logger.error(`Message processing failed: tenantId=${tenantId}, channel=${channel}, jobId=${job.id}, attempt=${job.attempts}, error=${error}`);

            // Retry logic
            if (job.attempts < job.maxAttempts) {
                // Exponential backoff delay
                const delay = Math.min(2000 * Math.pow(2, job.attempts - 1), 30000);
                logger.info(`Retrying job ${job.id} in ${delay}ms (attempt ${job.attempts + 1}/${job.maxAttempts})`);

                setTimeout(() => {
                    this.queue.push(job);
                }, delay);
            } else {
                logger.error(`Job ${job.id} failed after ${job.maxAttempts} attempts`);
                this.onJobFailed(job, error);
            }
        }
    }

    private setupEventHandlers(): void {
        this.queue.drain(() => {
            logger.debug('Queue drained - all jobs processed');
        });

        this.queue.error((error, job) => {
            logger.error(`Queue error for job ${job.id}: ${error}`);
        });
    }

    private onJobFailed(job: QueueJob, error: any): void {
        logger.error(`Job permanently failed: ${job.id}, error: ${error}`);
        // Could implement dead letter queue logic here
    }

    // Utility methods
    public getQueueLength(): number {
        return this.queue.length();
    }

    public getRunningJobs(): number {
        return this.queue.running();
    }

    public isPaused(): boolean {
        return this.queue.paused;
    }

    public pause(): void {
        this.queue.pause();
        logger.info('Queue paused');
    }

    public resume(): void {
        this.queue.resume();
        logger.info('Queue resumed');
    }

}
