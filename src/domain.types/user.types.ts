import { BaseSearchFilters, BaseSearchResults } from './miscellaneous/base.search.types';
import { uuid } from './miscellaneous/system.types';
import { Gender } from './enums';

export interface UserCreateModel {
    TenantId         ?: uuid;
    Prefix           ?: string;
    FirstName        ?: string;
    LastName         ?: string;
    Phone            ?: string;
    Email            ?: string;
    Gender           ?: Gender;
    BirthDate        ?: Date;
    PreferredLanguage?: string;
}

export interface UserUpdateModel {
    TenantId         ?: uuid;
    Prefix           ?: string;
    FirstName        ?: string;
    LastName         ?: string;
    Phone            ?: string;
    Email            ?: string;
    Gender           ?: Gender;
    BirthDate        ?: Date;
    PreferredLanguage?: string;
}

export interface UserResponseDto {
    id               : uuid;
    TenantId         : uuid;
    Prefix           : string;
    FirstName        : string;
    LastName         : string;
    Phone            : string;
    Email            : string;
    Gender           : Gender;
    BirthDate        : Date;
    PreferredLanguage: string;
}

export interface UserSearchDto {
    id               : uuid;
    TenantId         : uuid;
    Prefix           : string;
    FirstName        : string;
    LastName         : string;
    Phone            : string;
    Email            : string;
    PreferredLanguage: string;
}

export interface UserSearchFilters extends BaseSearchFilters {
    TenantId         ?: uuid;
    Prefix           ?: string;
    FirstName        ?: string;
    LastName         ?: string;
    Phone            ?: string;
    Email            ?: string;
    Gender           ?: Gender;
    BirthDate        ?: Date;
    PreferredLanguage?: string;
}

export interface UserSearchResults extends BaseSearchResults {
    Items: UserSearchDto[];
}
