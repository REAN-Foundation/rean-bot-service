/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { Tenant } from '../models/tenant.entity';

@injectable()
export class TenantRepository extends BaseTenantRepository<Tenant> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, Tenant);
    }

    async findByName(name: string): Promise<Tenant | null> {
        const repo = await this.getRepository();
        return repo.findOne({
            where : { Name: name }
        });
    }

    async findActive(): Promise<Tenant[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { IsActive: true }
        });
    }

    async findByFeature(feature: string): Promise<Tenant[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : {
                configuration : {
                    features : { $contains: [feature] } as any
                }
            }
        });
    }

    async updateConfiguration(id: string, configuration: Partial<Tenant['configuration']>): Promise<Tenant | null> {
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
        const result = await repo.update(id, { IsActive: false });
        return result.affected! > 0;
    }

    async activate(id: string): Promise<boolean> {
        const repo = await this.getRepository();
        const result = await repo.update(id, { IsActive: true });
        return result.affected! > 0;
    }

}
