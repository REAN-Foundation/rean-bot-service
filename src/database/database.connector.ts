/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import { TypeORMDatabaseConnector as connector } from './typeorm/typeorm.database.connector';
import { TenantEnvironmentProvider } from '../auth/tenant.environment/tenant.environment.provider';
import { DataSource } from 'typeorm';
import { DataSourceCache as cache } from './typeorm/data.source.cache';

///////////////////////////////////////////////////////////////////////////////////

export class DatabaseConnector {

    static setup = async (envProvider: TenantEnvironmentProvider): Promise<DataSource> => {
        return await connector.setup(envProvider);
    };

    static close = async (envProvider: TenantEnvironmentProvider): Promise<boolean> => {
        const tenantName = envProvider.getTenantName();
        const source = cache.get(tenantName);
        if (!source) {
            return Promise.resolve(true);
        }
        const closed = await connector.close(source);
        if (closed)
        {
            cache.remove(tenantName);
            return true;
        }
        return false;
    };

    static getDataSource = async (envProvider: TenantEnvironmentProvider): Promise<DataSource> => {
        const tenantName = envProvider.getTenantName();
        const source = cache.get(tenantName);
        if (source) {
            return source;
        }
        const newSource = await this.setup(envProvider);
        cache.set(tenantName, newSource);
        return newSource;
    };

}
