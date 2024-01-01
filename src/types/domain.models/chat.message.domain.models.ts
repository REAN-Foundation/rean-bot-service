import { BaseSearchFilters, BaseSearchResults } from '../miscellaneous/base.search.types';
import { JsonString, LangCode, uuid } from '../miscellaneous/system.types';
import {
    MessageDirection,
    MessageContentType,
    MessageHandlerType,
    ChannelType
} from '../enums';
import {
    AssessmentDetails,
    Feedback,
    GeoLocation,
    HumanHandoff,
    IncomingMessage,
    OutgoingMessage,
    IntentDetails,
    MessageChannelDetails,
    QnADetails,
    SupportChannel
} from '../common.types';
import { Language } from '../language';

//////////////////////////////////////////////////////////////////////////////

export interface ChatMessageCreateModel {
    TenantId             ?: uuid;
    TenantName           ?: string;
    UserId                : uuid;
    SessionId             : uuid;
    Channel              ?: ChannelType;
    ChannelUserId        ?: string;
    ChannelMessageId     ?: string;
    LanguageCode         ?: LangCode;
    Direction            ?: MessageDirection;
    MessageType          ?: MessageContentType;
    Content              ?: string;
    TranslatedContent    ?: string;
    SupportChannel       ?: SupportChannel;
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
    ChannelMessageId     ?: string;
    LanguageCode         ?: LangCode;
    MessageType          ?: MessageContentType;
    Content              ?: string;
    TranslatedContent    ?: string;
    GeoLocation          ?: JsonString;
    ChannelSpecifics     ?: JsonString;
    PrimaryMessageHandler?: MessageHandlerType;
    SupportChannel       ?: SupportChannel;
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
    ChannelMessageId     ?: string;
    MessageType           : MessageContentType;
    SessionId            ?: uuid;
    Language             ?: Language;
    Content              ?: string | unknown;
    TranslatedContent    ?: string;
    SupportTicketId      ?: string;
    SupportMessageId     ?: uuid;
    Timestamp             : Date;
    PrevMessageId        ?: uuid;
}

export interface ChatMessageResponseDto extends ChatMessageBaseDto {
    SupportChannel       ?: SupportChannel;
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

//////////////////////////////////////////////////////////////////////////////

export const incomingMessageToCreateModel = (m: IncomingMessage): ChatMessageCreateModel => {
    if (m == null) {
        return null;
    }
    const model: ChatMessageCreateModel = {
        TenantId              : m.TenantId,
        TenantName            : m.TenantName,
        UserId                : m.UserId,
        SessionId             : m.SessionId,
        Channel               : m.Channel,
        ChannelUserId         : m.ChannelUser?.ChannelUserId,
        ChannelMessageId      : m.ChannelMessageId,
        MessageType           : m.MessageType,
        LanguageCode          : m.Language?.Code,
        Direction             : MessageDirection.In,
        Content               : m.Content,
        TranslatedContent     : m.TranslatedContent,
        Timestamp             : m.Timestamp,
        PrevMessageId         : m.PrevContextMessageId,
        GeoLocation           : m.GeoLocation ? JSON.stringify(m.GeoLocation) : null,
        ChannelSpecifics      : m.ChannelSpecifics ? JSON.stringify(m.ChannelSpecifics) : null,
        PrimaryMessageHandler : null,
        Metadata              : m.Metadata ? JSON.stringify(m.Metadata) : null,
        Intent                : null,
        Assessment            : null,
        Feedback              : null,
        HumanHandoff          : null,
        QnA                   : null,
    };
    return model;
};

export const outgoingMessageToCreateModel = (m: OutgoingMessage): ChatMessageCreateModel => {
    if (m == null) {
        return null;
    }
    const model: ChatMessageCreateModel = {
        TenantId              : m.TenantId,
        TenantName            : m.TenantName,
        UserId                : m.UserId,
        SessionId             : m.SessionId,
        Channel               : m.Channel,
        ChannelUserId         : m.ChannelUser?.ChannelUserId,
        ChannelMessageId      : m.ChannelMessageId,
        MessageType           : m.MessageType,
        LanguageCode          : m.Language?.Code,
        Direction             : MessageDirection.Out,
        Content               : m.Content,
        TranslatedContent     : m.TranslatedContent,
        Timestamp             : m.Timestamp,
        PrevMessageId         : m.PrevContextMessageId,
        GeoLocation           : m.GeoLocation ? JSON.stringify(m.GeoLocation) : null,
        ChannelSpecifics      : m.ChannelSpecifics ? JSON.stringify(m.ChannelSpecifics) : null,
        PrimaryMessageHandler : m.PrimaryMessageHandler,
        Metadata              : m.Metadata ? JSON.stringify(m.Metadata) : null,
        Intent                : m.Intent ? JSON.stringify(m.Intent) : null,
        Assessment            : m.Assessment ? JSON.stringify(m.Assessment) : null,
        Feedback              : m.Feedback ? JSON.stringify(m.Feedback) : null,
        HumanHandoff          : m.HumanHandoff ? JSON.stringify(m.HumanHandoff) : null,
        QnA                   : m.QnA ? JSON.stringify(m.QnA) : null,
    };
    return model;
};

