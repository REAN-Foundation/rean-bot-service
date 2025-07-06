import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { Conversation } from '../models/conversation.entity';

@injectable()
export class ConversationRepository extends BaseTenantRepository<Conversation> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, Conversation);
    }

    async findByUserId(userId: string): Promise<Conversation[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { UserId: userId },
            order : { UpdatedAt: 'DESC' }
        });
    }

    async findByChannel(channel: string): Promise<Conversation[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { Channel: channel },
            order : { UpdatedAt: 'DESC' }
        });
    }

    async findByUserAndChannel(userId: string, channel: string): Promise<Conversation | null> {
        const repo = await this.getRepository();
        return repo.findOne({
            where : {
                UserId  : userId,
                Channel : channel
            },
            order : { UpdatedAt: 'DESC' }
        });
    }

    async findByStatus(status: string): Promise<Conversation[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { Status: status },
            order : { UpdatedAt: 'DESC' }
        });
    }

    async findActiveConversations(): Promise<Conversation[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { Status: 'active' },
            order : { UpdatedAt: 'DESC' }
        });
    }

    async updateStatus(id: string, status: string): Promise<Conversation | null> {
        const repo = await this.getRepository();
        await repo.update(id, { Status: status });
        return this.findOne({ where: { id } });
    }

    async findRecentConversations(limit = 10): Promise<Conversation[]> {
        const repo = await this.getRepository();
        return repo.find({
            order : { UpdatedAt: 'DESC' },
            take  : limit
        });
    }

    async findConversationWithMessages(conversationId: string): Promise<Conversation | null> {
        const repo = await this.getRepository();
        return repo.findOne({
            where     : { id: conversationId },
            relations : ['messages']
        });
    }

    async findUserConversationsByChannel(userId: string, channel: string): Promise<Conversation[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : {
                UserId  : userId,
                Channel : channel
            },
            order : { UpdatedAt: 'DESC' }
        });
    }

    async deactivateConversation(id: string): Promise<boolean> {
        const repo = await this.getRepository();
        const result = await repo.update(id, { Status: 'inactive' });
        return result.affected! > 0;
    }

    async activateConversation(id: string): Promise<boolean> {
        const repo = await this.getRepository();
        const result = await repo.update(id, { Status: 'active' });
        return result.affected! > 0;
    }

}
