import { ProcessableMessage } from '../../types/common.types';
import { logger } from '../../logger/logger';
import { IMessageHandler } from '../message.handler.interface';

//////////////////////////////////////////////////////////////////////////////////////

export class HumanHandoffHandler implements IMessageHandler {

    public async handle(message: ProcessableMessage): Promise<ProcessableMessage> {
        logger.info('HumanHandoffHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    }

}
