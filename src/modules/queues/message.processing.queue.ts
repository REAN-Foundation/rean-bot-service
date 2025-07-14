import * as async from 'async';
import { injectable } from 'tsyringe';
import { logger } from '../../logger/logger';
import { WebhookHandlerService } from '../services/webhook.handler.service';
import { InMessageQueueJob, InMessageQueueJobData } from './queue.types';
import JobScopedInjector from './job.scoped.injector';

///////////////////////////////////////////////////////////////////////////////

@injectable()
export class MessageProcessingQueue {

    private queue: async.QueueObject<InMessageQueueJob>;

    private readonly MAX_ATTEMPTS: number = 3;

    private readonly MAX_CONCURRENCY: number = 10;

    constructor() {
        this.queue = async.queue(this.processMessage.bind(this), this.MAX_CONCURRENCY);
        this.setupEventHandlers();
    }

    async addMessage(data: InMessageQueueJobData): Promise<void> {
        const job: InMessageQueueJob = {
            id          : data.JobId,
            Data        : data,
            Attempts    : 0,
            MaxAttempts : this.MAX_ATTEMPTS
        };

        this.queue.push(job);
        logger.debug(`Message queued: ${job.id}`);
    }

    private async processMessage(job: InMessageQueueJob): Promise<void> {
        const { TenantId: tenantId, Channel: channel, Payload: payload } = job.Data;
        job.Attempts++;

        // Create tenant-scoped container
        const scopedContainer = JobScopedInjector.createScopedContainer();

        const webhookHandler = scopedContainer.resolve('WebhookHandlerService') as WebhookHandlerService;

        try {
            await webhookHandler.handleWebhook(channel, payload);
            logger.info(`Message processed successfully: tenantId=${tenantId}, channel=${channel}, jobId=${job.id}`);
        } catch (error) {
            logger.error(`Message processing failed: tenantId=${tenantId}, channel=${channel}, jobId=${job.id}, attempt=${job.Attempts}, error=${error}`);

            // Retry logic
            if (job.Attempts < job.MaxAttempts) {
                // Exponential backoff delay
                const delay = Math.min(2000 * Math.pow(2, job.Attempts - 1), 30000);
                logger.info(`Retrying job ${job.id} in ${delay}ms (attempt ${job.Attempts + 1}/${job.MaxAttempts})`);

                setTimeout(() => {
                    this.queue.push(job);
                }, delay);
            } else {
                logger.error(`Job ${job.id} failed after ${job.MaxAttempts} attempts`);
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

    private onJobFailed(job: InMessageQueueJob, error: any): void {
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
