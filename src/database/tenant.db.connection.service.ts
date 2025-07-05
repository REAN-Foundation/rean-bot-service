import { DataSource } from 'typeorm';

const baseOptions = {
    type        : 'postgres' as const,
    url         : process.env.DATABASE_URL,
    synchronize : process.env.NODE_ENV === 'development',
    logging     : process.env.NODE_ENV === 'development',
    entities    : ['src/entities/*.entity.ts'],
    migrations  : ['src/migrations/*.ts'],
    subscribers : ['src/subscribers/*.ts'],
};

export const AppDataSource = new DataSource(baseOptions);

export class TenantConnectionService {

    private static dataSourceCache = new Map<string, DataSource>();

    static async getTenantDataSource(tenantId: string): Promise<DataSource> {
        const schemaName = `tenant_${tenantId}`;

        if (!this.dataSourceCache.has(schemaName)) {
            const dataSource = new DataSource({
                ...baseOptions,
                schema : schemaName,
                extra  : { max: 5 } // Connection pool per tenant
            });

            await dataSource.initialize();
            this.dataSourceCache.set(schemaName, dataSource);
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.dataSourceCache.get(schemaName)!;
    }

    static async createTenantSchema(tenantId: string): Promise<void> {
        const schemaName = `tenant_${tenantId}`;
        const publicDataSource = await AppDataSource.initialize();

        await publicDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        await this.runMigrations(tenantId);
    }

    private static async runMigrations(tenantId: string): Promise<void> {
        const dataSource = await this.getTenantDataSource(tenantId);
        await dataSource.runMigrations();
    }

}
