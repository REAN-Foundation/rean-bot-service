////////////////////////////////////////////////////////////////////////

// Intent Handler Types
export enum HandlerType {
    UserConsent = 'UserConsent',
    QnARag      = 'QnARag',
    Assessment  = 'Assessment',
    Workflow    = 'Workflow',
    Reminder    = 'Reminder',
    Task        = 'Task',
    Intent      = 'Intent',
    SmallTalk   = 'SmallTalk',
    Feedback    = 'Feedback',
    Fallback    = 'Fallback'
}

// Intent Recognition Confidence Levels
export enum IntentConfidence {
    VeryLow  = 'VeryLow',
    Low      = 'Low',
    Medium   = 'Medium',
    High     = 'High',
    VeryHigh = 'VeryHigh'
}

// Intent Categories
export enum IntentCategory {
    Greeting    = 'Greeting',
    Question    = 'Question',
    Command     = 'Command',
    Request     = 'Request',
    Complaint   = 'Complaint',
    Compliment  = 'Compliment',
    Goodbye     = 'Goodbye',
    SmallTalk   = 'SmallTalk',
    Medical     = 'Medical',
    Emergency   = 'Emergency',
    Appointment = 'Appointment',
    Information = 'Information',
    Navigation  = 'Navigation',
    Help        = 'Help',
    Other       = 'Other'
}

// Intent Priority Levels
export enum IntentPriority {
    Lowest   = 0,
    Low      = 1,
    Medium   = 2,
    High     = 3,
    Highest  = 4,
    Critical = 5
}

////////////////////////////////////////////////////////////////////////

// Entity Types for Intent Recognition
export interface EntityDefinition {
    Name: string;
    Type: EntityType;
    Required: boolean;
    Description?: string;
    Validation?: EntityValidation;
    Synonyms?: string[];
    Examples?: string[];
}

export enum EntityType {
    Text         = 'Text',
    Number       = 'Number',
    Date         = 'Date',
    Time         = 'Time',
    DateTime     = 'DateTime',
    Email        = 'Email',
    Phone        = 'Phone',
    Currency     = 'Currency',
    Percentage   = 'Percentage',
    Location     = 'Location',
    Person       = 'Person',
    Organization = 'Organization',
    Custom       = 'Custom'
}

export interface EntityValidation {
    MinLength    ?: number;
    MaxLength    ?: number;
    Pattern      ?: string;
    MinValue     ?: number;
    MaxValue     ?: number;
    AllowedValues?: string[];
}

export interface ExtractedEntity {
    Name       : string;
    Type       : EntityType;
    Value      : string;
    Confidence : number;
    Start      : number;
    End        : number;
    Resolved  ?: any;         // resolved value (e.g., Date object for date entities)
}

////////////////////////////////////////////////////////////////////////

// Intent Recognition Results
export interface IntentRecognitionResult {
    Intent: string;
    Confidence: number;
    ConfidenceLevel: IntentConfidence;
    Entities: ExtractedEntity[];
    AlternativeIntents?: IntentScore[];
    ProcessingTime: number;
    Model?: string;
    Version?: string;
}

export interface IntentScore {
    Intent: string;
    Score: number;
    Confidence: IntentConfidence;
}

export interface IntentMatchResult {
    Matched: boolean;
    Intent?: string;
    Confidence?: number;
    Entities?: ExtractedEntity[];
    MissingEntities?: string[];
    Reason?: string;
}

////////////////////////////////////////////////////////////////////////

// Intent Configuration
export interface IntentConfig {
    id: string;
    Name: string;
    DisplayName?: string;
    Description?: string;
    Category: IntentCategory;
    Priority: IntentPriority;
    IsActive: boolean;
    HandlerType: HandlerType;
    ThresholdScore: number;
    RequiredEntities: EntityDefinition[];
    OptionalEntities?: EntityDefinition[];
    Utterances: string[];
    Responses?: IntentResponse[];
    HandlerConfig?: HandlerConfig;
    Metadata?: Record<string, any>;
    CreatedAt: Date;
    UpdatedAt?: Date;
}

export interface IntentResponse {
    id: string;
    Text: string;
    Conditions?: ResponseCondition[];
    Variations?: string[];
    MediaAttachments?: MediaAttachment[];
    Actions?: ResponseAction[];
}

