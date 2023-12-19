import {
    ChannelType,
    MessageContentType,
    NlpProviderType,
    UserFeedbackType,
    MessageHandlerType,
    QnADocumentType,
    MessageDirection
} from "./enums";
import { uuid } from "./miscellaneous/system.types";
import { Language } from "./language";

////////////////////////////////////////////////////////////////////////////////

export interface Acknowledgement {
    ShouldAcknowledge : boolean;
    Message          ?: string;
    StatusCode       ?: number;
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

export interface SupportChannel extends MessageChannelDetails {
    SupportTaskId: string;
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

export interface Message {
    id               ?: uuid;
    TenantId         ?: uuid;
    TenantName       ?: string;
    UserId           ?: uuid;
    ChannelUser      ?: ChannelUser;
    Channel           : ChannelType;
    ChannelMessageId ?: string;
    MessageType      ?: MessageContentType;
    Direction         : MessageDirection;
    SessionId        ?: uuid;
    Language         ?: Language;
    Content          ?: string;
    TranslatedContent?: string;
    Timestamp         : Date;
    Metadata         ?: Record<string, unknown> | unknown;
    GeoLocation      ?: GeoLocation;
    ChannelSpecifics ?: MessageChannelDetails;
    PrevContextMessageId ?: uuid;
    // PrevHistory      ?: Message[];
}

export interface IncomingMessage extends Message {
    // This interface is used to deserialize the message object
}

export interface OutgoingMessage extends Message {
    PrimaryMessageHandler ?: MessageHandlerType;
    Intent                ?: IntentDetails;
    Assessment            ?: AssessmentDetails;
    Feedback              ?: Feedback;
    HumanHandoff          ?: HumanHandoff;
    QnA                   ?: QnADetails;
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
}
