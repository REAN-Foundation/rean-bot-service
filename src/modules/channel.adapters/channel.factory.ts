import { container } from 'tsyringe';
import { IChannelAdapter } from '../interfaces/channel.adapter.interface';
import { ChannelType } from '../../domain.types/message.types';
import { WhatsAppAdapter } from './whatsapp.adapter';
import { TelegramAdapter } from './telegram.adapter';
import { SlackAdapter } from './slack.adapter';
import { SignalAdapter } from './signal.adapter';
import { WebChatAdapter } from './web.adapter';
import { logger } from '../../logger/logger';

export interface ChannelConfiguration {
    channelType: ChannelType;
    tenantId: string;
    isActive: boolean;
    config: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ChannelFactoryOptions {
    enableHealthChecks?: boolean;
    healthCheckInterval?: number;
    maxRetries?: number;
    retryDelay?: number;
    shutdownTimeout?: number;
}

export class ChannelFactory {

    private static instance: ChannelFactory;

    private adapters: Map<string, IChannelAdapter> = new Map();

    private configurations: Map<string, ChannelConfiguration> = new Map();

    private healthCheckInterval?: NodeJS.Timeout;

    private options: ChannelFactoryOptions;

    private constructor(options: ChannelFactoryOptions = {}) {
        this.options = {
            enableHealthChecks  : true,
            healthCheckInterval : 60000, // 1 minute
            maxRetries          : 3,
            retryDelay          : 1000,
            shutdownTimeout     : 30000,
            ...options
        };

        // Start health checks if enabled
        if (this.options.enableHealthChecks) {
            this.startHealthChecks();
        }
    }

    //#region Singleton Pattern

    public static getInstance(options?: ChannelFactoryOptions): ChannelFactory {
        if (!ChannelFactory.instance) {
            ChannelFactory.instance = new ChannelFactory(options);
        }
        return ChannelFactory.instance;
    }

    public static async shutdown(): Promise<void> {
        if (ChannelFactory.instance) {
            await ChannelFactory.instance.shutdownAllAdapters();
            ChannelFactory.instance = null as any;
        }
    }

    //#endregion

    //#region Adapter Management

    /**
     * Create and initialize a channel adapter
     */
    async createAdapter(
        channelType: ChannelType,
        tenantId: string,
        config: Record<string, any>,
        metadata?: Record<string, any>
    ): Promise<IChannelAdapter> {
        const adapterKey = this.getAdapterKey(channelType, tenantId);

        // Check if adapter already exists
        if (this.adapters.has(adapterKey)) {
            logger.warn(`Channel adapter already exists: ${channelType} - ${tenantId}`);
            return this.adapters?.get(adapterKey) as IChannelAdapter;
        }

        try {
            // Create adapter instance
            const adapter = this.instantiateAdapter(channelType);

            // Initialize adapter with retries
            await this.initializeAdapterWithRetries(adapter, config);

            // Store adapter and configuration
            this.adapters.set(adapterKey, adapter);
            this.configurations.set(adapterKey, {
                channelType,
                tenantId,
                isActive  : true,
                config,
                metadata,
                createdAt : new Date(),
                updatedAt : new Date()
            });

            logger.info(`Channel adapter created successfully: ${channelType} - ${tenantId}`);

            return adapter;

        } catch (error) {
            logger.error(`Failed to create channel adapter: ${channelType} - ${tenantId} ${error.message}`);
            throw new Error(`Failed to create ${channelType} adapter: ${error.message}`);
        }
    }

    /**
     * Get an existing adapter
     */
    getAdapter(channelType: ChannelType, tenantId: string): IChannelAdapter | null {
        const adapterKey = this.getAdapterKey(channelType, tenantId);
        return this.adapters.get(adapterKey) || null;
    }

    /**
     * Update adapter configuration
     */
    async updateAdapterConfig(
        channelType: ChannelType,
        tenantId: string,
        newConfig: Record<string, any>
    ): Promise<boolean> {
        const adapterKey = this.getAdapterKey(channelType, tenantId);
        const adapter = this.adapters.get(adapterKey);
        const configuration = this.configurations.get(adapterKey);

        if (!adapter || !configuration) {
            logger.warn(`Adapter not found for config update: ${channelType} - ${tenantId}`);
            return false;
        }

        try {
            // Shutdown existing adapter
            await adapter.shutdown();

            // Create new adapter with updated config
            const newAdapter = this.instantiateAdapter(channelType);
            await this.initializeAdapterWithRetries(newAdapter, newConfig);

            // Update stored references
            this.adapters.set(adapterKey, newAdapter);
            this.configurations.set(adapterKey, {
                ...configuration,
                config    : newConfig,
                updatedAt : new Date()
            });

            logger.info(`Adapter configuration updated: ${channelType} - ${tenantId}`);
            return true;

        } catch (error) {
            logger.error(`Failed to update adapter configuration: ${channelType} - ${tenantId} ${error.message}`);
            return false;
        }
    }

