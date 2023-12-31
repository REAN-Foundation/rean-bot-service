import 'reflect-metadata';
import { DependencyContainer } from 'tsyringe';
import { MysqlClient } from './providers/mysql.client';
import { PostgresqlClient } from './providers/postgresql.client';
import { SQLiteClient } from './providers/sqlite.client';
import { DatabaseDialect } from '../database.configs';

////////////////////////////////////////////////////////////////////////////////

export class DatabaseClientInjector {

    static registerInjections(container: DependencyContainer) {
        const dialect = process.env.DB_DIALECT as DatabaseDialect;
        if (dialect === 'mysql') {
            container.register('IDatabaseClient', MysqlClient);
        } else if (dialect === 'postgres') {
            container.register('IDatabaseClient', PostgresqlClient);
        } else if (dialect === 'sqlite') {
            container.register('IDatabaseClient', SQLiteClient);
        } else {
            throw new Error(`Unsupported database client!`);
        }
    }

}
