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
    text: string;
    formatting?: TextFormatting;
}

export interface TextFormatting {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    links?: MessageLink[];
    mentions?: MessageMention[];
}

export interface MessageLink {
    url: string;
    text: string;
    start: number;
    end: number;
}

export interface MessageMention {
    userId: string;
    username: string;
    start: number;
    end: number;
}

export interface MediaMessageContent {
    mediaType: 'image' | 'audio' | 'video' | 'document';
    url: string;
    filename?: string;
    caption?: string;
    mimeType?: string;
    size?: number;
    duration?: number; // for audio/video
    dimensions?: MediaDimensions;
}

export interface MediaDimensions {
    width: number;
    height: number;
}

export interface LocationMessageContent {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
    url?: string;
}

export interface ContactMessageContent {
    name: string;
    phone?: string;
    email?: string;
    organization?: string;
    vcard?: string;
}

export interface InteractiveMessageContent {
    type: InteractiveMessageType;
    text?: string;
    buttons?: MessageButton[];
    listItems?: MessageListItem[];
    header?: MessageHeader;
    footer?: string;
}

export interface MessageButton {
    id: string;
    title: string;
    type: 'reply' | 'url' | 'phone';
    payload?: string;
    url?: string;
    phoneNumber?: string;
}

export interface MessageListItem {
    id: string;
    title: string;
    description?: string;
    payload?: string;
}

export interface MessageHeader {
    type: 'text' | 'image' | 'video' | 'document';
    content: string;
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
