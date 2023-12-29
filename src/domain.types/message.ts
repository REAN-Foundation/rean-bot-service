import {
    ChannelType,
    MessageContentType,
    NlpProviderType,
    UserFeedbackType,
    MessageHandlerType,
    QnADocumentType,
    MessageDirection,
    SupportMessageDirection
} from "./enums";
import { uuid } from "./miscellaneous/system.types";
import { Language, LanguageCode } from "./language";

////////////////////////////////////////////////////////////////////////////////

export interface Acknowledgement {
    ShouldAcknowledge : boolean;
    Message          ?: string;
    StatusCode       ?: number;
    Data             ?: any;
}

export interface MessageChannelDetails {
    Channel             : ChannelType;
    ReferenceMessageId ?: string;
    SentTimestamp      ?: Date;
    DeliveredTimestamp ?: Date;
    ReadTimestamp      ?: Date;
    BotId              ?: string;
    BotPhoneNumber     ?: string;
}

export interface ChannelUser {
    ChannelUserId?: string;
    FirstName    ?: string;
    LastName     ?: string;
    Email        ?: string;
    Phone        ?: string;
}

export interface SupportChannel {
    SupportChannelType     ?: ChannelType;
    MessageDirection       ?: SupportMessageDirection;
    SupportChannelUserId   ?: string;  // UserId in support's channel system
    SupportChannelAgentId  ?: string;  // Support Agent/ Expert Id in support's channel system
    ChatMessageId          ?: string;  // MessageId of the chat in our database
    TicketId               ?: string;  // TicketId of the support event
    SupportChannelTaskId   ?: string;  // TaskId of the support task in support's channel system
    SupportChannelMessageId?: string;  // MessageId of the message in support's channel system, Could be same as SupportChannelTaskId!
    IsExitMessage          ?: boolean; // Message from support agent to exit the support session
}

export interface GeoLocation {
    Latitude ?: number;
    Longitude?: number;
    Country  ?: string;
    State    ?: string;
    City     ?: string;
    ZipCode  ?: string;
    MapUrl   ?: string;
}

export interface Feedback {
    FeedbackContent?: string;
    FeedbackType   ?: UserFeedbackType;
    SupportHandler ?: SupportChannel;
    Rating         ?: number;
}

export interface HumanHandoff {
    IsHandoff      : boolean;
    SupportHandler?: SupportChannel;
}

export interface AssessmentDetails {
    AssessmentId   : uuid;
    AssessmentName : string;
    TemplateId     : uuid;
    CurrentNodeId ?: uuid;
    Question      ?: string;
    Hint          ?: string;
    UserResponse  ?: string | number | boolean | unknown;
}

export interface IntentDetails {
    NLPProvider     : NlpProviderType;
    IntentName      : string;
    Confidence     ?: number;
    Handlers       ?: string[];
    HandlerResponse?: string | unknown;
}

export interface QnADocument {
    DocumentId: string;
    Type      : QnADocumentType; // CSV, Text, JSON, etc.
    Title     : string;
    Url       : string;
}

export interface QnADetails {
    Question          : string;
    SelectedDocuments : QnADocument[];
    Prompt            : string;
    Answer           ?: string;
    Confidence       ?: number;
}

export interface OptionButton {
    id       : string;
    Title    : string;
    ImageUrl?: string;
}

export enum OptionButtonType {
    Template    = 'Template',
    Interactive = 'Interactive',
    Other       = 'Other',
}

export interface OptionsUI {
    Title      ?: string;
    Template   ?: string;
    ButtonType ?: OptionButtonType;
    Language   ?: LanguageCode;
    Options     : OptionButton[];
}

export interface Message {
    id                  ?: uuid;
    TenantId            ?: uuid;
    TenantName          ?: string;
    UserId              ?: uuid;
    ChannelUser         ?: ChannelUser;
    Channel              : ChannelType;
    ChannelMessageId    ?: string;
    MessageType         ?: MessageContentType;
    Direction            : MessageDirection;
    SessionId           ?: uuid;
    Language            ?: Language;
    Content             ?: string;
    TranslatedContent   ?: string;
    Timestamp            : Date;
    Metadata            ?: Record<string, any>;
    GeoLocation         ?: GeoLocation;
    ChannelSpecifics    ?: MessageChannelDetails;
    PrevContextMessageId?: uuid;
}

export interface IncomingMessage extends Message {
    // This interface is used to deserialize the message object
}

export interface OutgoingMessage extends Message {
    PrimaryMessageHandler ?: MessageHandlerType;
    SmallTalk             ?: boolean;
    Intent                ?: IntentDetails;
    Assessment            ?: AssessmentDetails;
    Feedback              ?: Feedback;
    HumanHandoff          ?: HumanHandoff;
    QnA                   ?: QnADetails;
    OptionsUI             ?: OptionsUI;
}

export interface SerializableMessage extends IncomingMessage, OutgoingMessage {
    // This interface is used to serialize the message object
}

export type ProcessibleMessage = SerializableMessage;

export interface ChatSession {
    id              ?: uuid;
    TenantId        ?: uuid;
    TenantName      ?: string;
    UserId           : uuid;
    UserFirstName   ?: string;
    UserLastName    ?: string;
    Channel          : ChannelType;
    ChannelUserId   ?: string;
    LastMessageDate ?: Date;
    Language        ?: string;
}

export interface SupportMessage {
    UserId                  : uuid;
    TenantId               ?: uuid;
    TenantName             ?: string;
    SupportChannelType     ?: ChannelType;
    MessageDirection       ?: SupportMessageDirection;
    SupportChannelUserId   ?: string;  // UserId in support's channel system
    SupportChannelAgentId  ?: string;  // Support Agent/ Expert Id in support's channel system
    ChatMessageId          ?: string;  // MessageId of the chat in our database
    TicketId               ?: string;  // TicketId of the support event
    SupportChannelTaskId   ?: string;  // TaskId of the support task in support's channel system
    SupportChannelMessageId?: string;  // MessageId of the message in support's channel system, Could be same as SupportChannelTaskId!
    IsExitMessage          ?: boolean; // Message from support agent to exit the support session
}

export interface OutgoingSupportMessage extends SupportMessage {
    Feedback           ?: Feedback;
    HumanHandoff       ?: HumanHandoff;
    MainChannelMessage ?: Message;
}
