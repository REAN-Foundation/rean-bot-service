import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { Intent } from '../models/intent.entity';

@injectable()
export class IntentRepository extends BaseTenantRepository<Intent> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, Intent);
    }

    async findByIntentName(intentName: string): Promise<Intent | null> {
        const repo = await this.getRepository();
        return repo.findOne({
            where: { IntentName: intentName }
        });
    }

    async findByHandlerType(handlerType: string): Promise<Intent[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: { HandlerType: handlerType },
            order: { Priority: 'DESC' }
        });
    }

    async findActiveIntents(): Promise<Intent[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: { IsActive: true },
            order: { Priority: 'DESC' }
        });
    }

    async findByPriority(minPriority: number): Promise<Intent[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: {
                Priority: { $gte: minPriority } as any,
                IsActive: true
            },
            order: { Priority: 'DESC' }
        });
    }

    async findByThresholdScore(minThreshold: number): Promise<Intent[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: {
                ThresholdScore: { $gte: minThreshold } as any,
                IsActive: true
            },
            order: { Priority: 'DESC' }
        });
    }

    async updateThresholdScore(id: string, thresholdScore: number): Promise<Intent | null> {
        const repo = await this.getRepository();
        await repo.update(id, { ThresholdScore: thresholdScore });
        return this.findOne({ where: { id } });
    }

    async updatePriority(id: string, priority: number): Promise<Intent | null> {
        const repo = await this.getRepository();
        await repo.update(id, { Priority: priority });
        return this.findOne({ where: { id } });
    }

    async activateIntent(id: string): Promise<boolean> {
        const repo = await this.getRepository();
        const result = await repo.update(id, { IsActive: true });
        return result.affected! > 0;
    }

    async deactivateIntent(id: string): Promise<boolean> {
        const repo = await this.getRepository();
        const result = await repo.update(id, { IsActive: false });
        return result.affected! > 0;
    }

    async findByDisplayName(displayName: string): Promise<Intent | null> {
        const repo = await this.getRepository();
        return repo.findOne({
            where: { DisplayName: displayName }
        });
    }

    async findIntentsForMatching(): Promise<Intent[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: { IsActive: true },
            order: { Priority: 'DESC', ThresholdScore: 'DESC' }
        });
    }

    async updateHandlerConfig(id: string, handlerConfig: any): Promise<Intent | null> {
        const repo = await this.getRepository();
        await repo.update(id, { HandlerConfig: handlerConfig });
        return this.findOne({ where: { id } });
    }

    async updateRequiredEntities(id: string, requiredEntities: any): Promise<Intent | null> {
        const repo = await this.getRepository();
        await repo.update(id, { RequiredEntities: requiredEntities });
        return this.findOne({ where: { id } });
    }

    async searchIntents(searchTerm: string): Promise<Intent[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: [
                { IntentName: { $like: `%${searchTerm}%` } as any },
                { DisplayName: { $like: `%${searchTerm}%` } as any },
                { Description: { $like: `%${searchTerm}%` } as any }
            ],
            order: { Priority: 'DESC' }
        });
    }

}
