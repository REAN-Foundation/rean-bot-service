import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { ConversationEntity } from '../../database/models/conversation.entity';

@injectable()
export class ConversationRepository extends BaseTenantRepository<ConversationEntity> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, ConversationEntity);
    }

}
