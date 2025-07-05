import { CurrentClient } from "../../domain.types/miscellaneous/current.client";
import { CurrentUser } from "../../domain.types/miscellaneous/current.user";

declare global{
    namespace Express {
        interface Request {
            tenantId           ?: string;
            tenantSchema       ?: string;
            tenant             ?: any;
            currentUser         : CurrentUser,
            currentClient       : CurrentClient
            context             : string;
            resourceType        : string;
            resourceId          : string | number | null | undefined;
            resourceOwnerUserId?: string;
            currentUserTenantId?: string;
            resourceTenantId    : string | null | undefined;
            allowAnonymous      : boolean;                             //User authorization is not needed. Client app authentication is needed. May need user authentication.
            publicUrl           : boolean;                             //Public URL. No type of authentication is required. For example, download link for public profile image, etc.
        }
    }
}
