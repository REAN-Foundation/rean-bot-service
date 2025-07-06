////////////////////////////////////////////////////////////////////////

// Intent Handler Types
export enum HandlerType {
    UserConsent = 'USER_CONSENT',
    QnARag = 'QNA_RAG',
    Assessment = 'ASSESSMENT',
    Workflow = 'WORKFLOW',
    Reminder = 'REMINDER',
    Task = 'TASK',
    Intent = 'INTENT',
    SmallTalk = 'SMALL_TALK',
    Feedback = 'FEEDBACK',
    Fallback = 'FALLBACK'
}

// Intent Recognition Confidence Levels
export enum IntentConfidence {
    VeryLow = 'very_low',
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    VeryHigh = 'very_high'
}

// Intent Categories
export enum IntentCategory {
    Greeting = 'greeting',
    Question = 'question',
    Command = 'command',
    Request = 'request',
    Complaint = 'complaint',
    Compliment = 'compliment',
    Goodbye = 'goodbye',
    SmallTalk = 'small_talk',
    Medical = 'medical',
    Emergency = 'emergency',
    Appointment = 'appointment',
    Information = 'information',
    Navigation = 'navigation',
    Help = 'help',
    Other = 'other'
}

// Intent Priority Levels
export enum IntentPriority {
    Lowest = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    Highest = 4,
    Critical = 5
}

////////////////////////////////////////////////////////////////////////

// Entity Types for Intent Recognition
export interface EntityDefinition {
    name: string;
    type: EntityType;
    required: boolean;
    description?: string;
    validation?: EntityValidation;
    synonyms?: string[];
    examples?: string[];
}

export enum EntityType {
    Text = 'text',
    Number = 'number',
    Date = 'date',
    Time = 'time',
    DateTime = 'datetime',
    Email = 'email',
    Phone = 'phone',
    Currency = 'currency',
    Percentage = 'percentage',
    Location = 'location',
    Person = 'person',
    Organization = 'organization',
    Custom = 'custom'
}

export interface EntityValidation {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minValue?: number;
    maxValue?: number;
    allowedValues?: string[];
}

export interface ExtractedEntity {
    name: string;
    type: EntityType;
    value: string;
    confidence: number;
    start: number;
    end: number;
    resolved?: any; // resolved value (e.g., Date object for date entities)
}

////////////////////////////////////////////////////////////////////////

// Intent Recognition Results
export interface IntentRecognitionResult {
    intent: string;
    confidence: number;
    confidenceLevel: IntentConfidence;
    entities: ExtractedEntity[];
    alternativeIntents?: IntentScore[];
    processingTime: number;
    model?: string;
    version?: string;
}

export interface IntentScore {
    intent: string;
    score: number;
    confidence: IntentConfidence;
}

export interface IntentMatchResult {
    matched: boolean;
    intent?: string;
    confidence?: number;
    entities?: ExtractedEntity[];
    missingEntities?: string[];
    reason?: string;
}

////////////////////////////////////////////////////////////////////////

