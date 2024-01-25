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
            const envCache = EnvVariableCache.getTenantKeys();
            for await (const tenantName of envCache) {
                const session = await LoginSessionCache.get(tenantName);
                if (!session) {
                    logger.error(`Some problem encountered while fetching session for tenant ${tenantName}`);
                }
                logger.info(`Session for tenant ${tenantName} -> ${JSON.stringify(session, null, 2)}.`);
            }
        } catch (error) {
            logger.error('An error occurred while initializing tenant login session handler.' + error.message);
        }
    };

}
