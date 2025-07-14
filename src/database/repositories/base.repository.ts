import { Repository, EntityTarget } from 'typeorm';
import { inject } from 'tsyringe';
import { TenantConnectionService } from '../tenant.db.connection.service';

///////////////////////////////////////////////////////////////////////////////
export abstract class BaseTenantRepository<T> {

    constructor(
    @inject('REQUEST') private request: { tenantId: string },
    private entity: EntityTarget<T>
    ) {}

    protected async getRepository(): Promise<Repository<T>> {
        const dataSource = await TenantConnectionService.getTenantDataSource(this.request.tenantId);
        return dataSource.getRepository(this.entity);
    }

    async find(options?: any): Promise<T[]> {
        const repo = await this.getRepository();
        return repo.find(options);
    }

    async findOne(options: any): Promise<T | null> {
        const repo = await this.getRepository();
        return repo.findOne(options);
    }

    async create(data: Partial<T>): Promise<T> {
        const repo = await this.getRepository();
        const entity = repo.create(data as T);
        return repo.save(entity);
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const repo = await this.getRepository();
        await repo.update(id, data as any);
        return this.findOne({ where: { id } });
    }

    async delete(id: string): Promise<boolean> {
        const repo = await this.getRepository();
        const result = await repo.delete(id);
        return result.affected && result.affected > 0;
    }

}
