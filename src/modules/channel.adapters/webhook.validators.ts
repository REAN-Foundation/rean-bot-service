import * as crypto from 'crypto';
import { ChannelType } from '../../domain.types/message.types';
import { logger } from '../../logger/logger';

////////////////////////////////////////////////////////////

export interface WebhookValidationResult {
    isValid: boolean;
    error?: string;
    details?: Record<string, any>;
    channelType?: ChannelType;
    challenge?: string; // For verification challenges
}

export interface WebhookValidationConfig {
    channelType: ChannelType;
    secret?: string;
    token?: string;
    maxAge?: number; // Maximum age in seconds
    requiredHeaders?: string[];
    allowedIPs?: string[];
    rateLimiting?: {
        enabled: boolean;
        maxRequests: number;
        windowMs: number;
    };
}

export class WebhookValidators {

    private static readonly DEFAULT_MAX_AGE = 300; // 5 minutes

    private static requestCounts = new Map<string, { count: number; resetTime: number }>();

    //#region Platform-Specific Validators

    /**
     * Validate WhatsApp webhook
     */
    static validateWhatsAppWebhook(
        payload: any,
        headers: Record<string, string>,
        config: WebhookValidationConfig
    ): WebhookValidationResult {
        try {
            // Handle verification challenge
            if (payload['hub.mode'] === 'subscribe' && payload['hub.verify_token'] && payload['hub.challenge']) {
                if (payload['hub.verify_token'] === config.token) {
                    return {
                        isValid     : true,
                        challenge   : payload['hub.challenge'],
                        channelType : ChannelType.WhatsApp
                    };
                }
                return {
                    isValid     : false,
                    error       : 'Invalid verification token',
                    channelType : ChannelType.WhatsApp
                };
            }

            // Validate signature if secret is provided
            if (config.secret) {
                const signature = headers['x-hub-signature-256'];
                if (!signature) {
                    return {
                        isValid     : false,
                        error       : 'Missing signature header',
                        channelType : ChannelType.WhatsApp
                    };
                }

                const isSignatureValid = this.validateWhatsAppSignature(payload, signature, config.secret);
                if (!isSignatureValid) {
                    return {
                        isValid     : false,
                        error       : 'Invalid signature',
                        channelType : ChannelType.WhatsApp
                    };
                }
            }

            // Validate payload structure
            if (!this.isValidWhatsAppPayload(payload)) {
                return {
                    isValid     : false,
                    error       : 'Invalid payload structure',
                    channelType : ChannelType.WhatsApp
                };
            }

            return {
                isValid     : true,
                channelType : ChannelType.WhatsApp
            };

        } catch (error) {
            logger.error(`WhatsApp webhook validation error: ${error.message}`);
            return {
                isValid     : false,
                error       : `Validation error: ${error.message}`,
                channelType : ChannelType.WhatsApp
            };
        }
    }

    /**
     * Validate Telegram webhook
     */
    static validateTelegramWebhook(
        payload: any,
        headers: Record<string, string>,
        config: WebhookValidationConfig
    ): WebhookValidationResult {
        try {
            // Validate signature if secret is provided
            if (config.secret) {
                const signature = headers['x-telegram-bot-api-secret-token'];
                if (!signature) {
                    return {
                        isValid     : false,
                        error       : 'Missing secret token header',
                        channelType : ChannelType.Telegram
                    };
                }

                if (signature !== config.secret) {
                    return {
                        isValid     : false,
                        error       : 'Invalid secret token',
                        channelType : ChannelType.Telegram
                    };
                }
            }

            // Validate payload structure
            if (!this.isValidTelegramPayload(payload)) {
                return {
                    isValid     : false,
                    error       : 'Invalid payload structure',
                    channelType : ChannelType.Telegram
                };
            }

            return {
                isValid     : true,
                channelType : ChannelType.Telegram
            };

        } catch (error) {
            logger.error(`Telegram webhook validation error: ${error.message}`);
            return {
                isValid     : false,
                error       : `Validation error: ${error.message}`,
                channelType : ChannelType.Telegram
            };
        }
    }

