import { logger } from "../../logger/logger";
import { uuid } from "../../types/miscellaneous/system.types";
import { EnvVariableCache } from "../../auth/tenant.environment/env.variable.cache";
import { loginWithPassword } from "./api.access/user";

//////////////////////////////////////////////////////////////////////////////

export interface LoginSession {
    TenantId?       : string;
    TenantName?     : string;
    TenantUserId   ?: string;
    AccessToken?    : string;
    LoginSessionId? : string;
    ExpiryDate?     : Date;
}

//////////////////////////////////////////////////////////////////////////////
// LoginSessionCache -> This login session cache is for tenant admin users.
// NOTE - This is not for patient users.
// This is a store for access tokens for tenant admin users to act on behalf
// of the patients in certain use-cases. This is only applicable internal
// client applications such as bot service.
// This access is guarded by client api key of bot service.
//////////////////////////////////////////////////////////////////////////////

export class LoginSessionCache {

    private static _cache: Map<uuid, LoginSession> = new Map<string, LoginSession>();

    public static set(tenantName: uuid, session: LoginSession): void {
        this._cache.set(tenantName, session);
    }

    public static async get(tenantName: uuid): Promise<LoginSession | undefined> {
        const session = this._cache.get(tenantName);
        if (!session) {
            const message = `No session found for tenantName: ${tenantName}. Regenrating session...`;
            logger.info(message);
            const session = await this.tenantUserLogin(tenantName);
            this._cache.set(tenantName, session);
        }
        const isExpired = session.ExpiryDate < new Date();
        if (isExpired) {
            const message = `Session expired for tenantName: ${tenantName}. Regenrating session...`;
            logger.info(message);
            const session = await this.tenantUserLogin(tenantName);
            this._cache.set(tenantName, session);
        }
        return this._cache.get(tenantName);
    }

    public static remove(tenantName: uuid): void {
        this._cache.delete(tenantName);
    }

    public static clearCache(): void {
        this._cache.clear();
    }

    private static tenantUserLogin = async (tenantName: string): Promise<LoginSession> => {
        const tenantDetails = EnvVariableCache.getAllForTenant(tenantName);
        const tenantId = tenantDetails?.TENANT_ID;
        const tenantUserId = tenantDetails?.TENANT_USER_ID;
        const tenantUserName = tenantDetails?.TENANT_USER_NAME;
        const tenantUserPassword = tenantDetails?.TENANT_USER_PASSWORD;

        const response = await loginWithPassword(tenantId, tenantUserId, tenantUserName, tenantUserPassword);
        if (!response) {
            const message = `Session could not be generated for tenantName: ${tenantName}.`;
            logger.error(message);
            return undefined;
        }
        const session: LoginSession = {
            TenantId       : tenantId,
            TenantName     : tenantName,
            TenantUserId   : tenantUserId,
            AccessToken    : response?.AccessToken,
            LoginSessionId : response?.SessionId,
            ExpiryDate     : response?.SessionValidTill,
        };

        return session;
    };

}
