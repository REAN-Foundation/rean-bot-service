import * as dotenv from 'dotenv';

// Load .env file if not yet loaded
if (typeof process.env.NODE_ENV === 'undefined') {
    dotenv.config();
}
/////////////////////////////////////////////////////////////////////////////

export type DatabaseDialect = 'postgres' | 'mysql' | 'mongodb' | 'sqlite';
export type DatabaseSchema = 'primary' | 'analytics'; //Add any other custom schema types here...
export type ORM = 'Sequelize' | 'TypeORM' | 'Prisma' | 'Knex';

const dialect = process.env.DB_DIALECT as DatabaseDialect;
const orm = 'TypeORM';

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

const createDefaultConfig = (): DatabaseConfiguration => {
    return {
        SchemaType       : 'primary',
        Dialect          : dialect,
        ORM              : orm,
        DatabaseName     : (process.env.DB_NAME as string) + '_' + environment(),
        Host             : process.env.DB_HOST as string,
        Port             : parseInt(process.env.DB_PORT as string),
        Username         : process.env.DB_USER_NAME as string,
        Password         : process.env.DB_USER_PASSWORD as string,
        ConnectionString : process.env.DB_CONNECTION_STRING ?? '',
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

const generateConfigs = (): DatabaseConfiguration[] => {
    const configs: DatabaseConfiguration[] = [];

    const defultConfig = createDefaultConfig();
    configs.push(defultConfig);

    if (process.env.ADD_ANALYTICS === 'true') {
        const analyticsConfig = createDefaultConfig();
        analyticsConfig.SchemaType = 'analytics';
        analyticsConfig.DatabaseName = process.env.DB_NAME + '_analytics' + '_' + environment();
        configs.push(analyticsConfig);
    }

    return configs;
};

const Configurations: DatabaseConfiguration[] = generateConfigs();

/////////////////////////////////////////////////////////////////////////////

export const getDatabaseConfig = (schemaType: DatabaseSchema = 'primary'): DatabaseConfiguration => {
    const config = Configurations.find((config) => config.SchemaType === schemaType);
    if (!config) {
        throw new Error(`No database configuration found for schema type: ${schemaType}`);
    }
    return config;
};

/////////////////////////////////////////////////////////////////////////////
