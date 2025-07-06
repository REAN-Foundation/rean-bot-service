import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { ConversationContext } from '../models/conversation.context.entity';

@injectable()
export class ConversationContextRepository extends BaseTenantRepository<ConversationContext> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, ConversationContext);
    }

    async findByConversationId(conversationId: string): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        return repo.findOne({
            where: { ConversationId: conversationId },
            order: { UpdatedAt: 'DESC' }
        });
    }

    async findByCurrentMode(currentMode: string): Promise<ConversationContext[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: { CurrentMode: currentMode },
            order: { UpdatedAt: 'DESC' }
        });
    }

    async findByCurrentHandler(currentHandler: string): Promise<ConversationContext[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: { CurrentHandler: currentHandler },
            order: { UpdatedAt: 'DESC' }
        });
    }

    async updateCurrentMode(conversationId: string, currentMode: string): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }
        await repo.update(context.id, { CurrentMode: currentMode });
        return this.findOne({ where: { id: context.id } });
    }

    async updateCurrentHandler(conversationId: string, currentHandler: string): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }
        await repo.update(context.id, { CurrentHandler: currentHandler });
        return this.findOne({ where: { id: context.id } });
    }

    async updateModeData(conversationId: string, modeData: any): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }
        await repo.update(context.id, { ModeData: modeData });
        return this.findOne({ where: { id: context.id } });
    }

    async updateContext(conversationId: string, contextData: any): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }
        await repo.update(context.id, { Context: contextData });
        return this.findOne({ where: { id: context.id } });
    }

    async mergeModeData(conversationId: string, additionalData: any): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }

        const mergedData = { ...context.ModeData, ...additionalData };
        await repo.update(context.id, { ModeData: mergedData });
        return this.findOne({ where: { id: context.id } });
    }

    async mergeContext(conversationId: string, additionalContext: any): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }

        const mergedContext = { ...context.Context, ...additionalContext };
        await repo.update(context.id, { Context: mergedContext });
        return this.findOne({ where: { id: context.id } });
    }

    async clearModeData(conversationId: string): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }
        await repo.update(context.id, { ModeData: null });
        return this.findOne({ where: { id: context.id } });
    }

    async clearContext(conversationId: string): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }
        await repo.update(context.id, { Context: null });
        return this.findOne({ where: { id: context.id } });
    }

    async resetContext(conversationId: string): Promise<ConversationContext | null> {
        const repo = await this.getRepository();
        const context = await this.findByConversationId(conversationId);
        if (!context) {
            return null;
        }
        await repo.update(context.id, {
            CurrentMode: null,
            CurrentHandler: null,
            ModeData: null,
            Context: null
        });
        return this.findOne({ where: { id: context.id } });
    }

    async findActiveContexts(): Promise<ConversationContext[]> {
        const repo = await this.getRepository();
        return repo.find({
            where: [
                { CurrentMode: { $ne: null } as any },
                { CurrentHandler: { $ne: null } as any }
            ],
            order: { UpdatedAt: 'DESC' }
        });
    }

}
