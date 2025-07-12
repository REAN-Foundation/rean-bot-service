import { container } from 'tsyringe';
import { IChannelAdapter } from '../interfaces/channel.adapter.interface';
import {
    MessageContent,
    MessageMetadata,
    ChannelType,
    DeliveryStatus
} from '../../domain.types/message.types';
import {
    WebMessageTransformer,
    WebChatMessage,
    WebChatOutgoingMessage,
    WebChatSession,
    WebChatUser,
    WebChatTypingIndicator,
    WebChatDeliveryReceipt
} from './transformers/web.message.transformer';
import { EventEmitter } from 'events';
import * as WebSocket from 'ws';
import { logger } from '../../logger/logger';

export interface WebChatConfig {
    port: number;
    host?: string;
    maxConnections?: number;
    sessionTimeout?: number; // minutes
    pingInterval?: number; // milliseconds
    allowedOrigins?: string[];
    enableCors?: boolean;
    rateLimitPerMinute?: number;
    fileUploadConfig?: {
        maxFileSize: number; // bytes
        allowedTypes: string[];
        uploadPath: string;
        enableThumbnails?: boolean;
    };
    features?: {
        enableTypingIndicators?: boolean;
        enablePresence?: boolean;
        enableFileUpload?: boolean;
        enableReadReceipts?: boolean;
        enableMessageHistory?: boolean;
        enableMultipleDevices?: boolean;
    };
}

export interface WebChatConnection {
    id: string;
    socket: WebSocket;
    userId: string;
    sessionId: string;
    isAuthenticated: boolean;
    lastActivity: Date;
    metadata?: Record<string, any>;
}

export class WebChatAdapter extends EventEmitter implements IChannelAdapter {

    private _transformer: WebMessageTransformer;

    private _isInitialized = false;

    private _config: WebChatConfig;

    private _server: WebSocket.Server | null = null;

    private _connections: Map<string, WebChatConnection> = new Map();

    private _sessions: Map<string, WebChatSession> = new Map();

    private _users: Map<string, WebChatUser> = new Map();

    private _healthStatus: 'healthy' | 'unhealthy' | 'maintenance' = 'healthy';

    private _reconnectAttempts = 0;

    private _maxReconnectAttempts = 3;

    private _pingInterval: NodeJS.Timeout | null = null;

    private _sessionCleanupInterval: NodeJS.Timeout | null = null;

    private _messageQueue: Map<string, WebChatOutgoingMessage[]> = new Map();

    private _messageHistory: Map<string, WebChatMessage[]> = new Map();

    private _typingIndicators: Map<string, WebChatTypingIndicator> = new Map();

    constructor(config?: WebChatConfig) {
        super();
        this._transformer = new WebMessageTransformer();

        if (config) {
            this._config = this.validateConfig(config);
        }

        this.setupEventListeners();
    }

    //#region IChannelAdapter Implementation

    getChannelType(): ChannelType {
        return ChannelType.Web;
    }

    getPlatformName(): string {
        return 'web';
    }

    async initialize(config?: any): Promise<void> {
        if (this._isInitialized) {
            logger.warn('WebChatAdapter is already initialized');
            return;
        }

        // Set config if provided (factory pattern)
        if (config && !this._config) {
            this._config = this.validateConfig(config);
        }

        if (!this._config) {
            throw new Error('WebChatAdapter configuration is required');
        }

        try {
            await this.startWebSocketServer();
            this.startPingInterval();
            this.startSessionCleanup();

            this._isInitialized = true;
            this._healthStatus = 'healthy';
            logger.info(`WebChatAdapter initialized successfully, port: ${this._config.port}, host: ${this._config.host || 'localhost'}`);

        } catch (error) {
            logger.error(`Failed to initialize WebChatAdapter: ${error}`);
            this._healthStatus = 'unhealthy';
            throw error;
        }
    }

