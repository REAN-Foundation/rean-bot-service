import fs from 'fs';
import sqlite3, { OPEN_CREATE } from 'sqlite3';
import { logger } from '../../../logger/logger';
import { getDatabaseConfig } from '../../database.configs';
import { IDatabaseClient } from '../database.client.interface';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';

////////////////////////////////////////////////////////////////

export class SQLiteClient implements IDatabaseClient {

    public createDb = async (envProvider: TenantEnvironmentProvider): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(envProvider);
            const databaseName = config?.DatabaseName ?? 'database.db';
            const db = new sqlite3.Database(databaseName, OPEN_CREATE);
            return db != null;
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

    public dropDb = async (envProvider: TenantEnvironmentProvider): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(envProvider);
            const databaseName = config?.DatabaseName ?? 'database.db';
            fs.unlinkSync(databaseName);
            return true;
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

    public executeQuery = async (envProvider: TenantEnvironmentProvider, query: string): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(envProvider);
            const databaseName = config?.DatabaseName ?? 'database.db';
            const db = new sqlite3.Database(databaseName);
            db.run(query, (err) => {
                logger.info(err?.message ?? 'Error executing query');
                return false;
            });
            return true;
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

}