    /**
     * Remove and shutdown an adapter
     */
    async removeAdapter(channelType: ChannelType, tenantId: string): Promise<boolean> {
        const adapterKey = this.getAdapterKey(channelType, tenantId);
        const adapter = this.adapters.get(adapterKey);

        if (!adapter) {
            logger.warn(`Adapter not found for removal: ${channelType} - ${tenantId}`);
            return false;
        }

        try {
            await adapter.shutdown();
            this.adapters.delete(adapterKey);
            this.configurations.delete(adapterKey);

            logger.info(`Adapter removed successfully: ${channelType} - ${tenantId}`);
            return true;

        } catch (error) {
            logger.error(`Failed to remove adapter: ${channelType} - ${tenantId} ${error.message}`);
            return false;
        }
    }

    /**
     * List all active adapters
     */
    listAdapters(): Array<{
        channelType: ChannelType;
        tenantId: string;
        isActive: boolean;
        isHealthy: boolean;
        configuration: ChannelConfiguration;
    }> {
        const adapters: Array<any> = [];

        for (const [adapterKey, adapter] of this.adapters) {
            const configuration = this.configurations.get(adapterKey);
            if (configuration) {
                adapters.push({
                    channelType : configuration.channelType,
                    tenantId    : configuration.tenantId,
                    isActive    : adapter.isActive(),
                    isHealthy   : this.isAdapterHealthy(adapter),
                    configuration
                });
            }
        }

        return adapters;
    }

    //#endregion

    //#region Channel Type Support

    /**
     * Get all supported channel types
     */
    getSupportedChannelTypes(): ChannelType[] {
        return [
            ChannelType.WhatsApp,
            ChannelType.Telegram,
            ChannelType.Slack,
            ChannelType.Signal,
            ChannelType.Web
        ];
    }

    /**
     * Check if a channel type is supported
     */
    isChannelTypeSupported(channelType: ChannelType): boolean {
        return this.getSupportedChannelTypes().includes(channelType);
    }

    /**
     * Get channel type capabilities
     */
    getChannelCapabilities(channelType: ChannelType): {
        supportedMessageTypes: string[];
        supportedFeatures: string[];
    } {
        // Create a temporary adapter to get capabilities
        try {
            const adapter = this.instantiateAdapter(channelType);
            return {
                supportedMessageTypes : adapter.getSupportedMessageTypes(),
                supportedFeatures     : this.getChannelFeatures(channelType)
            };
        } catch (error) {
            logger.warn(`Failed to get channel capabilities: ${channelType}, { error }`);
            return {
                supportedMessageTypes : [],
                supportedFeatures     : []
            };
        }
    }

    private getChannelFeatures(channelType: ChannelType): string[] {
        const commonFeatures = ['text_messages', 'media_messages'];

        switch (channelType) {
            case ChannelType.WhatsApp:
                return [...commonFeatures, 'interactive_messages', 'templates', 'location_sharing', 'contact_sharing'];
            case ChannelType.Telegram:
                return [...commonFeatures, 'inline_keyboards', 'callback_queries', 'file_uploads', 'message_editing'];
            case ChannelType.Slack:
                return [...commonFeatures, 'interactive_components', 'blocks', 'threading', 'reactions'];
            case ChannelType.Signal:
                return [...commonFeatures, 'disappearing_messages', 'reactions', 'encryption'];
            case ChannelType.Web:
                return [...commonFeatures, 'interactive_messages', 'location_sharing', 'contact_sharing', 'file_uploads', 'real_time_messaging', 'typing_indicators', 'read_receipts', 'presence_status'];
            default:
                return commonFeatures;
        }
    }

    //#endregion

    //#region Health Monitoring

    private startHealthChecks(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthChecks();
        }, this.options.healthCheckInterval);

