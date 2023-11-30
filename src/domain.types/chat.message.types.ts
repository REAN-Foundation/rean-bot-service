import { BaseSearchFilters, BaseSearchResults } from './miscellaneous/base.search.types';
import { uuid } from './miscellaneous/system.types';
import { MessageDirection, MessageContentType, UserFeedbackType } from './enums';

export interface ChatMessageCreateModel {
    TenantId                 ?: uuid;
    UserId                    : uuid;
    SessionId                 : uuid;
    Platform                 ?: string;
    LanguageCode             ?: string;
    Name                     ?: string;
    MessageContent            : string;
    ImageContent             ?: string;
    ImageUrl                 ?: string;
    PlatformUserId           ?: string;
    PlatformMessageId        ?: string;
    PlatformResponseMessageId?: string;
    Direction                ?: MessageDirection;
    ContentType              ?: MessageContentType;
    AssessmentId             ?: uuid;
    AssessmentNodeId          : uuid;
    FeedbackType             ?: UserFeedbackType;
    IdentifiedIntent         ?: string;
}

export interface ChatMessageUpdateModel {
    TenantId                 ?: uuid;
    UserId                   ?: uuid;
    SessionId                ?: uuid;
    Platform                 ?: string;
    LanguageCode             ?: string;
    Name                     ?: string;
    MessageContent           ?: string;
    ImageContent             ?: string;
    ImageUrl                 ?: string;
    PlatformUserId           ?: string;
    PlatformMessageId        ?: string;
    PlatformResponseMessageId?: string;
    Direction                ?: MessageDirection;
    ContentType              ?: MessageContentType;
    AssessmentId             ?: uuid;
    AssessmentNodeId         ?: uuid;
    FeedbackType             ?: UserFeedbackType;
    IdentifiedIntent         ?: string;
}

export interface ChatMessageResponseDto {
    id                       : uuid;
    TenantId                 : uuid;
    UserId                   : uuid;
    SessionId                : uuid;
    Platform                 : string;
    LanguageCode             : string;
    Name                     : string;
    MessageContent           : string;
    ImageContent             : string;
    ImageUrl                 : string;
    PlatformUserId           : string;
    PlatformMessageId        : string;
    PlatformResponseMessageId: string;
    SentTimestamp            : Date;
    DeliveredTimestamp       : Date;
    ReadTimestamp            : Date;
    Direction                : MessageDirection;
    ContentType              : MessageContentType;
    AssessmentId             : uuid;
    AssessmentNodeId         : uuid;
    FeedbackType             : UserFeedbackType;
    IdentifiedIntent         : string;
    HumanHandoff             : boolean;

    /*
    Session?: SessionDto;
    User?: UserDto
    */
}

export interface ChatMessageSearchDto {
    id                : uuid;
    TenantId          : uuid;
    UserId            : uuid;
    SessionId         : uuid;
    Platform          : string;
    Name              : string;
    MessageContent    : string;
    ImageContent      : string;
    ImageUrl          : string;
    SentTimestamp     : Date;
    DeliveredTimestamp: Date;
    ReadTimestamp     : Date;
    Direction         : MessageDirection;
    ContentType       : MessageContentType;
    AssessmentId      : uuid;
    AssessmentNodeId  : uuid;
    FeedbackType      : UserFeedbackType;
    IdentifiedIntent  : string;
    HumanHandoff      : boolean;
}

export interface ChatMessageSearchFilters extends BaseSearchFilters {
    TenantId                 ?: uuid;
    UserId                   ?: uuid;
    SessionId                ?: uuid;
    Platform                 ?: string;
    LanguageCode             ?: string;
    Name                     ?: string;
    MessageContent           ?: string;
    ImageContent             ?: string;
    ImageUrl                 ?: string;
    PlatformUserId           ?: string;
    PlatformMessageId        ?: string;
    PlatformResponseMessageId?: string;
    SentTimestamp            ?: Date;
    DeliveredTimestamp       ?: Date;
    ReadTimestamp            ?: Date;
    Direction                ?: MessageDirection;
    ContentType              ?: MessageContentType;
    AssessmentId             ?: uuid;
    AssessmentNodeId         ?: uuid;
    FeedbackType             ?: UserFeedbackType;
    IdentifiedIntent         ?: string;
    HumanHandoff             ?: boolean;
}

export interface ChatMessageSearchResults extends BaseSearchResults {
    Items: ChatMessageSearchDto[];
}
