import express from 'express';
import { logger } from '../../logger/logger';
import { scoped, Lifecycle } from 'tsyringe';
// import { EnvVariableCache } from '../env.variable.cache'; //Use this

/////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class TenantEnvironmentProvider {

    private _tenantName;

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

        //Environment variables through the EnvVariableCache
        // const envVariable = EnvVariableCache.get(this._tenantName, variableName);
        // if (!envVariable) {
        //     throw new Error("No environment variable found for " + variableName);
        // }

        // Environment variables through the process.env
        const envVariable = process.env[this._tenantName + "_" + variableName];
        return process.env[envVariable];
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
