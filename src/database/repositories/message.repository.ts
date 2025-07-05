import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { MessageEntity } from '../../database/models/message.entity';

@injectable()
export class MessageRepository extends BaseTenantRepository<MessageEntity> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, MessageEntity);
    }

    async findByConversation(conversationId: string): Promise<MessageEntity[]> {
        const repo = await this.getRepository();
        return repo.find({
            where : { conversationId },
            order : { timestamp: 'ASC' }
        });
    }

    async countByChannel(channel: string, dateFrom: Date): Promise<number> {
        const repo = await this.getRepository();
        return repo.count({
            where : {
                channel,
                timestamp : { $gte: dateFrom } as any
            }
        });
    }

}
