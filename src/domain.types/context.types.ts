import { HandlerType } from './intent.types';
import { ChannelType } from './message.types';

////////////////////////////////////////////////////////////////////////

// Context Mode Types
export enum ContextMode {
    Normal = 'normal',
    Assessment = 'assessment',
    Workflow = 'workflow',
    Menu = 'menu',
    Form = 'form',
    Confirmation = 'confirmation',
    Help = 'help',
    Fallback = 'fallback',
    Maintenance = 'maintenance',
    Emergency = 'emergency'
}

// Context State Types
export enum ContextState {
    Active = 'active',
    Paused = 'paused',
    Waiting = 'waiting',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed',
    Expired = 'expired'
}

// Context Priority Levels
export enum ContextPriority {
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

////////////////////////////////////////////////////////////////////////

// Core Context Interfaces
export interface ConversationContextData {
    conversationId: string;
    userId: string;
    channel: ChannelType;
    currentMode: ContextMode;
    currentHandler: HandlerType;
    state: ContextState;
    priority: ContextPriority;
    sessionData: SessionData;
    userProfile: UserContextProfile;
    conversationFlow: ConversationFlow;
    metadata: ContextMetadata;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
}

export interface SessionData {
    sessionId: string;
    startTime: Date;
    lastActivity: Date;
    messageCount: number;
    currentStep?: string;
    stepHistory: StepHistory[];
    variables: Record<string, any>;
    flags: Record<string, boolean>;
    temp: Record<string, any>; // temporary data cleared on session end
}

export interface StepHistory {
    step: string;
    handler: HandlerType;
    timestamp: Date;
    data?: Record<string, any>;
    successful: boolean;
}

export interface UserContextProfile {
    userId: string;
    name?: string;
    language: string;
    timezone: string;
    preferences: UserPreferences;
    history: UserHistory;
    demographics?: UserDemographics;
}

export interface UserPreferences {
    communicationStyle: 'formal' | 'casual' | 'professional';
    responseLength: 'short' | 'medium' | 'detailed';
    language: string;
    timezone: string;
    notifications: NotificationPreferences;
    accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
    enabled: boolean;
    channels: ChannelType[];
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    quietHours?: QuietHours;
}

export interface QuietHours {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    timezone: string;
}

export interface AccessibilityPreferences {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
    audioDescriptions: boolean;
}

export interface UserHistory {
    totalConversations: number;
    lastConversation: Date;
    averageSessionDuration: number;
    commonTopics: string[];
    satisfactionScore?: number;
    preferredHandlers: HandlerType[];
}

export interface UserDemographics {
    age?: number;
    gender?: string;
    location?: string;
    occupation?: string;
    educationLevel?: string;
}

////////////////////////////////////////////////////////////////////////

// Conversation Flow Management
export interface ConversationFlow {
    currentFlow?: string;
    currentStep?: string;
    flowHistory: FlowHistory[];
    branchingContext?: BranchingContext;
    loopContext?: LoopContext;
    waitingFor?: WaitingContext;
}

export interface FlowHistory {
    flowId: string;
    stepId: string;
    timestamp: Date;
    direction: 'forward' | 'backward' | 'jump';
    data?: Record<string, any>;
}

export interface BranchingContext {
    branchPoint: string;
    condition: string;
    possiblePaths: string[];
    selectedPath?: string;
}

export interface LoopContext {
    loopId: string;
    iteration: number;
    maxIterations: number;
    condition: string;
    variables: Record<string, any>;
}

export interface WaitingContext {
    waitingFor: 'user_input' | 'external_service' | 'timer' | 'approval';
    timeout?: Date;
    prompt?: string;
    expectedInputType?: string;
    retryCount: number;
    maxRetries: number;
}

////////////////////////////////////////////////////////////////////////

// Context Metadata
export interface ContextMetadata {
    source: string;
    version: string;
    tags: string[];
    customData: Record<string, any>;
    integrations: IntegrationContext[];
    analytics: ContextAnalytics;
}

export interface IntegrationContext {
    service: string;
    endpoint?: string;
    sessionId?: string;
    credentials?: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface ContextAnalytics {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    messageCount: number;
    handlerSwitches: number;
    errorCount: number;
    successfulIntents: number;
    userSatisfaction?: number;
    efficiency?: number;
}

////////////////////////////////////////////////////////////////////////

// Context Operations
export interface ContextOperation {
    type: ContextOperationType;
    data: Record<string, any>;
    timestamp: Date;
    operator?: string;
}

export enum ContextOperationType {
    Create = 'create',
    Update = 'update',
    Merge = 'merge',
    Clear = 'clear',
    Reset = 'reset',
    Archive = 'archive',
    Restore = 'restore',
    Expire = 'expire'
}

export interface ContextSnapshot {
    id: string;
    conversationId: string;
    timestamp: Date;
    context: ConversationContextData;
    reason: string;
    metadata?: Record<string, any>;
}

////////////////////////////////////////////////////////////////////////

// Context Sharing and Inheritance
export interface ContextInheritance {
    parentContextId?: string;
    childContextIds: string[];
    inheritedFields: string[];
    sharedVariables: Record<string, any>;
    isolatedFields: string[];
}

export interface ContextScope {
    level: 'global' | 'tenant' | 'user' | 'conversation' | 'session';
    visibility: 'public' | 'private' | 'restricted';
    permissions: ContextPermission[];
    expirationPolicy?: ExpirationPolicy;
}

export interface ContextPermission {
    role: string;
    actions: ContextAction[];
    fields?: string[];
}

export enum ContextAction {
    Read = 'read',
    Write = 'write',
    Delete = 'delete',
    Share = 'share',
    Inherit = 'inherit'
}

export interface ExpirationPolicy {
    type: 'time' | 'inactivity' | 'condition';
    duration?: number; // in minutes
    condition?: string;
    action: 'archive' | 'delete' | 'notify';
}

////////////////////////////////////////////////////////////////////////

// Context DTOs
export interface CreateContextDto {
    conversationId: string;
    userId: string;
    channel: ChannelType;
    currentMode: ContextMode;
    currentHandler: HandlerType;
    sessionData?: Partial<SessionData>;
    userProfile?: Partial<UserContextProfile>;
    metadata?: Partial<ContextMetadata>;
    expiresAt?: Date;
}

export interface UpdateContextDto {
    currentMode?: ContextMode;
    currentHandler?: HandlerType;
    state?: ContextState;
    priority?: ContextPriority;
    sessionData?: Partial<SessionData>;
    conversationFlow?: Partial<ConversationFlow>;
    metadata?: Partial<ContextMetadata>;
    expiresAt?: Date;
}

export interface MergeContextDto {
    sessionData?: Record<string, any>;
    variables?: Record<string, any>;
    flags?: Record<string, boolean>;
    customData?: Record<string, any>;
}

export interface ContextSearchFilters {
    conversationId?: string;
    userId?: string;
    channel?: ChannelType;
    currentMode?: ContextMode;
    currentHandler?: HandlerType;
    state?: ContextState;
    priority?: ContextPriority;
    dateFrom?: Date;
    dateTo?: Date;
    isActive?: boolean;
    hasExpired?: boolean;
    limit?: number;
    offset?: number;
}

////////////////////////////////////////////////////////////////////////

// Context Service Interfaces
export interface IContextProvider {
    getContext(conversationId: string): Promise<ConversationContextData | null>;
    createContext(data: CreateContextDto): Promise<ConversationContextData>;
    updateContext(conversationId: string, data: UpdateContextDto): Promise<ConversationContextData | null>;
    mergeContext(conversationId: string, data: MergeContextDto): Promise<ConversationContextData | null>;
    clearContext(conversationId: string): Promise<boolean>;
    resetContext(conversationId: string): Promise<ConversationContextData | null>;
    archiveContext(conversationId: string): Promise<boolean>;
    restoreContext(conversationId: string): Promise<ConversationContextData | null>;
    summarizeHistory(conversationId: string): Promise<string>;
    getActiveContexts(): Promise<ConversationContextData[]>;
    getExpiredContexts(): Promise<ConversationContextData[]>;
    cleanupExpiredContexts(): Promise<number>;
}

export interface IContextManager {
    switchMode(conversationId: string, mode: ContextMode): Promise<boolean>;
    switchHandler(conversationId: string, handler: HandlerType): Promise<boolean>;
    pushStep(conversationId: string, step: string, data?: Record<string, any>): Promise<boolean>;
    popStep(conversationId: string): Promise<StepHistory | null>;
    setVariable(conversationId: string, key: string, value: any): Promise<boolean>;
    getVariable(conversationId: string, key: string): Promise<any>;
    setFlag(conversationId: string, flag: string, value: boolean): Promise<boolean>;
    getFlag(conversationId: string, flag: string): Promise<boolean>;
    createSnapshot(conversationId: string, reason: string): Promise<ContextSnapshot>;
    restoreSnapshot(snapshotId: string): Promise<boolean>;
}

export interface IContextValidator {
    validateContext(context: ConversationContextData): Promise<boolean>;
    validateTransition(fromMode: ContextMode, toMode: ContextMode): Promise<boolean>;
    validateHandler(handler: HandlerType, mode: ContextMode): Promise<boolean>;
    validateExpiration(context: ConversationContextData): Promise<boolean>;
}

////////////////////////////////////////////////////////////////////////

// Context Events
export interface ContextEvent {
    type: ContextEventType;
    conversationId: string;
    timestamp: Date;
    data: Record<string, any>;
    metadata?: Record<string, any>;
}

export enum ContextEventType {
    Created = 'created',
    Updated = 'updated',
    ModeChanged = 'mode_changed',
    HandlerChanged = 'handler_changed',
    StateChanged = 'state_changed',
    VariableSet = 'variable_set',
    FlagSet = 'flag_set',
    StepPushed = 'step_pushed',
    StepPopped = 'step_popped',
    Expired = 'expired',
    Archived = 'archived',
    Restored = 'restored'
}

export interface IContextEventListener {
    onContextEvent(event: ContextEvent): Promise<void>;
}

////////////////////////////////////////////////////////////////////////
