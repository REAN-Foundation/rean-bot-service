/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { TenantEntity } from '../models/tenant.entity';

@injectable()
export class TenantRepository extends BaseTenantRepository<TenantEntity> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, TenantEntity);
    }

    async findByName(name: string): Promise<TenantEntity | null> {
        const repo = await this.getRepository();
        return repo.findOne({
            where : { name }
        });
    }

    async findActive(): Promise<TenantEntity[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { isActive: true }
        });
    }

    async findByFeature(feature: string): Promise<TenantEntity[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : {
                configuration : {
                    features : { $contains: [feature] } as any
                }
            }
        });
    }

    async updateConfiguration(id: string, configuration: Partial<TenantEntity['configuration']>): Promise<TenantEntity | null> {
        const repo = await this.getRepository();
        const tenant = await this.findOne({ where: { id } });
        if (!tenant) {
            return null;
        }

        const updatedConfiguration = { ...tenant.configuration, ...configuration };
        await repo.update(id, { configuration: updatedConfiguration });
        return this.findOne({ where: { id } });
    }

    async deactivate(id: string): Promise<boolean> {
        const repo = await this.getRepository();
        const result = await repo.update(id, { isActive: false });
        return result.affected! > 0;
    }

    async activate(id: string): Promise<boolean> {
        const repo = await this.getRepository();
        const result = await repo.update(id, { isActive: true });
        return result.affected! > 0;
    }

}
