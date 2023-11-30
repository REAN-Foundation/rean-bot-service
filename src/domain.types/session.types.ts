import { BaseSearchFilters, BaseSearchResults } from './miscellaneous/base.search.types';
import { uuid } from './miscellaneous/system.types';

export interface SessionCreateModel {
    UserId  : uuid;
    Platform: string;
}

export interface SessionUpdateModel {
    UserId  ?: uuid;
    Platform?: string;
}

export interface SessionResponseDto {
    id             : uuid;
    UserId         : uuid;
    Platform       : string;
    LastMessageDate: Date;

    /*
    User?: UserDto
    */
}

export interface SessionSearchDto {
    id             : uuid;
    UserId         : uuid;
    Platform       : string;
    LastMessageDate: Date;
}

export interface SessionSearchFilters extends BaseSearchFilters {
    UserId         ?: uuid;
    Platform       ?: string;
    LastMessageDate?: Date;
}

export interface SessionSearchResults extends BaseSearchResults {
    Items: SessionSearchDto[];
}
