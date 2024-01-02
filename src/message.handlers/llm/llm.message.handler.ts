import { ProcessableMessage } from '../../types/common.types';
import { logger } from '../../logger/logger';
import { IMessageHandler } from '../message.handler.interface';

//////////////////////////////////////////////////////////////////////////////////////

export class LLMHandler implements IMessageHandler {

    public async handle(message: ProcessableMessage): Promise<ProcessableMessage> {
        logger.info('LLMHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    }

}
