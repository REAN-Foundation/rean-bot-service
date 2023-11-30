import { inject, injectable } from 'tsyringe';
import { IDatabaseClient } from './database.client.interface';
import { DatabaseSchema } from '../database.configs';

//////////////////////////////////////////////////////////////////////////////

@injectable()
export class DatabaseClient {

    constructor(@inject('IDatabaseClient') private _client: IDatabaseClient) {}

    public createDb = async (schemaType: DatabaseSchema): Promise<boolean> => {
        return await this._client.createDb(schemaType);
    };

    public dropDb = async (schemaType: DatabaseSchema): Promise<boolean> => {
        return await this._client.dropDb(schemaType);
    };

    public executeQuery = async (schemaType: DatabaseSchema, query: string): Promise<boolean> => {
        return await this._client.executeQuery(schemaType, query);
    };

}
