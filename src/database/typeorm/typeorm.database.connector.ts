/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { logger } from '../../logger/logger';
import { Injector } from '../../startup/injector';
import { DatabaseClient } from '../clients/database.client';
import { DatabaseDialect, getDatabaseConfig } from '../database.configs';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

// Entities imports --->

import { ChatMessage } from './models/chat.message.entity';
import { Session } from './models/session.entity';
import { User } from './models/user.entity';
import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { SupportMessage } from './models/support.message.entity';

// <-- Entities imports

///////////////////////////////////////////////////////////////////////////////////

// const basePath = path.join(__dirname, '../../../entities');
const entities = [
    // Entities--->
    ChatMessage,
    SupportMessage,
    Session,
    User,
    // <---Entities
];

type DBOptions = MysqlConnectionOptions | PostgresConnectionOptions | SqliteConnectionOptions;

///////////////////////////////////////////////////////////////////////////////////

export class TypeORMDatabaseConnector {

    static setup = async (envProvider: TenantEnvironmentProvider): Promise<DataSource> => {
        //Create the database if it does not exist
        const dbClient: DatabaseClient = Injector.BaseContainer.resolve(DatabaseClient);
        if (process.env.NODE_ENV === 'test') {
            //Note: This is only for test environment -> Drop all tables in db
            await dbClient.dropDb(envProvider);
        }
        await dbClient.createDb(envProvider);

        //Initialize TypeORM data source
        const options: DBOptions = this.getDataSourceOptions(envProvider);
        const source = new DataSource(options);
        await this.initialize(source);
        return source;
    };

    private static initialize = (source: DataSource): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            source
                .initialize()
                .then(() => {
                    logger.info('Database connection has been established successfully.');
                    resolve(true);
                })
                .catch((error) => {
                    logger.error('Unable to connect to the database:' + error.message);
                    reject(false);
                });
        });
    };

    public static close = (source: DataSource): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            source
                .destroy()
                .then(() => {
                    logger.info('Database connection has been closed successfully.');
                    resolve(true);
                })
                .catch((error) => {
                    logger.error('Unable to close the database connection:' + error.message);
                    reject(false);
                });
        });
    };

    private static getDataSourceOptions(envProvider: TenantEnvironmentProvider): DBOptions {
        const dialect = process.env.DB_DIALECT as DatabaseDialect;
        const config = getDatabaseConfig(envProvider);
        var tempOptions = {
            name        : config.DatabaseName,
            host        : config.Host,
            port        : config.Port,
            username    : config.Username,
            password    : config.Password,
            database    : config.DatabaseName,
            entities    : entities,
            synchronize : true,
            migrations  : [],
            subscribers : [],
            logging     : true,
            cache       : true,
        };

        if (dialect === 'mysql') {
            const mysqlOptions: MysqlConnectionOptions = {
                ...tempOptions,
                type     : 'mysql',
                logger   : 'advanced-console', //Use console for the typeorm logging
                poolSize : 20,
            };
            return mysqlOptions;
        } else if (dialect === 'postgres') {
            const postgresOptions: PostgresConnectionOptions = {
                ...tempOptions,
                type     : 'postgres',
                logger   : 'advanced-console',
                poolSize : 20,
            };
            return postgresOptions;
        } else if (dialect === 'sqlite') {
            const sqliteOptions: SqliteConnectionOptions = {
                ...tempOptions,
                type   : 'sqlite',
                logger : 'advanced-console', //Use console for the typeorm logging
            };
            return sqliteOptions;
        }
        throw new Error('Unsupported database dialect!');
    }

}
