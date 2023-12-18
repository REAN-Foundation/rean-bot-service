import { ChannelType } from './enums';
import { ChatSession } from './message';
import { BaseSearchFilters, BaseSearchResults } from './miscellaneous/base.search.types';
import { uuid } from './miscellaneous/system.types';
import { UserResponseDto } from './user.types';

//////////////////////////////////////////////////////////////////////////////

export interface SessionCreateModel {
    UserId        : uuid;
    Channel       : ChannelType;
    ChannelUserId?: string;
    TenantId     ?: uuid;
    TenantName   ?: string;
}

export interface SessionUpdateModel {
    LastMessageDate?: Date;
}

export interface SessionResponseDto {
    id             : uuid;
    UserId         : uuid;
    Channel        : ChannelType;
    ChannelUserId ?: string;
    LastMessageDate: Date;
    User          ?: UserResponseDto;
}

export interface SessionSearchDto {
    id             : uuid;
    UserId         : uuid;
    Channel        : ChannelType;
    ChannelUserId ?: string;
    LastMessageDate: Date;
}

export interface SessionSearchFilters extends BaseSearchFilters {
    UserId              ?: uuid;
    Channel             ?: string;
    LastMessageDateAfter?: Date;
    LatestCount         ?: number;
}

export interface SessionSearchResults extends BaseSearchResults {
    Items: SessionSearchDto[];
}

//////////////////////////////////////////////////////////////////////////////

export const sessionDtoToChatSession = (session: SessionResponseDto): ChatSession => {
    return {
        id              : session.id,
        UserId          : session.UserId,
        Channel         : session.Channel,
        ChannelUserId   : session.ChannelUserId,
        LastMessageDate : session.LastMessageDate,
    };
};