export interface ResponseCondition {
    Field: string;
    Operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists';
    Value: any;
}

export interface MediaAttachment {
    Type: 'image' | 'audio' | 'video' | 'document';
    Url: string;
    Caption?: string;
}

export interface ResponseAction {
    Type: 'redirect' | 'api_call' | 'set_context' | 'end_conversation';
    Parameters: Record<string, any>;
}

////////////////////////////////////////////////////////////////////////

// Handler Configuration
export interface HandlerConfig {
    Timeout?: number;
    MaxRetries?: number;
    FallbackIntent?: string;
    ContextRequired?: boolean;
    ContextFields?: string[];
    ApiEndpoint?: string;
    ApiHeaders?: Record<string, string>;
    CustomSettings?: Record<string, any>;
}

// Intent Training Data
export interface IntentTrainingData {
    IntentName: string;
    Utterances: TrainingUtterance[];
    Entities: EntityDefinition[];
    Version: string;
    Language: string;
    Domain?: string;
}

export interface TrainingUtterance {
    Text: string;
    Entities?: AnnotatedEntity[];
    Metadata?: Record<string, any>;
}

export interface AnnotatedEntity {
    Entity: string;
    Value: string;
    Start: number;
    End: number;
}

////////////////////////////////////////////////////////////////////////

// Intent Analysis
export interface IntentAnalytics {
    IntentName: string;
    TotalMatches: number;
    AverageConfidence: number;
    SuccessRate: number;
    AverageResponseTime: number;
    TopEntities: EntityUsage[];
    FailureReasons: FailureReason[];
    UserSatisfaction?: number;
    LastUsed: Date;
}

export interface EntityUsage {
    EntityName: string;
    Count: number;
    AverageConfidence: number;
}

export interface FailureReason {
    Reason: string;
    Count: number;
    Percentage: number;
}

////////////////////////////////////////////////////////////////////////

// Intent Context
export interface IntentContext {
    ConversationId: string;
    UserId: string;
    CurrentIntent?: string;
    IntentHistory: IntentHistoryEntry[];
    Entities: Record<string, any>;
    SessionData: Record<string, any>;
    UserProfile?: UserProfile;
    ChannelContext?: ChannelContext;
}

export interface IntentHistoryEntry {
    Intent: string;
    Confidence: number;
    Timestamp: Date;
    Entities: ExtractedEntity[];
    Successful: boolean;
}

export interface UserProfile {
    id: string;
    Name?: string;
    Language?: string;
    Timezone?: string;
    Preferences?: Record<string, any>;
    History?: UserInteractionHistory;
}

export interface UserInteractionHistory {
    TotalInteractions: number;
    LastInteraction: Date;
    PreferredIntents: string[];
    SatisfactionScore?: number;
}

export interface ChannelContext {
    Channel: string;
    ChannelUserId: string;
    ChannelMetadata?: Record<string, any>;
    SupportedFeatures: string[];
}

////////////////////////////////////////////////////////////////////////

// Intent DTO Types
export interface CreateIntentDto {
    Name: string;
    DisplayName?: string;
    Description?: string;
    Category: IntentCategory;
    Priority: IntentPriority;
    HandlerType: HandlerType;
    ThresholdScore: number;
    RequiredEntities: EntityDefinition[];
    OptionalEntities?: EntityDefinition[];
    Utterances: string[];
    Responses?: IntentResponse[];
    HandlerConfig?: HandlerConfig;
    IsActive?: boolean;
}

export interface UpdateIntentDto {
    DisplayName?: string;
    Description?: string;
    Category?: IntentCategory;
    Priority?: IntentPriority;
    HandlerType?: HandlerType;
    ThresholdScore?: number;
    RequiredEntities?: EntityDefinition[];
    OptionalEntities?: EntityDefinition[];
    Utterances?: string[];
    Responses?: IntentResponse[];
    HandlerConfig?: HandlerConfig;
    IsActive?: boolean;
}

export interface IntentSearchFilters {
    Category?: IntentCategory;
    HandlerType?: HandlerType;
    IsActive?: boolean;
    MinThreshold?: number;
    MaxThreshold?: number;
    Priority?: IntentPriority;
    SearchTerm?: string;
    Limit?: number;
    Offset?: number;
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
