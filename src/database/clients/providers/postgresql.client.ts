import { Client } from 'pg';
import { logger } from '../../../logger/logger';
import { getDatabaseConfig } from '../../database.configs';
import { IDatabaseClient } from '../database.client.interface';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';

////////////////////////////////////////////////////////////////

export class PostgresqlClient implements IDatabaseClient {

    public createDb = async (envProvider: TenantEnvironmentProvider): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(envProvider);
            const query = `CREATE DATABASE ${config?.DatabaseName}`;
            return await this.executeQuery(envProvider, query);
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

    public dropDb = async (envProvider: TenantEnvironmentProvider): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(envProvider);
            const query = `DROP DATABASE IF EXISTS ${config?.DatabaseName}`;
            return await this.executeQuery(envProvider, query);
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

    public executeQuery = async (envProvider: TenantEnvironmentProvider, query: string): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(envProvider);
            const client = new Client({
                user     : config?.Username,
                host     : config?.Host,
                password : config?.Password,
                port     : config?.Port,
            });
            await client.connect();
            await client.query(query);
            await client.end();
            return true;
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

}
