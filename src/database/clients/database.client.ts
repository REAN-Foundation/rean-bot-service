import { inject, injectable } from 'tsyringe';
import { IDatabaseClient } from './database.client.interface';
import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';

//////////////////////////////////////////////////////////////////////////////

@injectable()
export class DatabaseClient {

    constructor(@inject('IDatabaseClient') private _client: IDatabaseClient) {}

    public createDb = async (envProvider: TenantEnvironmentProvider): Promise<boolean> => {
        return await this._client.createDb(envProvider);
    };

    public dropDb = async (envProvider: TenantEnvironmentProvider): Promise<boolean> => {
        return await this._client.dropDb(envProvider);
    };

    public executeQuery = async (envProvider: TenantEnvironmentProvider, query: string): Promise<boolean> => {
        return await this._client.executeQuery(envProvider, query);
    };

}
