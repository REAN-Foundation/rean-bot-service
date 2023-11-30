import { Client } from 'pg';
import { logger } from '../../../logger/logger';
import { DatabaseSchema, getDatabaseConfig } from '../../database.configs';
import { IDatabaseClient } from '../database.client.interface';

////////////////////////////////////////////////////////////////

export class PostgresqlClient implements IDatabaseClient {

    public createDb = async (schemaType: DatabaseSchema): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(schemaType);
            const query = `CREATE DATABASE ${config?.DatabaseName}`;
            return await this.executeQuery(schemaType, query);
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

    public dropDb = async (schemaType: DatabaseSchema): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(schemaType);
            const query = `DROP DATABASE IF EXISTS ${config?.DatabaseName}`;
            return await this.executeQuery(schemaType, query);
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

    public executeQuery = async (schemaType: DatabaseSchema, query: string): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(schemaType);
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