    /**
     * Validate Slack webhook
     */
    static validateSlackWebhook(
        payload: any,
        headers: Record<string, string>,
        config: WebhookValidationConfig
    ): WebhookValidationResult {
        try {
            // Handle URL verification challenge
            if (payload.challenge && payload.type === 'url_verification') {
                return {
                    isValid     : true,
                    challenge   : payload.challenge,
                    channelType : ChannelType.Slack
                };
            }

            // Validate signature if secret is provided
            if (config.secret) {
                const signature = headers['x-slack-signature'];
                const timestamp = headers['x-slack-request-timestamp'];

                if (!signature || !timestamp) {
                    return {
                        isValid     : false,
                        error       : 'Missing signature headers',
                        channelType : ChannelType.Slack
                    };
                }

                // Check timestamp age
                const maxAge = config.maxAge || this.DEFAULT_MAX_AGE;
                const now = Math.floor(Date.now() / 1000);
                if (Math.abs(now - parseInt(timestamp)) > maxAge) {
                    return {
                        isValid     : false,
                        error       : 'Request too old',
                        channelType : ChannelType.Slack
                    };
                }

                const isSignatureValid = this.validateSlackSignature(payload, signature, timestamp, config.secret);
                if (!isSignatureValid) {
                    return {
                        isValid     : false,
                        error       : 'Invalid signature',
                        channelType : ChannelType.Slack
                    };
                }
            }

            // Validate payload structure
            if (!this.isValidSlackPayload(payload)) {
                return {
                    isValid     : false,
                    error       : 'Invalid payload structure',
                    channelType : ChannelType.Slack
                };
            }

            return {
                isValid     : true,
                channelType : ChannelType.Slack
            };

        } catch (error) {
            logger.error(`Slack webhook validation error: ${error.message}`);
            return {
                isValid     : false,
                error       : `Validation error: ${error.message}`,
                channelType : ChannelType.Slack
            };
        }
    }

    /**
     * Validate Signal webhook
     */
    static validateSignalWebhook(
        payload: any,
        headers: Record<string, string>,
        config: WebhookValidationConfig
    ): WebhookValidationResult {
        try {
            // Validate signature if secret is provided
            if (config.secret) {
                const signature = headers['x-signal-signature'];
                if (!signature) {
                    return {
                        isValid     : false,
                        error       : 'Missing signature header',
                        channelType : ChannelType.Signal
                    };
                }

                const isSignatureValid = this.validateSignalSignature(payload, signature, config.secret);
                if (!isSignatureValid) {
                    return {
                        isValid     : false,
                        error       : 'Invalid signature',
                        channelType : ChannelType.Signal
                    };
                }
            }

            // Validate payload structure
            if (!this.isValidSignalPayload(payload)) {
                return {
                    isValid     : false,
                    error       : 'Invalid payload structure',
                    channelType : ChannelType.Signal
                };
            }

            return {
                isValid     : true,
                channelType : ChannelType.Signal
            };

        } catch (error) {
            logger.error(`Signal webhook validation error: ${error.message}`);
            return {
                isValid     : false,
                error       : `Validation error: ${error.message}`,
                channelType : ChannelType.Signal
            };
        }
    }

    /**
     * Validate Web Chat authentication
     */
    static validateWebChatAuth(
        payload: any,
        headers: Record<string, string>,
        config: WebhookValidationConfig
    ): WebhookValidationResult {
        try {
            // Validate authentication token
            if (config.token) {
                const token = headers['authorization']?.replace('Bearer ', '') || payload.token;
                if (!token) {
                    return {
                        isValid     : false,
                        error       : 'Missing authentication token',
                        channelType : ChannelType.Web
                    };
                }

                const isTokenValid = this.validateWebChatToken(token, config.token);
                if (!isTokenValid) {
                    return {
                        isValid     : false,
                        error       : 'Invalid authentication token',
                        channelType : ChannelType.Web
                    };
                }
            }

            // Validate payload structure for auth requests
            if (!this.isValidWebChatPayload(payload)) {
                return {
                    isValid     : false,
                    error       : 'Invalid payload structure',
                    channelType : ChannelType.Web
                };
            }

            return {
                isValid     : true,
                channelType : ChannelType.Web
            };

        } catch (error) {
            logger.error(`Web Chat authentication validation error: ${error.message}`);
            return {
                isValid     : false,
                error       : `Validation error: ${error.message}`,
                channelType : ChannelType.Web
            };
        }
    }

    //#endregion

    //#region Signature Validation

