import { ProcessibleMessage } from '../../domain.types/message';
import { logger } from '../../logger/logger';
import { IMessageHandler } from '../message.handler.interface';

//////////////////////////////////////////////////////////////////////////////////////

export class HumanHandoffHandler implements IMessageHandler {

    public async handle(message: ProcessibleMessage): Promise<ProcessibleMessage> {
        logger.info('HumanHandoffHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    }

}