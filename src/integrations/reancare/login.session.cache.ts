import { logger } from "../../logger/logger";
import { uuid } from "../../domain.types/miscellaneous/system.types";

//////////////////////////////////////////////////////////////////////////////

export interface LoginSession {
    TenantId?    : string;
    TenantName?  : string;
    TenantUserId?: string;
    AccessToken? : string;
    ExpiryDate?  : Date;
}

//////////////////////////////////////////////////////////////////////////////

export class LoginSessionCache {

    private static _cache: Map<uuid, LoginSession> = new Map<string, LoginSession>();

    public static setSession(tenantName: uuid, session: LoginSession): void {
        this._cache.set(tenantName, session);
    }

    public static getSession(tenantName: uuid): LoginSession | undefined {
        const session = this._cache.get(tenantName);
        if (!session) {
            const message = `No session found for tenantName: ${tenantName}. Regenrating session...`;
            logger.info(message);
            
        }
        const isExpired = session.ExpiryDate < new Date();
        if (isExpired) {
            const message = `Session expired for tenantName: ${tenantName}. Regenrating session...`;
            logger.info(message);
            return undefined;
        }

        return this._cache.get(tenantName);
    }

    public static removeSession(tenantName: uuid): void {
        this._cache.delete(tenantName);
    }

    public static clearCache(): void {
        this._cache.clear();
    }

}
