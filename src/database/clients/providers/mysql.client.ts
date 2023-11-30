import * as mysql from 'mysql2';
import { logger } from '../../../logger/logger';
import { DatabaseSchema, getDatabaseConfig } from '../../database.configs';
import { IDatabaseClient } from '../database.client.interface';

//////////////////////////////////////////////////////////////////////////////

export class MysqlClient implements IDatabaseClient {

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

    public executeQuery = (schemaType: DatabaseSchema, query: string): Promise<boolean> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise((resolve, reject) => {
            try {
                const config = getDatabaseConfig(schemaType);

                const connection = mysql.createConnection({
                    host     : config?.Host,
                    user     : config?.Username,
                    password : config?.Password,
                });

                connection.connect(function (err) {
                    if (err) {
                        throw err;
                    }

                    //logger.info('Connected!');
                    connection.query(query, function (err, result) {
                        if (err) {
                            logger.info(err.message);

                            var str = result !== undefined && result !== null ? result.toString() : null;
                            if (str != null) {
                                logger.info(str);
                            } else {
                                logger.info(`Query: ${query}`);
                            }
                        }
                        resolve(true);
                    });
                });
            } catch (error) {
                logger.error(error.message);
                return false;
            }
        });
    };

}
