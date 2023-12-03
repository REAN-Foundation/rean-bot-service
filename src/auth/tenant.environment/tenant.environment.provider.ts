import express from 'express';
import { logger } from '../../logger/logger';
import { scoped, Lifecycle } from 'tsyringe';
import { EnvVariableCache } from './env.variable.cache';

/////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class TenantEnvironmentProvider {

    private _tenantName;

    private _useCache = process.env.USE_ENV_CACHE === 'true' ? true : false;

    setTenantName = (tenantName) => {
        this._tenantName = tenantName;
    };

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

    tenantNameMiddleware = (request: express.Request, response: express.Response, next:express.NextFunction) => {
        if (request.params.tenant) {
            this.setTenantName(request.params.tenant);
            next();
        } else {
            const tenantName = request.url.split('/')[2];
            if (tenantName && tenantName !== "") {
                this.setTenantName(tenantName);
                next();
            }
            else {
                logger.error('Tenant name cannot be retrieved from request!');
                response.status(400).send('Tenant name cannot be retrieved from request!');
            }
        }
    };

}
