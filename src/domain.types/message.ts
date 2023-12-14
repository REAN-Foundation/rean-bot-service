import {
    ChannelType,
    MessageContentType,
    NlpProviderType,
    UserFeedbackType,
    MessageHandlerType,
    QnADocumentType
} from "./enums";
import { uuid } from "./miscellaneous/system.types";
import { Language } from "./language";

////////////////////////////////////////////////////////////////////////////////

export interface MessageChannelDetails {
    Channel                  : ChannelType;
    ChannelUserId           ?: string;
    ChannelMessageId        ?: string;
    ChannelResponseMessageId?: string;
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
    TenantName        : string;
    UserId            : uuid;
    Channel           : ChannelType;
    MessageType       : MessageContentType;
    SessionId        ?: uuid;
    Language         ?: Language;
    Content          ?: string | unknown;
    TranslatedContent?: string | unknown;
    Timestamp         : Date;
    Metadata         ?: Record<string, unknown> | unknown;
    GeoLocation   ?: GeoLocation;
    ChannelSpecifics ?: MessageChannelDetails;
    PrevHistory      ?: Message[];
}

export interface IncomingMessage extends Message {
    PrevOutgoingMessageId ?: uuid;
}

export interface OutgoingMessage extends Message {
    PrevIncomingMessageId ?: uuid;
    PrimaryMessageHandler  : MessageHandlerType;
    Intent                ?: IntentDetails;
    Assessment            ?: AssessmentDetails;
    Feedback              ?: Feedback;
    HumanHandoff          ?: HumanHandoff;
    QnA                   ?: QnADetails;
}
