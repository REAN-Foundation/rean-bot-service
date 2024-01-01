import { BaseSearchFilters, BaseSearchResults } from './miscellaneous/base.search.types';
import { JsonString, LangCode, uuid } from './miscellaneous/system.types';
import {
    SupportMessageDirection,
    ChannelType
} from './enums';

//////////////////////////////////////////////////////////////////////////////

export interface SupportMessageCreateModel {
    TenantId                 ?: uuid;
    UserId                    : uuid;
    SessionId                 : uuid;
    SupportChannel           ?: ChannelType;
    UserChannel              ?: ChannelType;
    SupportChannelUserId     ?: string;
    SupportChannelMessageId  ?: string;
    SupportChannelAgentUserId?: string;
    SupportTicketId          ?: string;
    SupportChannelTaskId     ?: string;
    ChatMessageId            ?: uuid;
    LanguageCode             ?: LangCode;
    Direction                ?: SupportMessageDirection;
    Content                  ?: string;
    TranslatedContent        ?: string;
    Timestamp                ?: Date;
    IsSupportResponse        ?: boolean;
    IsExitMessage            ?: boolean;
    Metadata                 ?: JsonString;
}

export interface SupportMessageUpdateModel {
    UserChannel            ?: ChannelType;
    ChannelMessageId       ?: string;
    SupportChannelUserId   ?: string;
    SupportChannelMessageId?: string;
    SupportTicketId        ?: string;
    SupportChannelTaskId   ?: string;
    ChatMessageId          ?: uuid;
    LanguageCode           ?: LangCode;
    Direction              ?: SupportMessageDirection;
    Content                ?: string;
    TranslatedContent      ?: string;
    Timestamp              ?: Date;
    IsExitMessage          ?: boolean;
    Metadata               ?: JsonString;
}

export interface SupportMessageResponseDto {
    id                        : uuid;
    TenantId                 ?: uuid;
    UserId                    : uuid;
    SessionId                 : uuid;
    SupportChannel            : ChannelType;
    UserChannel              ?: ChannelType;
    SupportChannelUserId     ?: string;
    SupportChannelMessageId  ?: string;
    SupportTicketId          ?: string;
    SupportChannelAgentUserId?: string;
    SupportChannelTaskId     ?: string;
    ChatMessageId             : uuid;
    LanguageCode             ?: LangCode;
    Direction                 : SupportMessageDirection;
    Content                   : string;
    TranslatedContent        ?: string;
    Timestamp                 : Date;
    IsExitMessage             : boolean;
    Metadata                 ?: JsonString;
    CreatedAt                 : Date;
    UpdatedAt                 : Date;
}

export interface SupportMessageSearchFilters extends BaseSearchFilters {
    TenantId       ?: uuid;
    UserId         ?: uuid;
    ChannelUserId  ?: string;
    SessionId      ?: uuid;
    SupportChannel ?: ChannelType;
    SupportTicketId?: string;
    LanguageCode   ?: string;
    TimestampAfter ?: Date;
    Direction      ?: SupportMessageDirection;
}

export interface SupportMessageSearchResults extends BaseSearchResults {
    Items: SupportMessageResponseDto[];
}

//////////////////////////////////////////////////////////////////////////////
