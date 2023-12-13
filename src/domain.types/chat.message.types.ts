import { BaseSearchFilters, BaseSearchResults } from './miscellaneous/base.search.types';
import { JsonString, LangCode, uuid } from './miscellaneous/system.types';
import {
    MessageDirection,
    MessageContentType,
    UserFeedbackType,
    MessageHandlerType,
    ChannelType
} from './enums';
import {
    AssessmentDetails,
    Feedback,
    GeoLocation,
    HumanHandoff,
    IntentDetails,
    MessageChannelDetails,
    QnADetails
} from './message';
import { Language } from './language';

//////////////////////////////////////////////////////////////////////////////

export interface ChatMessageCreateModel {
    TenantId             ?: uuid;
    TenantName           ?: string;
    UserId                : uuid;
    SessionId             : uuid;
    Channel              ?: ChannelType;
    LanguageCode         ?: LangCode;
    Direction            ?: MessageDirection;
    MessageType          ?: MessageContentType;
    Content              ?: string;
    Timestamp            ?: Date;
    PrevMessageId        ?: uuid;
    OriginLocation       ?: JsonString;
    ChannelSpecifics     ?: JsonString;
    PrimaryMessageHandler?: MessageHandlerType;
    Metadata             ?: JsonString;
    Intent               ?: JsonString;
    Assessment           ?: JsonString;
    Feedback             ?: JsonString;
    HumanHandoff         ?: JsonString;
    QnA                  ?: JsonString;
}

export interface ChatMessageUpdateModel {
    id                   ?: uuid;
    LanguageCode         ?: LangCode;
    MessageType          ?: MessageContentType;
    Content              ?: string;
    OriginLocation       ?: JsonString;
    ChannelSpecifics     ?: JsonString;
    PrimaryMessageHandler?: MessageHandlerType;
    Metadata             ?: JsonString;
    Intent               ?: JsonString;
    Assessment           ?: JsonString;
    Feedback             ?: JsonString;
    HumanHandoff         ?: JsonString;
    QnA                  ?: JsonString;
}

export interface ChatMessageBaseDto {
    id                    : uuid;
    TenantId             ?: uuid;
    TenantName            : string;
    UserId                : uuid;
    Channel               : ChannelType;
    MessageType           : MessageContentType;
    SessionId            ?: uuid;
    Language             ?: Language;
    Content              ?: string | unknown;
    Timestamp             : Date;
    PrevMessageId        ?: uuid;
}

export interface ChatMessageResponseDto extends ChatMessageBaseDto {
    OriginLocation       ?: GeoLocation;
    ChannelSpecifics     ?: MessageChannelDetails;
    Metadata             ?: Record<string, unknown> | unknown;
    PrimaryMessageHandler : MessageHandlerType;
    Intent               ?: IntentDetails;
    Assessment           ?: AssessmentDetails;
    Feedback             ?: Feedback;
    HumanHandoff         ?: HumanHandoff;
    QnA                  ?: QnADetails;
}

export interface ChatMessageSearchDto extends ChatMessageBaseDto {
    Metadata             ?: Record<string, unknown> | unknown;
    PrimaryMessageHandler : MessageHandlerType;
    IntentName           ?: string;
    AssessmentId         ?: uuid;
    AssessmentNodeId     ?: uuid;
    FeedbackType         ?: UserFeedbackType;
    HumanHandoff         ?: boolean;
    IsQnA                ?: boolean;
}

export interface ChatMessageSearchFilters extends BaseSearchFilters {
    TenantId          ?: uuid;
    UserId            ?: uuid;
    SessionId         ?: uuid;
    Channel           ?: ChannelType;
    LanguageCode      ?: LangCode;
    SentTimestamp     ?: Date;
    DeliveredTimestamp?: Date;
    ReadTimestamp     ?: Date;
    Direction         ?: MessageDirection;
    ContentType       ?: MessageContentType;
    AssessmentId      ?: uuid;
    AssessmentNodeId  ?: uuid;
    FeedbackType      ?: UserFeedbackType;
    IntentName        ?: string;
    HumanHandoff      ?: boolean;
}

export interface ChatMessageSearchResults extends BaseSearchResults {
    Items: ChatMessageSearchDto[];
}