    private static validateWhatsAppSignature(
        payload: any,
        signature: string,
        secret: string
    ): boolean {
        try {
            const payloadBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payloadBody, 'utf8')
                .digest('hex');

            const expectedHeader = `sha256=${expectedSignature}`;
            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedHeader)
            );
        } catch (error) {
            logger.error(`WhatsApp signature validation error: ${error.message}`);
            return false;
        }
    }

    private static validateSlackSignature(
        payload: any,
        signature: string,
        timestamp: string,
        secret: string
    ): boolean {
        try {
            const payloadBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const sigBaseString = `v0:${timestamp}:${payloadBody}`;
            const expectedSignature = 'v0=' + crypto
                .createHmac('sha256', secret)
                .update(sigBaseString, 'utf8')
                .digest('hex');

            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            logger.error(`Slack signature validation error: ${error.message}`);
            return false;
        }
    }

    private static validateSignalSignature(
        payload: any,
        signature: string,
        secret: string
    ): boolean {
        try {
            const payloadBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payloadBody, 'utf8')
                .digest('hex');

            const expectedHeader = `sha256=${expectedSignature}`;
            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedHeader)
            );
        } catch (error) {
            logger.error(`Signal signature validation error: ${error.message}`);
            return false;
        }
    }

    private static validateWebChatToken(
        token: string,
        expectedToken: string
    ): boolean {
        try {
            // Simple token validation - in production, use JWT verification
            return crypto.timingSafeEqual(
                Buffer.from(token),
                Buffer.from(expectedToken)
            );
        } catch (error) {
            logger.error(`Web Chat token validation error: ${error.message}`);
            return false;
        }
    }

    //#endregion

    //#region Payload Structure Validation

    private static isValidWhatsAppPayload(payload: any): boolean {
        if (!payload || typeof payload !== 'object') {
            return false;
        }

        // Verification challenge format
        if (payload['hub.mode'] && payload['hub.verify_token'] && payload['hub.challenge']) {
            return true;
        }

        // Webhook event format
        return payload.object === 'whatsapp_business_account' &&
               Array.isArray(payload.entry) &&
               payload.entry.length > 0;
    }

    private static isValidTelegramPayload(payload: any): boolean {
        if (!payload || typeof payload !== 'object') {
            return false;
        }

        // Single update format
        if (payload.update_id !== undefined) {
            return true;
        }

        // Batch updates format
        if (Array.isArray(payload.updates)) {
            return payload.updates.every((update: any) => update.update_id !== undefined);
        }

        return false;
    }

    private static isValidSlackPayload(payload: any): boolean {
        if (!payload || typeof payload !== 'object') {
            return false;
        }

        // URL verification format
        if (payload.challenge && payload.type === 'url_verification') {
            return true;
        }

        // Event callback format
        if (payload.type === 'event_callback' && payload.event) {
            return true;
        }

        // Interactive payload format
        if (payload.type && payload.user && payload.actions) {
            return true;
        }

        return false;
    }

    private static isValidSignalPayload(payload: any): boolean {
        if (!payload || typeof payload !== 'object') {
            return false;
        }

        return payload.envelope &&
               payload.envelope.source &&
               payload.envelope.timestamp &&
               payload.account;
    }

    private static isValidWebChatPayload(payload: any): boolean {
        if (!payload || typeof payload !== 'object') {
            return false;
        }

        // For authentication requests
        if (payload.type === 'auth') {
            return !!(payload.userId && payload.token);
        }

        // For message payloads
        if (payload.type === 'message') {
            return !!(payload.userId && payload.sessionId && payload.content);
        }

        // For other event types
        if (payload.type) {
            return !!(payload.userId && payload.sessionId);
        }

        return true; // Allow generic payloads
    }

    //#endregion

    //#region Generic Validation

    /**
     * Validate webhook based on channel type
     */
    static validateWebhook(
        channelType: ChannelType,
        payload: any,
        headers: Record<string, string>,
        config: WebhookValidationConfig
    ): WebhookValidationResult {
        // Check rate limiting
        if (config.rateLimiting?.enabled) {
            const rateLimitResult = this.checkRateLimit(headers, config.rateLimiting);
            if (!rateLimitResult.isValid) {
                return rateLimitResult;
            }
        }

        // Check IP whitelist
        if (config.allowedIPs && config.allowedIPs.length > 0) {
            const ipResult = this.checkIPWhitelist(headers, config.allowedIPs);
            if (!ipResult.isValid) {
                return ipResult;
            }
        }

        // Check required headers
        if (config.requiredHeaders && config.requiredHeaders.length > 0) {
            const headerResult = this.checkRequiredHeaders(headers, config.requiredHeaders);
            if (!headerResult.isValid) {
                return headerResult;
            }
        }

        // Validate based on channel type
        switch (channelType) {
            case ChannelType.WhatsApp:
                return this.validateWhatsAppWebhook(payload, headers, config);
            case ChannelType.Telegram:
                return this.validateTelegramWebhook(payload, headers, config);
            case ChannelType.Slack:
                return this.validateSlackWebhook(payload, headers, config);
            case ChannelType.Signal:
                return this.validateSignalWebhook(payload, headers, config);
            case ChannelType.Web:
                return this.validateWebChatAuth(payload, headers, config);
            default:
                return {
                    isValid : false,
                    error   : `Unsupported channel type: ${channelType}`
                };
        }
    }

    /**
     * Check rate limiting
     */
    private static checkRateLimit(
        headers: Record<string, string>,
        rateLimitConfig: { maxRequests: number; windowMs: number }
    ): WebhookValidationResult {
        const clientIP = this.getClientIP(headers);
        const now = Date.now();
        const windowStart = now - rateLimitConfig.windowMs;

        // Clean up old entries
        for (const [ip, data] of this.requestCounts) {
            if (data.resetTime < windowStart) {
                this.requestCounts.delete(ip);
            }
        }

        // Check current request count
        const currentData = this.requestCounts.get(clientIP);
        if (currentData) {
            if (currentData.count >= rateLimitConfig.maxRequests) {
                return {
                    isValid : false,
                    error   : 'Rate limit exceeded',
                    details : {
                        clientIP,
                        currentCount : currentData.count,
                        maxRequests  : rateLimitConfig.maxRequests,
                        resetTime    : currentData.resetTime
                    }
                };
            }
            currentData.count++;
        } else {
            this.requestCounts.set(clientIP, {
                count     : 1,
                resetTime : now + rateLimitConfig.windowMs
            });
        }

        return { isValid: true };
    }

    /**
     * Check IP whitelist
     */
    private static checkIPWhitelist(
        headers: Record<string, string>,
        allowedIPs: string[]
    ): WebhookValidationResult {
        const clientIP = this.getClientIP(headers);

        if (!allowedIPs.includes(clientIP)) {
            return {
                isValid : false,
                error   : 'IP not allowed',
                details : { clientIP, allowedIPs }
            };
        }

        return { isValid: true };
    }

    /**
     * Check required headers
     */
    private static checkRequiredHeaders(
        headers: Record<string, string>,
        requiredHeaders: string[]
    ): WebhookValidationResult {
        const missingHeaders = requiredHeaders.filter(
            header => !headers[header.toLowerCase()]
        );

        if (missingHeaders.length > 0) {
            return {
                isValid : false,
                error   : 'Missing required headers',
                details : { missingHeaders }
            };
        }

        return { isValid: true };
    }

    /**
     * Extract client IP from headers
     */
    private static getClientIP(headers: Record<string, string>): string {
        return headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               headers['x-real-ip'] ||
               headers['cf-connecting-ip'] ||
               headers['x-client-ip'] ||
               'unknown';
    }

    //#endregion

    //#region Security Helpers

    /**
     * Sanitize webhook payload
     */
    static sanitizePayload(payload: any): any {
        if (typeof payload !== 'object' || payload === null) {
            return payload;
        }

        // Remove potentially dangerous fields
        const sanitized = { ...payload };

        // Remove script tags and potential XSS vectors
        const dangerousFields = ['script', 'javascript:', 'data:', 'vbscript:'];

        const sanitizeValue = (value: any): any => {
            if (typeof value === 'string') {
                // Remove dangerous patterns
                for (const pattern of dangerousFields) {
                    value = value.replace(new RegExp(pattern, 'gi'), '');
                }
                return value;
            }

            if (Array.isArray(value)) {
                return value.map(sanitizeValue);
            }

            if (typeof value === 'object' && value !== null) {
                const sanitizedObj: any = {};
                for (const [key, val] of Object.entries(value)) {
                    sanitizedObj[key] = sanitizeValue(val);
                }
                return sanitizedObj;
            }

            return value;
        };

        return sanitizeValue(sanitized);
    }

    /**
     * Log webhook validation attempt
     */
    static logValidationAttempt(
        channelType: ChannelType,
        result: WebhookValidationResult,
        headers: Record<string, string>,
        metadata?: Record<string, any>
    ): void {
        const logData = {
            channelType,
            isValid   : result.isValid,
            error     : result.error,
            clientIP  : this.getClientIP(headers),
            userAgent : headers['user-agent'],
            timestamp : new Date().toISOString(),
            ...metadata
        };

        if (result.isValid) {
            logger.info(`Webhook validation successful for ${channelType} - ${JSON.stringify(logData, null, 2)}`);
        } else {
            logger.warn(`Webhook validation failed for ${channelType} - ${JSON.stringify(logData, null, 2)}`);
        }
    }

    //#endregion

}
