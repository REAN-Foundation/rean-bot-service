import fs from 'fs';
import sqlite3, { OPEN_CREATE } from 'sqlite3';
import { logger } from '../../../logger/logger';
import { DatabaseSchema, getDatabaseConfig } from '../../database.configs';
import { IDatabaseClient } from '../database.client.interface';

////////////////////////////////////////////////////////////////

export class SQLiteClient implements IDatabaseClient {

    public createDb = async (schemaType: DatabaseSchema): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(schemaType);
            const databaseName = config?.DatabaseName ?? 'database.db';
            const db = new sqlite3.Database(databaseName, OPEN_CREATE);
            return db != null;
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

    public dropDb = async (schemaType: DatabaseSchema): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(schemaType);
            const databaseName = config?.DatabaseName ?? 'database.db';
            fs.unlinkSync(databaseName);
            return true;
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

    public executeQuery = async (schemaType: DatabaseSchema, query: string): Promise<boolean> => {
        try {
            const config = getDatabaseConfig(schemaType);
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
