import { scoped, Lifecycle, inject, injectable } from 'tsyringe';
import { EnvVariableCache } from './env.variable.cache';

/////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
@injectable()
export class TenantEnvironmentProvider {

    private _tenantName = null;

    private _useCache = process.env.USE_ENV_CACHE === 'true' ? true : false;

    constructor(@inject("TenantName") tenantName?: string) {
        if (tenantName) {
            this._tenantName = tenantName;
        }
    }

    getTenantName = () => {
        if (!this._tenantName) {
            throw new Error("No client name provided");
        }
        return this._tenantName;
    };

    getTenantEnvironmentVariable = (variableName) => {
        if (this._useCache) {
            const envVariable = EnvVariableCache.get(this._tenantName, variableName);
            if (envVariable) {
                return envVariable;
            }
            throw new Error("No environment variable found for " + variableName);
        }
        else {
            const envVariable = process.env[this._tenantName + "_" + variableName];
            if (envVariable) {
                return process.env[envVariable];
            }
            throw new Error("No environment variable found for " + variableName);
        }
    };

}
