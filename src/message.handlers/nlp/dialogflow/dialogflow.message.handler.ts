import { Lifecycle, inject, scoped } from 'tsyringe';
import { ProcessibleMessage } from '../../../domain.types/message';
import { logger } from '../../../logger/logger';
import { INLPHandler } from '../nlp.handler.interface';

//////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class DialogFlowHandler implements INLPHandler {

    constructor(
        @inject('TenantName') private _tenantName?: string,
    ) {}

    language(): string {
        throw new Error('Method not implemented.');
    }

    public async handle(message: ProcessibleMessage): Promise<ProcessibleMessage> {
        logger.info('DialogFlowHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    }

}
