import {
    ConversationContextData,
    ContextState,
    UserPreferences
} from '../../domain.types/context.types';

export interface ContextSnapshot {
    conversationId: string;
    userId: string;
    context: ConversationContextData;
    createdAt: Date;
    version: number;
}

export interface ContextQuery {
    conversationId?: string;
    userId?: string;
    channel?: string;
    state?: ContextState;
    createdAfter?: Date;
    createdBefore?: Date;
    limit?: number;
    offset?: number;
}

export interface IContextProvider {

    //#region Context Management

    /**
     * Get context for a conversation
     */
    getContext(
        conversationId: string,
        userId: string
    ): Promise<ConversationContextData | null>;

    /**
     * Create new context for a conversation
     */
    createContext(
        conversationId: string,
        userId: string,
        initialData?: Partial<ConversationContextData>
    ): Promise<ConversationContextData>;

    /**
     * Update context data
     */
    updateContext(
        conversationId: string,
        updates: Partial<ConversationContextData>
    ): Promise<ConversationContextData>;

    /**
     * Delete context (conversation ended)
     */
    deleteContext(conversationId: string): Promise<void>;

    //#endregion

    //#region State Management

    /**
     * Set conversation state
     */
    setState(
        conversationId: string,
        state: ContextState
    ): Promise<void>;

    /**
     * Get current state
     */
    getState(conversationId: string): Promise<ContextState | null>;

    /**
     * Transition to next state
     */
    transitionState(
        conversationId: string,
        fromState: ContextState,
        toState: ContextState,
        reason?: string
    ): Promise<boolean>;

    //#endregion

    //#region Data Management

    /**
     * Store data in context
     */
    setData(
        conversationId: string,
        key: string,
        value: any,
        scope?: 'conversation' | 'user' | 'session'
    ): Promise<void>;

    /**
     * Retrieve data from context
     */
    getData(
        conversationId: string,
        key: string,
        scope?: 'conversation' | 'user' | 'session'
    ): Promise<any>;

    /**
     * Remove data from context
     */
    removeData(
        conversationId: string,
        key: string,
        scope?: 'conversation' | 'user' | 'session'
    ): Promise<void>;

    /**
     * Merge data into context
     */
    mergeData(
        conversationId: string,
        data: Record<string, any>,
        scope?: 'conversation' | 'user' | 'session'
    ): Promise<void>;

    //#endregion

    //#region History Management

    /**
     * Add interaction to history
     */
    addToHistory(
        conversationId: string,
        interaction: {
            type: 'message' | 'action' | 'event';
            content: any;
            timestamp: Date;
            metadata?: Record<string, any>;
        }
    ): Promise<void>;

    /**
     * Get conversation history
     */
    getHistory(
        conversationId: string,
        limit?: number,
        offset?: number
    ): Promise<any[]>;

    /**
     * Clear conversation history
     */
    clearHistory(conversationId: string): Promise<void>;

    //#endregion

    //#region User Preferences

    /**
     * Get user preferences
     */
    getUserPreferences(userId: string): Promise<UserPreferences | null>;

    /**
     * Update user preferences
     */
    updateUserPreferences(
        userId: string,
        preferences: Partial<UserPreferences>
    ): Promise<UserPreferences>;

    /**
     * Apply preferences to context
     */
    applyUserPreferences(
        conversationId: string,
        userId: string
    ): Promise<void>;

    //#endregion

    //#region Context Queries

    /**
     * Find contexts by criteria
     */
    findContexts(query: ContextQuery): Promise<ContextSnapshot[]>;

    /**
     * Get active contexts for a user
     */
    getActiveContexts(userId: string): Promise<ContextSnapshot[]>;

    /**
     * Get context statistics
     */
    getContextStats(
        timeRange?: { start: Date; end: Date }
    ): Promise<{
        totalContexts: number;
        activeContexts: number;
        averageLifetime: number;
        stateDistribution: Record<ContextState, number>;
    }>;

    //#endregion

    //#region Maintenance

    /**
     * Clean up expired contexts
     */
    cleanupExpiredContexts(
        olderThan: Date
    ): Promise<{ cleaned: number; errors: number }>;

    /**
     * Archive old contexts
     */
    archiveContexts(
        olderThan: Date
    ): Promise<{ archived: number; errors: number }>;

    /**
     * Validate context integrity
     */
    validateContext(
        conversationId: string
    ): Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
    }>;

    //#endregion

}
