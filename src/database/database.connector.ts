/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import { Config } from './database.config';
import { logger } from '../logger/logger';
import { DataSource } from "typeorm";
import path from "path";
import { Condition } from './models/condition.entity';
import { Rule } from './models/rule.entity';
import { DBLogger } from "./database.logger";
import { DbClient } from "./db.clients/db.client";

///////////////////////////////////////////////////////////////////////////////////

logger.info(`Environment : ${process.env.NODE_ENV}`);
logger.info(`Database Name : ${Config.database}`);
logger.info(`Database Username : ${Config.username}`);
logger.info(`Database Host : ${Config.host}`);

///////////////////////////////////////////////////////////////////////////////////

class DatabaseConnector {

    static _basePath = path.join(process.cwd(), 'src/database/models').replace(/\\/g, '/');

    static _source = new DataSource({
        name        : Config.dialect,
        type        : Config.dialect,
        host        : Config.host,
        port        : Config.port,
        username    : Config.username,
        password    : Config.password,
        database    : Config.database,
        synchronize : true,
        //entities    : [this._basePath + '/**/*.model{.ts,.js}'],
        entities    : [
            Condition,
            Rule,
        ],
        migrations  : [],
        subscribers : [],
        // logger      : 'advanced-console', //Use console for the typeorm logging
        logger      : new DBLogger(),
        logging     : false,
        poolSize    : Config.pool.max,
        cache       : true,
    });

    private static initialize = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._source
                .initialize()
                .then(() => {
                    logger.info('🔄 Database connection has been established successfully.');
                    resolve(true);
                })
                .catch((error) => {
                    logger.error('❌ Unable to connect to the database:' + error.message);
                    reject(false);
                });
        });
    };

    static setup = async (): Promise<boolean> => {
        logger.info('🛢️ Setting up the database...');
        if (process.env.NODE_ENV === 'test') {
            //Note: This is only for test environment
            //Drop all tables in db
            await DbClient.dropDatabase();
        }
        await DbClient.createDatabase();
        await DatabaseConnector.initialize();
        return true;
    };

    static close = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this._source
                .destroy()
                .then(() => {
                    logger.info('🔄 Database connection has been closed successfully.');
                    resolve(true);
                })
                .catch((error) => {
                    logger.error('❌ Unable to close the database connection:' + error.message);
                    reject(false);
                });
        });
    };

}

///////////////////////////////////////////////////////////////////////////////////

// function getFoldersRecursively(location: string) {
//     const items = fs.readdirSync(location, { withFileTypes: true });
//     let paths = [];
//     for (const item of items) {
//         if (item.isDirectory()) {
//             const fullPath = path.join(location, item.name);
//             const childrenPaths = this.getFoldersRecursively(fullPath);
//             paths = [
//                 ...paths,
//                 fullPath,
//                 ...childrenPaths,
//             ];
//         }
//     }
//     return paths;
// }
//Usage
// static _folders = this.getFoldersRecursively(this._basePath)
//     .map(y => y.replace(/\\/g, '/'))
//     .map(x => '"' + x + '/*.js"');

///////////////////////////////////////////////////////////////////////////////////

const Source = DatabaseConnector._source;

export { DatabaseConnector, Source };
