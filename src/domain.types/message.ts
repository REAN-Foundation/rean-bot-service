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
    SupportChannelType   ?: ChannelType;
    SupportChannelUserId ?: string;
    ReferenceMessageId   ?: string;
    IsSupportResponse    ?: boolean; // Message from support agent received on support channel
    SupportTaskId        ?: string;  // TaskId of the support task in support's channel system
    SupportExitMessage   ?: boolean; // Message from support agent to exit the support session
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
    SupportChannel ?: SupportChannel;
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