        logger.info(`Health checks started: ${this.options.healthCheckInterval}ms`);
    }

    private async performHealthChecks(): Promise<void> {
        const healthStatuses: Array<{
            adapterKey: string;
            channelType: ChannelType;
            tenantId: string;
            status: string;
            details?: string;
        }> = [];

        for (const [adapterKey, adapter] of this.adapters) {
            const configuration = this.configurations.get(adapterKey);
            if (!configuration) continue;

            try {
                const healthStatus = await adapter.getHealthStatus();
                healthStatuses.push({
                    adapterKey,
                    channelType : configuration.channelType,
                    tenantId    : configuration.tenantId,
                    status      : healthStatus.status,
                    details     : healthStatus.details
                });

                // Mark configuration as inactive if unhealthy
                if (healthStatus.status === 'unhealthy') {
                    configuration.isActive = false;
                    this.configurations.set(adapterKey, configuration);
                }

            } catch (error) {
                logger.error(`Health check failed: ${adapterKey}-${configuration.channelType}-${configuration.tenantId}, ${error.message}`);

                healthStatuses.push({
                    adapterKey,
                    channelType : configuration.channelType,
                    tenantId    : configuration.tenantId,
                    status      : 'unhealthy',
                    details     : error.message
                });
            }
        }

        // Log health check summary
        const healthySummary = healthStatuses.filter(h => h.status === 'healthy').length;
        const unhealthySummary = healthStatuses.filter(h => h.status === 'unhealthy').length;

        logger.info(`Health check completed: ${healthStatuses.length} adapters, ${healthySummary} healthy, ${unhealthySummary} unhealthy`);

        if (unhealthySummary > 0) {
            logger.warn(`Unhealthy adapters detected: ${healthStatuses.filter(h => h.status === 'unhealthy').length}`);
        }
    }

    private isAdapterHealthy(adapter: IChannelAdapter): boolean {
        return adapter.isActive();
    }

    //#endregion

    //#region Private Methods

    private instantiateAdapter(channelType: ChannelType): IChannelAdapter {
        switch (channelType) {
            case ChannelType.WhatsApp:
                return container.resolve(WhatsAppAdapter) as IChannelAdapter;
            case ChannelType.Telegram:
                return container.resolve(TelegramAdapter) as IChannelAdapter;
            case ChannelType.Slack:
                return container.resolve(SlackAdapter) as IChannelAdapter;
            case ChannelType.Signal:
                return container.resolve(SignalAdapter) as IChannelAdapter;
            case ChannelType.Web:
                // WebChatAdapter accepts config in constructor but can also be configured via initialize
                return new WebChatAdapter() as IChannelAdapter;
            default:
                throw new Error(`Unsupported channel type: ${channelType}`);
        }
    }

    private async initializeAdapterWithRetries(
        adapter: IChannelAdapter,
        config: Record<string, any>
    ): Promise<void> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.options?.maxRetries; attempt++) {
            try {
                await adapter.initialize(config);
                return; // Success
            } catch (error) {
                lastError = error as Error;

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (attempt < this.options.maxRetries!) {
                    logger.warn(`Adapter initialization failed, retrying (${attempt}/${this.options.maxRetries}) ${error.message}, nextRetryIn ${this.options.retryDelay}`);

                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    await this.delay(this.options.retryDelay!);
                }
            }
        }

        throw lastError || new Error('Adapter initialization failed after all retries');
    }

    private getAdapterKey(channelType: ChannelType, tenantId: string): string {
        return `${channelType}:${tenantId}`;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    //#endregion

    //#region Lifecycle Management

    /**
     * Shutdown all adapters gracefully
     */
    async shutdownAllAdapters(): Promise<void> {
        logger.info('Shutting down all channel adapters');

        // Stop health checks
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }

        // Shutdown all adapters with timeout
        const shutdownPromises = Array.from(this.adapters.entries()).map(
            async ([adapterKey, adapter]) => {
                try {
                    await Promise.race([
                        adapter.shutdown(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Shutdown timeout')),
                                this.options.shutdownTimeout)
                        )
                    ]);

                    logger.info(`Adapter shut down successfully: ${adapterKey}`);
                } catch (error) {
                    logger.error(`Failed to shutdown adapter: ${adapterKey} ${error.message}`);
                }
            }
        );

        await Promise.allSettled(shutdownPromises);

        // Clear all collections
        this.adapters.clear();
        this.configurations.clear();

        logger.info('All channel adapters shut down');
    }

    /**
     * Restart a specific adapter
     */
    async restartAdapter(channelType: ChannelType, tenantId: string): Promise<boolean> {
        const adapterKey = this.getAdapterKey(channelType, tenantId);
        const configuration = this.configurations.get(adapterKey);

        if (!configuration) {
            logger.warn(`Configuration not found for adapter restart: ${channelType} - ${tenantId}`);
            return false;
        }

        try {
            // Remove existing adapter
            await this.removeAdapter(channelType, tenantId);

            // Create new adapter
            await this.createAdapter(channelType, tenantId, configuration.config, configuration.metadata);

            logger.info(`Adapter restarted successfully: ${channelType} - ${tenantId}`);
            return true;

        } catch (error) {
            logger.error(`Failed to restart adapter: ${channelType} - ${tenantId} ${error.message}`);
            return false;
        }
    }

    /**
     * Get factory statistics
     */
    getStatistics(): {
        totalAdapters: number;
        activeAdapters: number;
        adaptersByType: Record<ChannelType, number>;
        oldestAdapter: Date | null;
        newestAdapter: Date | null;
        } {
        const configurations = Array.from(this.configurations.values());
        const adaptersByType: Record<ChannelType, number> = {} as any;

        // Count adapters by type
        for (const config of configurations) {
            adaptersByType[config.channelType] = (adaptersByType[config.channelType] || 0) + 1;
        }

        // Find oldest and newest adapters
        const creationTimes = configurations.map(c => c.createdAt).filter(Boolean) as Date[];
        const oldestAdapter = creationTimes.length > 0 ? new Date(Math.min(...creationTimes.map(d => d.getTime()))) : null;
        const newestAdapter = creationTimes.length > 0 ? new Date(Math.max(...creationTimes.map(d => d.getTime()))) : null;

        return {
            totalAdapters  : this.adapters.size,
            activeAdapters : configurations.filter(c => c.isActive).length,
            adaptersByType,
            oldestAdapter,
            newestAdapter
        };
    }

    //#endregion

}
