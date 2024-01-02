import { DependencyContainer } from "tsyringe";
// import { CurrentClient } from '../../types/miscellaneous/current.client';
// import { CurrentUser } from '../../types/miscellaneous/current.user';

///////////////////////////////////////////////////////////////////////////////////////////////

declare global {
    namespace Express {
        interface Request {
            container          : DependencyContainer;
            tenantName         : string;
            context            : string;
            // currentUser        : CurrentUser;
            // currentClient      : CurrentClient;
            // resourceType       : string;
            // resourceId         : string | number | null | undefined;
            // resourceOwnerUserId: string;
            // authorizeRequest   : boolean;
        }
    }
}
