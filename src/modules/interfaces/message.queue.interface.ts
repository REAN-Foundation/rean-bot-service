export interface QueueJob<T = any> {
    id: string;
    data: T;
    priority?: number;
    delay?: number;
    attempts?: number;
    maxAttempts?: number;
    createdAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    error?: string;
}

export interface QueueOptions {
    concurrency?: number;
    maxRetries?: number;
    retryDelay?: number;
    defaultJobOptions?: {
        priority?: number;
        delay?: number;
        maxAttempts?: number;
    };
}

export interface QueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
}

export interface IMessageQueue {

    //#region Core Operations

    /**
     * Initialize the queue with options
     */
    initialize(options: QueueOptions): Promise<void>;

    /**
     * Add a job to the queue
     */
    addJob<T>(
        jobType: string,
        data: T,
        options?: {
            priority?: number;
            delay?: number;
            maxAttempts?: number;
        }
    ): Promise<QueueJob<T>>;

    /**
     * Process jobs of a specific type
     */
    processJobs<T>(
        jobType: string,
        processor: (job: QueueJob<T>) => Promise<void>
    ): Promise<void>;

    /**
     * Remove a job from the queue
     */
    removeJob(jobId: string): Promise<boolean>;

    //#endregion

    //#region Queue Management

    /**
     * Pause the queue
     */
    pause(): Promise<void>;

    /**
     * Resume the queue
     */
    resume(): Promise<void>;

    /**
     * Check if queue is paused
     */
    isPaused(): boolean;

    /**
     * Drain the queue (wait for all jobs to complete)
     */
    drain(): Promise<void>;

    /**
     * Clear all jobs from the queue
     */
    clear(): Promise<void>;

    //#endregion

    //#region Monitoring

    /**
     * Get queue statistics
     */
    getStats(): Promise<QueueStats>;

    /**
     * Get jobs by status
     */
    getJobs(
        status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
        limit?: number,
        offset?: number
    ): Promise<QueueJob[]>;

    /**
     * Get job by ID
     */
    getJob(jobId: string): Promise<QueueJob | null>;

    /**
     * Get queue health status
     */
    getHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: {
            queueSize: number;
            processingRate: number;
            errorRate: number;
            lastProcessed: Date;
        };
    }>;

    //#endregion

    //#region Event Handling

    /**
     * Register event listeners
     */
    onJobCompleted(callback: (job: QueueJob) => void): void;
    onJobFailed(callback: (job: QueueJob, error: Error) => void): void;
    onJobProgress(callback: (job: QueueJob, progress: number) => void): void;

    //#endregion

    //#region Cleanup

    /**
     * Shutdown the queue gracefully
     */
    shutdown(): Promise<void>;

    //#endregion

}
