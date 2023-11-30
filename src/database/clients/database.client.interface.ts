import { DatabaseSchema } from '../database.configs';

export interface IDatabaseClient {

    createDb(schemaType: DatabaseSchema): Promise<boolean>;

    dropDb(schemaType: DatabaseSchema): Promise<boolean>;

    executeQuery(schemaType: DatabaseSchema, query: string): Promise<boolean>;
}
