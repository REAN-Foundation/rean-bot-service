import { IntentRecognitionResult } from '../../domain.types/intent.types';
import { ConversationContextData } from '../../domain.types/context.types';
import { MessageContent } from '../../domain.types/message.types';

export interface RouteResult {
    handlerType: string;
    confidence: number;
    reasoning: string;
    fallback?: boolean;
    escalation?: {
        type: 'human' | 'supervisor' | 'specialist';
        reason: string;
    };
}

export interface RoutingRule {
    id: string;
    priority: number;
    conditions: {
        intent?: string[];
        confidence?: { min?: number; max?: number };
        channel?: string[];
        userType?: string[];
        contextState?: string[];
        timeOfDay?: { start: string; end: string };
        customConditions?: Record<string, any>;
    };
    action: {
        handlerType: string;
        escalate?: boolean;
        customActions?: Record<string, any>;
    };
    enabled: boolean;
}

export interface IMessageRouter {

    //#region Core Routing

    /**
     * Route a message to the appropriate handler
     */
    routeMessage(
        messageContent: MessageContent,
        intentResult: IntentRecognitionResult,
        context: ConversationContextData,
        metadata?: Record<string, any>
    ): Promise<RouteResult>;

    /**
     * Get the fallback handler for unroutable messages
     */
    getFallbackHandler(
        messageContent: MessageContent,
        context: ConversationContextData
    ): Promise<RouteResult>;

    /**
     * Determine if message should be escalated
     */
    shouldEscalate(
        messageContent: MessageContent,
        intentResult: IntentRecognitionResult,
        context: ConversationContextData
    ): Promise<{
        shouldEscalate: boolean;
        escalationType?: 'human' | 'supervisor' | 'specialist';
        reason?: string;
    }>;

    //#endregion

    //#region Rule Management

    /**
     * Add a routing rule
     */
    addRule(rule: RoutingRule): Promise<void>;

    /**
     * Update a routing rule
     */
    updateRule(ruleId: string, updates: Partial<RoutingRule>): Promise<void>;

    /**
     * Remove a routing rule
     */
    removeRule(ruleId: string): Promise<void>;

    /**
     * Get all routing rules
     */
    getRules(): Promise<RoutingRule[]>;

    /**
     * Get rules by priority
     */
    getRulesByPriority(): Promise<RoutingRule[]>;

    //#endregion

    //#region Handler Management

    /**
     * Register a message handler
     */
    registerHandler(
        handlerType: string,
        handler: any,
        priority?: number
    ): Promise<void>;

    /**
     * Unregister a message handler
     */
    unregisterHandler(handlerType: string): Promise<void>;

    /**
     * Get available handlers
     */
    getAvailableHandlers(): Promise<string[]>;

    /**
     * Check if handler is available
     */
    isHandlerAvailable(handlerType: string): boolean;

    //#endregion

    //#region Route Analysis

    /**
     * Analyze routing performance
     */
    analyzeRouting(
        timeRange: { start: Date; end: Date }
    ): Promise<{
        totalMessages: number;
        handlerUsage: Record<string, number>;
        escalationRate: number;
        fallbackRate: number;
        averageConfidence: number;
    }>;

    /**
     * Get routing suggestions based on patterns
     */
    getRoutingSuggestions(): Promise<{
        suggestedRules: Partial<RoutingRule>[];
        optimizations: string[];
        warnings: string[];
    }>;

    //#endregion

    //#region Configuration

    /**
     * Configure routing settings
     */
    configure(settings: {
        defaultFallback?: string;
        escalationThreshold?: number;
        maxRoutingAttempts?: number;
        enableAnalytics?: boolean;
    }): Promise<void>;

    /**
     * Get current configuration
     */
    getConfiguration(): Promise<Record<string, any>>;

    //#endregion

}