    async destroy(): Promise<void> {
        if (!this._isInitialized) {
            return;
        }

        try {
            // Stop intervals
            if (this._pingInterval) {
                clearInterval(this._pingInterval);
                this._pingInterval = null;
            }

            if (this._sessionCleanupInterval) {
                clearInterval(this._sessionCleanupInterval);
                this._sessionCleanupInterval = null;
            }

            // Close all connections
            for (const [connectionId, connection] of this._connections) {
                await this.closeConnection(connectionId, 'Server shutdown');
            }

            // Close WebSocket server
            if (this._server) {
                await new Promise<void>((resolve, reject) => {
                    this._server!.close((error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });
                this._server = null;
            }

            // Clear all data
            this._connections.clear();
            this._sessions.clear();
            this._users.clear();
            this._messageQueue.clear();
            this._messageHistory.clear();
            this._typingIndicators.clear();

            this._isInitialized = false;
            this._healthStatus = 'maintenance';
            logger.info('WebChatAdapter destroyed successfully');

        } catch (error) {
            logger.error(`Error during WebChatAdapter destruction: ${error}`);
            throw error;
        }
    }

    async sendMessage(
        channelUserId: string,
        content: MessageContent,
        metadata?: Record<string, any>
    ): Promise<DeliveryStatus> {
        if (!this._isInitialized) {
            throw new Error('WebChatAdapter is not initialized');
        }

        const messageId = this.generateMessageId();

        try {
            const outgoingMessage = this._transformer.formatOutgoingMessage(channelUserId, content, metadata);
            const connection = this.getActiveConnection(channelUserId);

            if (!connection) {
                // Queue message for offline delivery
                if (this._config.features?.enableMessageHistory) {
                    this.queueMessage(channelUserId, outgoingMessage);
                }

                return {
                    sent          : new Date(),
                    failed        : new Date(),
                    failureReason : 'User not connected'
                };
            }

            // Send message via WebSocket
            const messageData = {
                id        : messageId,
                ...outgoingMessage,
                timestamp : new Date()
            };

            await this.sendToConnection(connection, 'message', messageData);

            // Store in message history
            if (this._config.features?.enableMessageHistory) {
                this.storeMessage(channelUserId, {
                    id        : messageId,
                    sessionId : connection.sessionId,
                    userId    : channelUserId,
                    timestamp : new Date(),
                    type      : outgoingMessage.type,
                    content   : outgoingMessage.content,
                    metadata  : outgoingMessage.metadata,
                    status    : 'sent'
                });
            }

            return {
                sent      : new Date(),
                delivered : new Date()
            };

        } catch (error) {
            logger.error(`Failed to send message: ${error}, userId: ${channelUserId}, messageId: ${messageId}`);
            return {
                sent          : new Date(),
                failed        : new Date(),
                failureReason : error.message
            };
        }
    }

    async isHealthy(): Promise<boolean> {
        if (!this._isInitialized) {
            return false;
        }

        try {
            // Check if WebSocket server is running
            if (!this._server) {
                return false;
            }

            // Check if we can accept connections
            if (this._connections.size >= (this._config.maxConnections || 1000)) {
                return false;
            }

            // Check if there are any critical errors
            if (this._healthStatus === 'unhealthy') {
                return false;
            }

            return true;

        } catch (error) {
            logger.error(`Health check failed: ${error}`);
            return false;
        }
    }

    //#endregion

    //#region IChannelAdapter Required Methods

    /**
     * Process incoming webhook from the channel
     */
    async processIncomingWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<{ messages: any[]; isValid: boolean }> {
        // Web chat uses WebSocket connections, not webhooks
        // But we can handle REST API calls for integration purposes
        try {
            if (payload.type === 'message') {
                const message = this._transformer.parseIncomingMessage(payload);
                return {
                    messages : [message],
                    isValid  : true
                };
            }

            return {
                messages : [],
                isValid  : true
            };

        } catch (error) {
            logger.error(`Failed to process webhook: ${error}`);
            return {
                messages : [],
                isValid  : false
            };
        }
    }

    /**
     * Validate webhook signature/authenticity
     */
    async validateWebhook(
        payload: any,
        headers: Record<string, string>
    ): Promise<boolean> {
        // For Web chat, we validate authentication tokens
        try {
            const token = headers['authorization']?.replace('Bearer ', '') || payload.token;
            return this.validateAuthToken(token);
        } catch (error) {
            logger.error(`Webhook validation failed: ${error}`);
            return false;
        }
    }

    /**
     * Get channel identifier
     */
    getChannelId(): string {
        return `web-${this._config?.host || 'localhost'}:${this._config?.port || 8080}`;
    }

    /**
     * Get channel name
     */
    getChannelName(): string {
        return 'Web Chat';
    }

    /**
     * Get supported message types
     */
    getSupportedMessageTypes(): string[] {
        return [
            'text',
            'image',
            'audio',
            'video',
            'document',
            'location',
            'contact',
            'interactive',
            'file'
        ];
    }

    /**
     * Check if channel supports specific feature
     */
    supportsFeature(feature: string): boolean {
        const supportedFeatures = [
            'text_messages',
            'media_messages',
            'interactive_messages',
            'location_sharing',
            'contact_sharing',
            'file_uploads',
            'real_time_messaging',
            'typing_indicators',
            'read_receipts',
            'delivery_receipts',
            'presence_status',
            'message_history',
            'session_management',
            'multi_device_support',
            'offline_messaging',
            'message_reactions',
            'message_editing',
            'message_deletion'
        ];
        return supportedFeatures.includes(feature);
    }

    /**
     * Check if channel is active and ready
     */
    isActive(): boolean {
        return this._isInitialized && this._healthStatus === 'healthy';
    }

    /**
     * Get channel health status
     */
    async getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        lastCheck: Date;
        details?: string;
    }> {
        const lastCheck = new Date();

        if (!this._isInitialized) {
            return {
                status  : 'unhealthy',
                lastCheck,
                details : 'Adapter not initialized'
            };
        }

        if (!this._server) {
            return {
                status  : 'unhealthy',
                lastCheck,
                details : 'WebSocket server not running'
            };
        }

        const connectionCount = this._connections.size;
        const maxConnections = this._config.maxConnections || 1000;

        if (connectionCount >= maxConnections) {
            return {
                status  : 'degraded',
                lastCheck,
                details : `Connection limit reached (${connectionCount}/${maxConnections})`
            };
        }

        if (this._healthStatus === 'unhealthy') {
            return {
                status  : 'unhealthy',
                lastCheck,
                details : 'Internal health check failed'
            };
        }

        return {
            status  : 'healthy',
            lastCheck,
            details : `Active connections: ${connectionCount}`
        };
    }

    /**
     * Gracefully shutdown the channel adapter
     */
    async shutdown(): Promise<void> {
        return this.destroy();
    }

    /**
     * Format message content for the specific channel
     */
    formatMessageContent(content: MessageContent): any {
        return this._transformer.formatOutgoingMessage('', content);
    }

    /**
     * Parse incoming message to standard format
     */
    parseIncomingMessage(rawMessage: any): {
        userId: string;
        content: MessageContent;
        metadata: Record<string, any>;
        timestamp: Date;
    } {
        const transformed = this._transformer.parseIncomingMessage(rawMessage);
        return {
            userId    : transformed.userId,
            content   : transformed.content,
            metadata  : transformed.metadata.CustomData || {},
            timestamp : transformed.timestamp
        };
    }

    //#endregion

    //#region WebSocket Server Management

    private async startWebSocketServer(): Promise<void> {
        const options: WebSocket.ServerOptions = {
            port              : this._config.port,
            host              : this._config.host || 'localhost',
            maxPayload        : this._config.fileUploadConfig?.maxFileSize || 10 * 1024 * 1024, // 10MB default
            perMessageDeflate : {
                zlibDeflateOptions : {
                    level     : 1,
                    chunkSize : 1024
                },
                threshold                  : 1024,
                concurrencyLimit           : 100,
                clientMaxWindowBits        : 15,
                serverMaxWindowBits        : 15,
                serverMaxNoContextTakeover : true,
            }
        };

        this._server = new WebSocket.Server(options);

        this._server.on('connection', this.handleNewConnection.bind(this));
        this._server.on('error', this.handleServerError.bind(this));
        this._server.on('listening', () => {
            logger.info(`WebSocket server listening, port: ${this._config.port}, host: ${this._config.host || 'localhost'}`);
        });
    }

    private async handleNewConnection(socket: WebSocket, request: any): Promise<void> {
        const connectionId = this.generateConnectionId();
        const clientIP = request.socket.remoteAddress;
        const userAgent = request.headers['user-agent'];

        logger.info(`New WebSocket connection, connectionId: ${connectionId}, clientIP: ${clientIP}, userAgent: ${userAgent}`);

        // Create connection record
        const connection: WebChatConnection = {
            id              : connectionId,
            socket,
            userId          : '', // Will be set during authentication
            sessionId       : '', // Will be set during authentication
            isAuthenticated : false,
            lastActivity    : new Date(),
            metadata        : {
                clientIP,
                userAgent,
                connectedAt : new Date()
            }
        };

        this._connections.set(connectionId, connection);

        // Set up socket event handlers
        socket.on('message', (data) => this.handleSocketMessage(connectionId, data));
        socket.on('close', (code, reason) => this.handleSocketClose(connectionId, code, reason));
        socket.on('error', (error) => this.handleSocketError(connectionId, error));
        socket.on('ping', () => this.handleSocketPing(connectionId));
        socket.on('pong', () => this.handleSocketPong(connectionId));

        // Request authentication
        await this.sendToConnection(connection, 'auth_required', {
            connectionId,
            timestamp : new Date()
        });

        // Set timeout for authentication
        setTimeout(() => {
            if (!connection.isAuthenticated) {
                this.closeConnection(connectionId, 'Authentication timeout');
            }
        }, 30000); // 30 seconds
    }

    private async handleSocketMessage(connectionId: string, data: WebSocket.Data): Promise<void> {
        const connection = this._connections.get(connectionId);
        if (!connection) {
            return;
        }

        connection.lastActivity = new Date();

        try {
            const rawMessage = JSON.parse(data.toString());

            // Handle different message types
            switch (rawMessage.type) {
                case 'auth':
                    await this.handleAuthentication(connectionId, rawMessage);
                    break;
                case 'message':
                    await this.handleIncomingMessage(connectionId, rawMessage);
                    break;
                case 'typing':
                    await this.handleTypingIndicator(connectionId, rawMessage);
                    break;
                case 'read_receipt':
                    await this.handleReadReceipt(connectionId, rawMessage);
                    break;
                case 'file_upload':
                    await this.handleFileUpload(connectionId, rawMessage);
                    break;
                case 'ping':
                    await this.sendToConnection(connection, 'pong', { timestamp: new Date() });
                    break;
                default:
                    logger.warn(`Unknown message type: ${rawMessage.type}, connectionId: ${connectionId}`);
            }

        } catch (error) {
            logger.error(`Error handling socket message: ${error}, connectionId: ${connectionId}`);
            await this.sendToConnection(connection, 'error', {
                message   : 'Invalid message format',
                timestamp : new Date()
            });
        }
    }

    private async handleSocketClose(connectionId: string, code: number, reason: string): Promise<void> {
        logger.info(`WebSocket connection closed, connectionId: ${connectionId}, code: ${code}, reason: ${reason}`);

        const connection = this._connections.get(connectionId);
        if (connection && connection.isAuthenticated) {
            // Update user presence
            await this.updateUserPresence(connection.userId, false);

            // Emit presence event
            this.emit('presence', {
                userId    : connection.userId,
                sessionId : connection.sessionId,
                isOnline  : false,
                timestamp : new Date()
            });
        }

        this._connections.delete(connectionId);
    }

    private async handleSocketError(connectionId: string, error: Error): Promise<void> {
        logger.error(`WebSocket connection error: ${error}, connectionId: ${connectionId}`);
        await this.closeConnection(connectionId, 'Connection error');
    }

    //#endregion

    //#region Message Processing

    private async handleIncomingMessage(connectionId: string, rawMessage: any): Promise<void> {
        const connection = this._connections.get(connectionId);
        if (!connection || !connection.isAuthenticated) {
            return;
        }

        try {
            const webChatMessage: WebChatMessage = {
                id        : rawMessage.id || this.generateMessageId(),
                sessionId : connection.sessionId,
                userId    : connection.userId,
                timestamp : new Date(),
                type      : rawMessage.messageType || 'text',
                content   : rawMessage.content,
                metadata  : rawMessage.metadata,
                status    : 'sent'
            };

            // Transform message to internal format
            const transformedMessage = this._transformer.parseIncomingMessage(webChatMessage);

            // Store in message history
            if (this._config.features?.enableMessageHistory) {
                this.storeMessage(connection.userId, webChatMessage);
            }

            // Emit message event
            this.emit('message', transformedMessage);

            // Send delivery receipt
            if (this._config.features?.enableReadReceipts) {
                await this.sendToConnection(connection, 'delivery_receipt', {
                    messageId : webChatMessage.id,
                    status    : 'delivered',
                    timestamp : new Date()
                });
            }

        } catch (error) {
            logger.error(`Error processing incoming message: ${error}, connectionId: ${connectionId}`);
            await this.sendToConnection(connection, 'error', {
                message   : 'Failed to process message',
                timestamp : new Date()
            });
        }
    }

    private async handleAuthentication(connectionId: string, authMessage: any): Promise<void> {
        const connection = this._connections.get(connectionId);
        if (!connection) {
            return;
        }

        try {
            // Validate auth token/credentials
            const { userId, sessionId, token } = authMessage;

            if (!this.validateAuthToken(token)) {
                await this.sendToConnection(connection, 'auth_failed', {
                    message   : 'Invalid authentication token',
                    timestamp : new Date()
                });
                return;
            }

            // Update connection
            connection.userId = userId;
            connection.sessionId = sessionId || this.generateSessionId();
            connection.isAuthenticated = true;

            // Create or update user
            const user: WebChatUser = {
                id        : userId,
                sessionId : connection.sessionId,
                name      : authMessage.name,
                email     : authMessage.email,
                avatar    : authMessage.avatar,
                ipAddress : connection.metadata?.clientIP,
                userAgent : connection.metadata?.userAgent,
                isOnline  : true,
                lastSeen  : new Date(),
                metadata  : authMessage.metadata
            };

            this._users.set(userId, user);

            // Create session
            const session: WebChatSession = {
                sessionId    : connection.sessionId,
                userId,
                startTime    : new Date(),
                lastActivity : new Date(),
                isActive     : true,
                channel      : 'web',
                referrer     : authMessage.referrer,
                pageUrl      : authMessage.pageUrl,
                metadata     : authMessage.metadata
            };

            this._sessions.set(connection.sessionId, session);

            // Send auth success
            await this.sendToConnection(connection, 'auth_success', {
                sessionId : connection.sessionId,
                timestamp : new Date()
            });

            // Send queued messages
            await this.sendQueuedMessages(userId);

            // Update presence
            await this.updateUserPresence(userId, true);

            // Emit join event
            this.emit('join', {
                userId,
                sessionId : connection.sessionId,
                timestamp : new Date()
            });

            logger.info(`User authenticated successfully, userId: ${userId}, sessionId: ${connection.sessionId}, connectionId: ${connectionId}`);

        } catch (error) {
            logger.error(`Authentication failed: ${error}, connectionId: ${connectionId}`);
            await this.sendToConnection(connection, 'auth_failed', {
                message   : 'Authentication failed',
                timestamp : new Date()
            });
        }
    }

    //#endregion

    //#region Utility Methods

    private validateConfig(config: WebChatConfig): WebChatConfig {
        const defaultConfig: WebChatConfig = {
            port               : 8080,
            host               : 'localhost',
            maxConnections     : 1000,
            sessionTimeout     : 30,
            pingInterval       : 30000,
            allowedOrigins     : ['*'],
            enableCors         : true,
            rateLimitPerMinute : 60,
            fileUploadConfig   : {
                maxFileSize  : 10 * 1024 * 1024, // 10MB
                allowedTypes : ['image/*', 'audio/*', 'video/*', 'application/pdf'],
                uploadPath   : './uploads'
            },
            features : {
                enableTypingIndicators : true,
                enablePresence         : true,
                enableFileUpload       : true,
                enableReadReceipts     : true,
                enableMessageHistory   : true,
                enableMultipleDevices  : false
            }
        };

        return { ...defaultConfig, ...config };
    }

    private generateConnectionId(): string {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSessionId(): string {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private validateAuthToken(token: string): boolean {
        // Implement your authentication logic here
        // This is a simple example - in production, validate JWT or similar
        return token && token.length > 0;
    }

    private getActiveConnection(userId: string): WebChatConnection | null {
        for (const connection of this._connections.values()) {
            if (connection.userId === userId && connection.isAuthenticated) {
                return connection;
            }
        }
        return null;
    }

    private async sendToConnection(connection: WebChatConnection, type: string, data: any): Promise<void> {
        if (connection.socket.readyState !== WebSocket.OPEN) {
            return;
        }

        const message = JSON.stringify({
            type,
            data,
            timestamp : new Date()
        });

        try {
            connection.socket.send(message);
        } catch (error) {
            logger.error(`Failed to send message to connection: ${error}, connectionId: ${connection.id}`);
        }
    }

    private async closeConnection(connectionId: string, reason: string): Promise<void> {
        const connection = this._connections.get(connectionId);
        if (!connection) {
            return;
        }

        try {
            if (connection.socket.readyState === WebSocket.OPEN) {
                connection.socket.close(1000, reason);
            }
        } catch (error) {
            logger.error(`Error closing connection: ${error}, connectionId: ${connectionId}`);
        }

        this._connections.delete(connectionId);
    }

    private queueMessage(userId: string, message: WebChatOutgoingMessage): void {
        if (!this._messageQueue.has(userId)) {
            this._messageQueue.set(userId, []);
        }
        this._messageQueue.get(userId)!.push(message);
    }

    private async sendQueuedMessages(userId: string): Promise<void> {
        const queuedMessages = this._messageQueue.get(userId);
        if (!queuedMessages || queuedMessages.length === 0) {
            return;
        }

        const connection = this.getActiveConnection(userId);
        if (!connection) {
            return;
        }

        for (const message of queuedMessages) {
            await this.sendToConnection(connection, 'message', {
                id        : this.generateMessageId(),
                ...message,
                timestamp : new Date()
            });
        }

        this._messageQueue.delete(userId);
    }

    private storeMessage(userId: string, message: WebChatMessage): void {
        if (!this._messageHistory.has(userId)) {
            this._messageHistory.set(userId, []);
        }

        const history = this._messageHistory.get(userId)!;
        history.push(message);

        // Keep only last 1000 messages
        if (history.length > 1000) {
            history.splice(0, history.length - 1000);
        }
    }

    private async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
        const user = this._users.get(userId);
        if (user) {
            user.isOnline = isOnline;
            user.lastSeen = new Date();
        }
    }

    //#endregion

    //#region Event Handlers

    private setupEventListeners(): void {
        this.on('error', (error) => {
            logger.error(`WebChatAdapter error: ${error}`);
            this._healthStatus = 'unhealthy';
        });
    }

    private startPingInterval(): void {
        this._pingInterval = setInterval(() => {
            this.pingConnections();
        }, this._config.pingInterval || 30000);
    }

    private startSessionCleanup(): void {
        this._sessionCleanupInterval = setInterval(() => {
            this.cleanupInactiveSessions();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    private async pingConnections(): Promise<void> {
        const now = new Date();
        const inactiveConnections: string[] = [];

        for (const [connectionId, connection] of this._connections) {
            const inactiveTime = now.getTime() - connection.lastActivity.getTime();

            if (inactiveTime > 60000) { // 1 minute
                inactiveConnections.push(connectionId);
            } else if (connection.socket.readyState === WebSocket.OPEN) {
                try {
                    connection.socket.ping();
                } catch (error) {
                    logger.error(`Failed to ping connection: ${error}, connectionId: ${connectionId}`);
                }
            }
        }

        // Close inactive connections
        for (const connectionId of inactiveConnections) {
            await this.closeConnection(connectionId, 'Inactive connection');
        }
    }

    private cleanupInactiveSessions(): void {
        const now = new Date();
        const sessionTimeout = (this._config.sessionTimeout || 30) * 60 * 1000; // Convert to milliseconds

        for (const [sessionId, session] of this._sessions) {
            const inactiveTime = now.getTime() - session.lastActivity.getTime();

            if (inactiveTime > sessionTimeout) {
                this._sessions.delete(sessionId);
                logger.info(`Session cleaned up due to inactivity, sessionId: ${sessionId}`);
            }
        }
    }

    private handleServerError(error: Error): void {
        logger.error(`WebSocket server error: ${error}`);
        this._healthStatus = 'unhealthy';
        this.emit('error', error);
    }

    private handleSocketPing(connectionId: string): void {
        const connection = this._connections.get(connectionId);
        if (connection) {
            connection.lastActivity = new Date();
        }
    }

    private handleSocketPong(connectionId: string): void {
        const connection = this._connections.get(connectionId);
        if (connection) {
            connection.lastActivity = new Date();
        }
    }

    private async handleTypingIndicator(connectionId: string, message: any): Promise<void> {
        const connection = this._connections.get(connectionId);
        if (!connection || !connection.isAuthenticated) {
            return;
        }

        if (this._config.features?.enableTypingIndicators) {
            const typingIndicator: WebChatTypingIndicator = {
                sessionId : connection.sessionId,
                userId    : connection.userId,
                isTyping  : message.isTyping,
                timestamp : new Date()
            };

            this._typingIndicators.set(connection.userId, typingIndicator);

            // Emit typing event
            this.emit('typing', typingIndicator);

            // Clear typing indicator after 5 seconds
            setTimeout(() => {
                const current = this._typingIndicators.get(connection.userId);
                if (current && current.timestamp === typingIndicator.timestamp) {
                    this._typingIndicators.delete(connection.userId);
                }
            }, 5000);
        }
    }

    private async handleReadReceipt(connectionId: string, message: any): Promise<void> {
        const connection = this._connections.get(connectionId);
        if (!connection || !connection.isAuthenticated) {
            return;
        }

        if (this._config.features?.enableReadReceipts) {
            const receipt: WebChatDeliveryReceipt = {
                messageId : message.messageId,
                sessionId : connection.sessionId,
                userId    : connection.userId,
                status    : message.status,
                timestamp : new Date()
            };

            // Emit delivery receipt event
            this.emit('delivery_receipt', receipt);
        }
    }

    private async handleFileUpload(connectionId: string, message: any): Promise<void> {
        const connection = this._connections.get(connectionId);
        if (!connection || !connection.isAuthenticated) {
            return;
        }

        if (!this._config.features?.enableFileUpload) {
            await this.sendToConnection(connection, 'error', {
                message   : 'File upload is not enabled',
                timestamp : new Date()
            });
            return;
        }

        try {
            // Process file upload
            const mediaContent = this._transformer.parseFileUpload(message.fileData);

            // Create message with media content
            const webChatMessage: WebChatMessage = {
                id        : this.generateMessageId(),
                sessionId : connection.sessionId,
                userId    : connection.userId,
                timestamp : new Date(),
                type      : 'media',
                content   : mediaContent,
                status    : 'sent'
            };

            // Transform and emit
            const transformedMessage = this._transformer.parseIncomingMessage(webChatMessage);
            this.emit('message', transformedMessage);

            // Send success response
            await this.sendToConnection(connection, 'file_upload_success', {
                messageId : webChatMessage.id,
                timestamp : new Date()
            });

        } catch (error) {
            logger.error(`File upload failed: ${error}, connectionId: ${connectionId}`);
            await this.sendToConnection(connection, 'error', {
                message   : 'File upload failed',
                timestamp : new Date()
            });
        }
    }

    //#endregion

    //#region Public API Methods

    /**
     * Get connected users
     */
    getConnectedUsers(): WebChatUser[] {
        return Array.from(this._users.values()).filter(user => user.isOnline);
    }

    /**
     * Get active sessions
     */
    getActiveSessions(): WebChatSession[] {
        return Array.from(this._sessions.values()).filter(session => session.isActive);
    }

    /**
     * Get message history for a user
     */
    getMessageHistory(userId: string, limit = 50): WebChatMessage[] {
        const history = this._messageHistory.get(userId) || [];
        return history.slice(-limit);
    }

    /**
     * Broadcast message to all connected users
     */
    async broadcastMessage(content: MessageContent, metadata?: MessageMetadata): Promise<void> {
        const connections = Array.from(this._connections.values()).filter(c => c.isAuthenticated);

        for (const connection of connections) {
            try {
                await this.sendMessage(connection.userId, content, metadata);
            } catch (error) {
                logger.error(`Failed to broadcast message: ${error}, userId: ${connection.userId}`);
            }
        }
    }

    /**
     * Get adapter statistics
     */
    getStatistics(): any {
        return {
            totalConnections         : this._connections.size,
            authenticatedConnections : Array.from(this._connections.values()).filter(c => c.isAuthenticated).length,
            activeSessions           : this._sessions.size,
            totalUsers               : this._users.size,
            onlineUsers              : Array.from(this._users.values()).filter(u => u.isOnline).length,
            queuedMessages           : Array.from(this._messageQueue.values()).reduce((total, queue) => total + queue.length, 0),
            healthStatus             : this._healthStatus
        };
    }

    //#endregion

}
