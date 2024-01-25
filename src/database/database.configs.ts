import * as dotenv from 'dotenv';
import { TenantEnvironmentProvider } from '../auth/tenant.environment/tenant.environment.provider';

// Load .env file if not yet loaded
if (typeof process.env.NODE_ENV === 'undefined') {
    dotenv.config();
}

/////////////////////////////////////////////////////////////////////////////

export interface DatabaseConfiguration {
    SchemaType      : DatabaseSchema;
    Dialect         : DatabaseDialect;
    ORM             : ORM;
    DatabaseName    : string;
    Host            : string;
    Port            : number;
    Username        : string;
    Password        : string;
    ConnectionString: string;
    Pool            : {
        Max    : number;
        Min    : number;
        Acquire: number;
        Idle   : number;
    };
    Cache  : boolean;
    Logging: boolean;
    Logger : any | null;
}

/////////////////////////////////////////////////////////////////////////////

export type DatabaseDialect = 'postgres' | 'mysql' | 'mongodb' | 'sqlite';
export type DatabaseSchema = 'primary'; //Add any other custom schema types here...
export type ORM = 'Sequelize' | 'TypeORM' | 'Prisma' | 'Knex';

const dialect = process.env.DB_DIALECT as DatabaseDialect;
const orm = 'TypeORM';

const DatabaseConfigs = new Map<string, DatabaseConfiguration>();

/////////////////////////////////////////////////////////////////////////////

const environment = (): string => {
    const environment = process.env.NODE_ENV;
    if (environment === 'production') {
        return 'prod';
    } else if (environment === 'test') {
        return 'test';
    } else if (environment === 'staging') {
        return 'staging';
    } else {
        return 'dev';
    }
};

const createDefaultConfig = (envProvider: TenantEnvironmentProvider): DatabaseConfiguration => {

    const schemaType: DatabaseSchema = 'primary';
    const databaseName = envProvider.getTenantEnvironmentVariable('DATA_BASE_NAME');
    const host = envProvider.getTenantEnvironmentVariable('DB_HOST');
    const username = envProvider.getTenantEnvironmentVariable('DB_USER_NAME');
    const port = envProvider.getTenantEnvironmentVariable('DB_PORT') as string ?? '3306';
    const password = envProvider.getTenantEnvironmentVariable('DB_PASSWORD');
    const connectionString = envProvider.getTenantEnvironmentVariable('DB_CONNECTION_STRING') ?? null;

    return {
        SchemaType       : schemaType,
        Dialect          : dialect,
        ORM              : orm,
        DatabaseName     : databaseName + '_' + environment(), // + '_' + tenantName,
        Host             : host as string,
        Port             : parseInt(port),
        Username         : username as string,
        Password         : password as string,
        ConnectionString : connectionString ?? '',
        Pool             : {
            Max     : 20,
            Min     : 0,
            Acquire : 30000,
            Idle    : 10000,
        },
        Cache   : false,
        Logging : false,
        Logger  : null,
    };
};

/////////////////////////////////////////////////////////////////////////////

export const getDatabaseConfig = (envProvider: TenantEnvironmentProvider): DatabaseConfiguration => {
    const tenantName = envProvider.getTenantName();
    if (DatabaseConfigs.has(tenantName)) {
        return DatabaseConfigs.get(tenantName);
    }
    else {
        const config = createDefaultConfig(tenantName);
        DatabaseConfigs.set(tenantName, config);
        return config;
    }
};

/////////////////////////////////////////////////////////////////////////////
