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
    Slack = 'slack',
    Signal = 'signal',
    Web = 'web',
    SMS = 'sms',
    Email = 'email'
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
    channelMessageId?: string;
    referenceMessageId?: string;
    threadId?: string;
    forwardedFrom?: string;
    isForwarded?: boolean;
    editedAt?: Date;
    quotedMessage?: QuotedMessage;
    deliveryStatus?: DeliveryStatus;
    readBy?: ReadReceipt[];
    reactions?: MessageReaction[];
    priority?: MessagePriority;
    tags?: string[];
    customData?: Record<string, any>;
}

export interface QuotedMessage {
    id: string;
    content: string;
    author: string;
    timestamp: Date;
}

export interface DeliveryStatus {
    sent?: Date;
    delivered?: Date;
    read?: Date;
    failed?: Date;
    failureReason?: string;
}

export interface ReadReceipt {
    userId: string;
    readAt: Date;
}

export interface MessageReaction {
    emoji: string;
    userId: string;
    timestamp: Date;
}

export enum MessagePriority {
    Low = 'low',
    Normal = 'normal',
    High = 'high',
    Urgent = 'urgent'
}

// Processed Message Content Interface
export interface ProcessedMessageContent {
    intent?: string;
    intentScore?: number;
    entities?: ExtractedEntity[];
    sentiment?: SentimentAnalysis;
    language?: string;
    translation?: string;
    summary?: string;
    keywords?: string[];
    topics?: string[];
    customAnalysis?: Record<string, any>;
}

export interface ExtractedEntity {
    type: string;
    value: string;
    confidence: number;
    start: number;
    end: number;
}

export interface SentimentAnalysis {
    polarity: 'positive' | 'negative' | 'neutral';
    confidence: number;
    score: number; // -1 to 1
}

////////////////////////////////////////////////////////////////////////

// Common Message Interface (for internal use)
export interface CommonMessage {
    id: string;
    conversationId: string;
    userId: string;
    channel: ChannelType;
    messageType: MessageType;
    direction: MessageDirection;
    content: MessageContent;
    metadata?: MessageMetadata;
    processedContent?: ProcessedMessageContent;
    status: MessageStatus;
    timestamp: Date;
    createdAt: Date;
    updatedAt?: Date;
}

// Message Creation DTO
export interface CreateMessageDto {
    conversationId: string;
    userId: string;
    channel: ChannelType;
    messageType: MessageType;
    direction: MessageDirection;
    content: MessageContent;
    metadata?: Partial<MessageMetadata>;
    status?: MessageStatus;
}

// Message Update DTO
export interface UpdateMessageDto {
    status?: MessageStatus;
    metadata?: Partial<MessageMetadata>;
    processedContent?: Partial<ProcessedMessageContent>;
}

// Message Search Filters
export interface MessageSearchFilters {
    conversationId?: string;
    userId?: string;
    channel?: ChannelType;
    messageType?: MessageType;
    direction?: MessageDirection;
    status?: MessageStatus;
    dateFrom?: Date;
    dateTo?: Date;
    hasAttachments?: boolean;
    containsText?: string;
    limit?: number;
    offset?: number;
}

// Message Statistics
export interface MessageStatistics {
    totalMessages: number;
    messagesByChannel: Record<ChannelType, number>;
    messagesByType: Record<MessageType, number>;
    messagesByStatus: Record<MessageStatus, number>;
    messagesByDirection: Record<MessageDirection, number>;
    averageResponseTime: number;
    dailyMessageCount: Record<string, number>;
}

////////////////////////////////////////////////////////////////////////
