import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';

export interface IDatabaseClient {

    createDb(envProvider: TenantEnvironmentProvider): Promise<boolean>;

    dropDb(envProvider: TenantEnvironmentProvider): Promise<boolean>;

    executeQuery(envProvider: TenantEnvironmentProvider, query: string): Promise<boolean>;
}
