import { uuid } from "./system.types";

export interface CurrentUser {
    UserId      : uuid;
    TenantId    : uuid;
    TenantCode  : string;
    TenantName  : string;
    DisplayName : string;
    PhoneCode   : string;
    PhoneNumber : string;
    Email       : string;
    UserName    : string;
    SessionId  ?: uuid;
    IsTestUser ?: boolean;
    Roles       : {
        id  : uuid;
        Name: string;
    }[];
}
