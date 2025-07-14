import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { Message } from '../models/message.entity';
import { MessageDirection } from '../models/message.entity';

///////////////////////////////////////////////////////////////////////////////

@injectable()
export class MessageRepository extends BaseTenantRepository<Message> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, Message);
    }

    async findByConversation(conversationId: string): Promise<Message[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { ConversationId: conversationId },
            order : { CreatedAt: 'ASC' }
        });
    }

    async findByUserId(userId: string): Promise<Message[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { UserId: userId },
            order : { CreatedAt: 'DESC' }
        });
    }

    async findByChannel(channel: string, limit?: number): Promise<Message[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { Channel: channel },
            order : { CreatedAt: 'DESC' },
            take  : limit
        });
    }

    async findByDirection(direction: MessageDirection): Promise<Message[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { Direction: direction },
            order : { CreatedAt: 'DESC' }
        });
    }

    async countByChannel(channel: string, dateFrom: Date): Promise<number> {
        const repo = await this.getRepository();
        return repo.count({
            where : {
                Channel   : channel,
                CreatedAt : { $gte: dateFrom } as any
            }
        });
    }

    async findByStatus(status: string): Promise<Message[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { Status: status },
            order : { CreatedAt: 'DESC' }
        });
    }

    async updateStatus(id: string, status: string): Promise<Message | null> {
        const repo = await this.getRepository();
        await repo.update(id, { Status: status });
        return this.findOne({ where: { id } });
    }

    async findConversationHistory(conversationId: string, limit?: number): Promise<Message[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { ConversationId: conversationId },
            order : { CreatedAt: 'ASC' },
            take  : limit
        });
    }

}
