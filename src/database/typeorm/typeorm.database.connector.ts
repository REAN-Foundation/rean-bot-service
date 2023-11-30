/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import path from 'path';
import fs from 'fs';
import { DataSource } from 'typeorm';
import { logger } from '../../logger/logger';
import { Injector } from '../../startup/injector';
import { DatabaseClient } from '../clients/database.client';
import { DatabaseDialect, DatabaseSchema, getDatabaseConfig } from '../database.configs';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

// Entities imports --->

import { ChatMessage } from './models/chat.message.entity';
import { Session } from './models/session.entity';
import { User } from './models/user.entity';

// <-- Entities imports

///////////////////////////////////////////////////////////////////////////////////

class TypeORMDatabaseConnector {

    static dialect = process.env.DB_DIALECT as DatabaseDialect;

    static _basePath = path.join(__dirname, '../../../entities');

    // static _folders = this.getFoldersRecursively(this._basePath);

    static _entities = [
        // Entities--->
        ChatMessage,
        Session,
        User,
        // <---Entities
    ];

    static _options: MysqlConnectionOptions | PostgresConnectionOptions | SqliteConnectionOptions =
        this.getDataSourceOptions(this._entities);

    static _source = new DataSource(this._options);

    static setup = async (): Promise<boolean> => {
        var schemaType: DatabaseSchema = 'primary';
        const databaseClient: DatabaseClient = Injector.Container.resolve(DatabaseClient);
        if (process.env.NODE_ENV === 'test') {
            //Note: This is only for test environment
            //Drop all tables in db
            await databaseClient.dropDb(schemaType);
        }
        await databaseClient.createDb(schemaType);
        await this.initialize();
        return true;
    };

    private static initialize = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._source
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

    public static close = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._source
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

    private static getDataSourceOptions(
        entities: any[]
    ): MysqlConnectionOptions | PostgresConnectionOptions | SqliteConnectionOptions {
        const dialect = process.env.DB_DIALECT as DatabaseDialect;
        const config = getDatabaseConfig('primary');
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

    // private static getFoldersRecursively(location: string) {
    //     const recursiveFolders = (location: string) => {
    //         const items = fs.readdirSync(location, { withFileTypes: true });
    //         let paths: string[] = [];
    //         for (const item of items) {
    //             if (item.isDirectory()) {
    //                 const fullPath = path.join(location, item.name);
    //                 const childrenPaths = recursiveFolders(fullPath);
    //                 paths = [
    //                     ...paths,
    //                     fullPath,
    //                     ...childrenPaths,
    //                 ];
    //             }
    //         }
    //         return paths;
    //     };
    //     const paths = recursiveFolders(location);
    //     var folders = paths
    //         .map(y => y.replace(/\\/g, '/'))
    //         .map(x => '"' + x + '/*.js"');
    //     return folders;
    // }

}

///////////////////////////////////////////////////////////////////////////////////

const Source = TypeORMDatabaseConnector._source;

export { TypeORMDatabaseConnector, Source };
