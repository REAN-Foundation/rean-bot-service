import { injectable, inject } from 'tsyringe';
import { BaseTenantRepository } from './base.repository';
import { ConversationEntity } from '../models/conversation.model';

@injectable()
export class ConversationRepository extends BaseTenantRepository<ConversationEntity> {

    constructor(@inject('REQUEST') request: { tenantId: string }) {
        super(request, ConversationEntity);
    }

}
