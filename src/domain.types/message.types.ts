////////////////////////////////////////////////////////////////////////

// Message Direction Types
export enum MessageDirection {
    Inbound = 'inbound',
    Outbound = 'outbound'
}

// Message Status Types
export enum MessageStatus {
    Pending = 'pending',
    Sent = 'sent',
    Delivered = 'delivered',
    Read = 'read',
    Failed = 'failed',
    Processing = 'processing'
}

// Message Type Categories
export enum MessageType {
    Text = 'text',
    Image = 'image',
    Audio = 'audio',
    Video = 'video',
    Document = 'document',
    Location = 'location',
    Contact = 'contact',
    Sticker = 'sticker',
    Interactive = 'interactive',
    Template = 'template',
    System = 'system'
}

// Interactive Message Sub-types
export enum InteractiveMessageType {
    Button = 'button',
    List = 'list',
    Flow = 'flow',
    QuickReply = 'quick_reply'
}

// Channel Types
export enum ChannelType {
    WhatsApp = 'whatsapp',
    Telegram = 'telegram',
    Slack    = 'slack',
    Signal   = 'signal',
    Web      = 'web',
    SMS      = 'sms',
    Email    = 'email'
}

////////////////////////////////////////////////////////////////////////

// Message Content Interfaces
export interface TextMessageContent {
    Text: string;
    Formatting?: TextFormatting;
}

export interface TextFormatting {
    Bold?: boolean;
    Italic?: boolean;
    Strikethrough?: boolean;
    Code?: boolean;
    Links?: MessageLink[];
    Mentions?: MessageMention[];
}

export interface MessageLink {
    Url: string;
    Text: string;
    Start: number;
    End: number;
}

export interface MessageMention {
    UserId: string;
    Username: string;
    Start: number;
    End: number;
}

export interface MediaMessageContent {
    MediaType: 'image' | 'audio' | 'video' | 'document';
    Url: string;
    Filename?: string;
    Caption?: string;
    MimeType?: string;
    Size?: number;
    Duration?: number; // for audio/video
    Dimensions?: MediaDimensions;
}

export interface MediaDimensions {
    Width: number;
    Height: number;
}

export interface LocationMessageContent {
    Latitude: number;
    Longitude: number;
    Name?: string;
    Address?: string;
    Url?: string;
}

export interface ContactMessageContent {
    Name: string;
    Phone?: string;
    Email?: string;
    Organization?: string;
    Vcard?: string;
}

export interface InteractiveMessageContent {
    Type: InteractiveMessageType;
    Text?: string;
    Buttons?: MessageButton[];
    ListItems?: MessageListItem[];
    Header?: MessageHeader;
    Footer?: string;
}

export interface MessageButton {
    Id: string;
    Title: string;
    Type: 'reply' | 'url' | 'phone';
    Payload?: string;
    Url?: string;
    PhoneNumber?: string;
}

export interface MessageListItem {
    Id: string;
    Title: string;
    Description?: string;
    Payload?: string;
}

export interface MessageHeader {
    Type: 'text' | 'image' | 'video' | 'document';
    Content: string;
}

// Union type for all message content types
export type MessageContent =
    | TextMessageContent
    | MediaMessageContent
    | LocationMessageContent
    | ContactMessageContent
    | InteractiveMessageContent;

////////////////////////////////////////////////////////////////////////

// Message Metadata Interface
export interface MessageMetadata {
    ChannelMessageId  ?: string;
    ReferenceMessageId?: string;
    ThreadId          ?: string;
    ForwardedFrom     ?: string;
    IsForwarded       ?: boolean;
    EditedAt          ?: Date;
    QuotedMessage     ?: QuotedMessage;
    DeliveryStatus    ?: DeliveryStatus;
    ReadBy            ?: ReadReceipt[];
    Reactions         ?: MessageReaction[];
    Priority          ?: MessagePriority;
    Tags              ?: string[];
    CustomData        ?: Record<string, any>;
    // Additional properties used by transformers
    ReplyTo           ?: string;
    QuotedFrom        ?: string;
    QuotedFromUuid    ?: string;
    ThreadTs          ?: string;
    ReplyCount        ?: number;
    ReplyUsers        ?: string[];
    EditedBy          ?: string;
    EditDate          ?: Date;
    Group             ?: any;
    GroupV2           ?: any;
}