// Intent Configuration
export interface IntentConfig {
    id: string;
    name: string;
    displayName?: string;
    description?: string;
    category: IntentCategory;
    priority: IntentPriority;
    isActive: boolean;
    handlerType: HandlerType;
    thresholdScore: number;
    requiredEntities: EntityDefinition[];
    optionalEntities?: EntityDefinition[];
    utterances: string[];
    responses?: IntentResponse[];
    handlerConfig?: HandlerConfig;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IntentResponse {
    id: string;
    text: string;
    conditions?: ResponseCondition[];
    variations?: string[];
    mediaAttachments?: MediaAttachment[];
    actions?: ResponseAction[];
}

export interface ResponseCondition {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
    value: any;
}

export interface MediaAttachment {
    type: 'image' | 'audio' | 'video' | 'document';
    url: string;
    caption?: string;
}

export interface ResponseAction {
    type: 'redirect' | 'api_call' | 'set_context' | 'end_conversation';
    parameters: Record<string, any>;
}

////////////////////////////////////////////////////////////////////////

// Handler Configuration
export interface HandlerConfig {
    timeout?: number;
    maxRetries?: number;
    fallbackIntent?: string;
    contextRequired?: boolean;
    contextFields?: string[];
    apiEndpoint?: string;
    apiHeaders?: Record<string, string>;
    customSettings?: Record<string, any>;
}

// Intent Training Data
export interface IntentTrainingData {
    intentName: string;
    utterances: TrainingUtterance[];
    entities: EntityDefinition[];
    version: string;
    language: string;
    domain?: string;
}

export interface TrainingUtterance {
    text: string;
    entities?: AnnotatedEntity[];
    metadata?: Record<string, any>;
}

export interface AnnotatedEntity {
    entity: string;
    value: string;
    start: number;
    end: number;
}

////////////////////////////////////////////////////////////////////////

// Intent Analysis
export interface IntentAnalytics {
    intentName: string;
    totalMatches: number;
    averageConfidence: number;
    successRate: number;
    averageResponseTime: number;
    topEntities: EntityUsage[];
    failureReasons: FailureReason[];
    userSatisfaction?: number;
    lastUsed: Date;
}

export interface EntityUsage {
    entityName: string;
    count: number;
    averageConfidence: number;
}

export interface FailureReason {
    reason: string;
    count: number;
    percentage: number;
}

////////////////////////////////////////////////////////////////////////

// Intent Context
export interface IntentContext {
    conversationId: string;
    userId: string;
    currentIntent?: string;
    intentHistory: IntentHistoryEntry[];
    entities: Record<string, any>;
    sessionData: Record<string, any>;
    userProfile?: UserProfile;
    channelContext?: ChannelContext;
}

export interface IntentHistoryEntry {
    intent: string;
    confidence: number;
    timestamp: Date;
    entities: ExtractedEntity[];
    successful: boolean;
}

export interface UserProfile {
    id: string;
    name?: string;
    language?: string;
    timezone?: string;
    preferences?: Record<string, any>;
    history?: UserInteractionHistory;
}

export interface UserInteractionHistory {
    totalInteractions: number;
    lastInteraction: Date;
    preferredIntents: string[];
    satisfactionScore?: number;
}

export interface ChannelContext {
    channel: string;
    channelUserId: string;
    channelMetadata?: Record<string, any>;
    supportedFeatures: string[];
}

////////////////////////////////////////////////////////////////////////

// Intent DTO Types
export interface CreateIntentDto {
    name: string;
    displayName?: string;
    description?: string;
    category: IntentCategory;
    priority: IntentPriority;
    handlerType: HandlerType;
    thresholdScore: number;
    requiredEntities: EntityDefinition[];
    optionalEntities?: EntityDefinition[];
    utterances: string[];
    responses?: IntentResponse[];
    handlerConfig?: HandlerConfig;
    isActive?: boolean;
}

export interface UpdateIntentDto {
    displayName?: string;
    description?: string;
    category?: IntentCategory;
    priority?: IntentPriority;
    handlerType?: HandlerType;
    thresholdScore?: number;
    requiredEntities?: EntityDefinition[];
    optionalEntities?: EntityDefinition[];
    utterances?: string[];
    responses?: IntentResponse[];
    handlerConfig?: HandlerConfig;
    isActive?: boolean;
}

export interface IntentSearchFilters {
    category?: IntentCategory;
    handlerType?: HandlerType;
    isActive?: boolean;
    minThreshold?: number;
    maxThreshold?: number;
    priority?: IntentPriority;
    searchTerm?: string;
    limit?: number;
    offset?: number;
}

////////////////////////////////////////////////////////////////////////

// Intent Service Interfaces
export interface IIntentRecognizer {
    recognizeIntent(text: string, context: IntentContext): Promise<IntentRecognitionResult>;
    extractEntities(text: string, entities: EntityDefinition[]): Promise<ExtractedEntity[]>;
    trainModel(trainingData: IntentTrainingData[]): Promise<boolean>;
    validateEntities(entities: ExtractedEntity[], required: EntityDefinition[]): Promise<IntentMatchResult>;
}

export interface IIntentMatcher {
    matchIntent(text: string, availableIntents: IntentConfig[]): Promise<IntentMatchResult>;
    calculateConfidence(text: string, intent: IntentConfig): Promise<number>;
    findBestMatch(scores: IntentScore[], threshold: number): IntentScore | null;
}

export interface IIntentValidator {
    validateIntent(intent: IntentConfig): Promise<boolean>;
    validateEntities(entities: EntityDefinition[]): Promise<boolean>;
    validateUtterances(utterances: string[]): Promise<boolean>;
}

////////////////////////////////////////////////////////////////////////
