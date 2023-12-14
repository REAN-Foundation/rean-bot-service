import { BaseSearchFilters, BaseSearchResults } from './miscellaneous/base.search.types';
import { JsonString, LangCode, uuid } from './miscellaneous/system.types';
import {
    MessageDirection,
    MessageContentType,
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
    ChannelUserId        ?: string;
    LanguageCode         ?: LangCode;
    Direction            ?: MessageDirection;
    MessageType          ?: MessageContentType;
    Content              ?: string;
    TranslatedContent    ?: string;
    Timestamp            ?: Date;
    PrevMessageId        ?: uuid;
    GeoLocation          ?: JsonString;
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
    TranslatedContent    ?: string;
    GeoLocation          ?: JsonString;
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
    ChannelUserId         : string;
    MessageType           : MessageContentType;
    SessionId            ?: uuid;
    Language             ?: Language;
    Content              ?: string | unknown;
    TranslatedContent    ?: string;
    Timestamp             : Date;
    PrevMessageId        ?: uuid;
}

export interface ChatMessageResponseDto extends ChatMessageBaseDto {
    GeoLocation          ?: GeoLocation;
    ChannelSpecifics     ?: MessageChannelDetails;
    Metadata             ?: Record<string, unknown> | unknown;
    PrimaryMessageHandler : MessageHandlerType;
    Intent               ?: IntentDetails;
    Assessment           ?: AssessmentDetails;
    Feedback             ?: Feedback;
    HumanHandoff         ?: HumanHandoff;
    QnA                  ?: QnADetails;
}

export interface ChatMessageSearchFilters extends BaseSearchFilters {
    TenantId      ?: uuid;
    UserId        ?: uuid;
    ChannelUserId ?: string;
    SessionId     ?: uuid;
    Channel       ?: string;
    LanguageCode  ?: string;
    TimestampAfter?: Date;
    Direction     ?: MessageDirection;
    ContentType   ?: MessageContentType;
    PrimaryHandler?: MessageHandlerType;
}

export interface ChatMessageSearchResults extends BaseSearchResults {
    Items: ChatMessageResponseDto[];
}
