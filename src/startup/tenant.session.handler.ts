import { EnvVariableCache } from "../auth/tenant.environment/env.variable.cache";
import { logger } from "../logger/logger";
import { LoginSessionCache } from "../integrations/reancare/login.session.cache";

//////////////////////////////////////////////////////////////////////////////

// This class is responsible for initializing tenant user login sessions.

export class TenantSessionHandler {

    //#region Singleton

    private static _instance: TenantSessionHandler = null;

    private constructor() {
    }

    public static instance(): TenantSessionHandler {
        return this._instance || (this._instance = new this());
    }

    //#endregion

    public init = async () => {
        try {
            await this.start();
        } catch (error) {
            logger.error('An error occurred while initializing tenant login session handler.' + error.message);
        }
    };

    private start = async () => {
        try {
            const envCache = EnvVariableCache.getTenantKeys();
            for (const tenantName of envCache) {
                const session = await LoginSessionCache.getSession(tenantName);
                if (!session) {
                    logger.error(`Some problem encountered while fetching session for tenant ${tenantName}`);
                }
            }
        } catch (error) {
            logger.error('An error occurred while starting tenant login session handler.' + error.message);
        }
    };

}