export interface QuotedMessage {
    id: string;
    Content         ?: string;
    Author          ?: string;
    Timestamp       ?: Date;
}

export interface DeliveryStatus {
    Sent            ?: Date;
    Delivered       ?: Date;
    Read            ?: Date;
    Failed          ?: Date;
    FailureReason   ?: string;
    // Additional properties used by adapters
    MessageId       ?: string;
    Status          ?: string;
    Timestamp       ?: Date;
    PlatformResponse?: any;
    Error           ?: any;
}

export interface ReadReceipt {
    UserId          ?: string;
    ReadAt          ?: Date;
}

export interface MessageReaction {
    Emoji           ?: string;
    UserId          ?: string;
    Timestamp       ?: Date;
}

export enum MessagePriority {
    Low    = 'low',
    Normal = 'normal',
    High   = 'high',
    Urgent = 'urgent'
}

// Processed Message Content Interface
export interface ProcessedMessageContent {
    Intent          ?: string;
    IntentScore     ?: number;
    Entities        ?: ExtractedEntity[];
    Sentiment       ?: SentimentAnalysis;
    Language        ?: string;
    Translation     ?: string;
    Summary         ?: string;
    Keywords        ?: string[];
    Topics          ?: string[];
    CustomAnalysis  ?: Record<string, any>;
}

export interface ExtractedEntity {
    Type            ?: string;
    Value           ?: string;
    Confidence      ?: number;
    Start           ?: number;
    End             ?: number;
}

export interface SentimentAnalysis {
    Polarity        ?: 'positive' | 'negative' | 'neutral';
    Confidence      ?: number;
    Score           ?: number; // -1 to 1
}

////////////////////////////////////////////////////////////////////////

// Common Message Interface (for internal use)
export interface CommonMessage {
    id: string;
    ConversationId: string;
    UserId          ?: string;
    Channel         ?: ChannelType;
    MessageType     ?: MessageType;
    Direction       ?: MessageDirection;
    Content         ?: MessageContent;
    Metadata        ?: MessageMetadata;
    ProcessedContent?: ProcessedMessageContent;
    Status          ?: MessageStatus;
    Timestamp       ?: Date;
    CreatedAt       ?: Date;
    UpdatedAt       ?: Date;
}

// Message Creation DTO
export interface CreateMessageModel {
    ConversationId: string;
    UserId          ?: string;
    Channel         ?: ChannelType;
    MessageType     ?: MessageType;
    Direction       ?: MessageDirection;
    Content         ?: MessageContent;
    Metadata        ?: Partial<MessageMetadata>;
    Status          ?: MessageStatus;
}

// Message Update DTO
export interface UpdateMessageModel {
    Status          ?: MessageStatus;
    Metadata        ?: Partial<MessageMetadata>;
    ProcessedContent?: Partial<ProcessedMessageContent>;
}

// Message Search Filters
export interface MessageSearchFilters {
    ConversationId?: string;
    UserId          ?: string;
    Channel         ?: ChannelType;
    MessageType     ?: MessageType;
    Direction       ?: MessageDirection;
    Status          ?: MessageStatus;
    DateFrom        ?: Date;
    DateTo          ?: Date;
    HasAttachments  ?: boolean;
    ContainsText    ?: string;
    Limit           ?: number;
    Offset          ?: number;
}

// Message Statistics
export interface MessageStatistics {
    TotalMessages      : number;
    MessagesByChannel  : Record<ChannelType,      number>;
    MessagesByType     : Record<MessageType,      number>;
    MessagesByStatus   : Record<MessageStatus,    number>;
    MessagesByDirection: Record<MessageDirection, number>;
    AverageResponseTime: number;
    DailyMessageCount  : Record<string,           number>;
}

////////////////////////////////////////////////////////////////////////
