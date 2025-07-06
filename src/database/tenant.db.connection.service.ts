import { DataSource } from 'typeorm';
import { Config } from './database.config';

export class TenantConnectionService {

    private static connections = new Map<string, DataSource>();

    static async getTenantDataSource(tenantId: string): Promise<DataSource> {
        if (this.connections.has(tenantId)) {
            return this.connections.get(tenantId)!;
        }

        // Create new connection for tenant
        const dataSource = new DataSource({
            type: 'postgres',
            host: Config.host,
            port: Config.port,
            username: Config.username,
            password: Config.password,
            database: `${Config.database}_${tenantId}`,
            synchronize: false,
            logging: false,
            entities: []
        });

        await dataSource.initialize();
        this.connections.set(tenantId, dataSource);

        return dataSource;
    }

    static async closeTenantConnection(tenantId: string): Promise<void> {
        const connection = this.connections.get(tenantId);
        if (connection) {
            await connection.destroy();
            this.connections.delete(tenantId);
        }
    }

    static async closeAllConnections(): Promise<void> {
        for (const [tenantId, connection] of this.connections) {
            await connection.destroy();
            this.connections.delete(tenantId);
        }
    }
}
