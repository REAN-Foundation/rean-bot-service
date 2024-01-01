import { ProcessableMessage } from '../../domain.types/message';
import { logger } from '../../logger/logger';
import { IMessageHandler } from '../message.handler.interface';

//////////////////////////////////////////////////////////////////////////////////////

export class FeedbackHandler implements IMessageHandler {

    public async handle(message: ProcessableMessage): Promise<ProcessableMessage> {
        logger.info('FeedbackHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    }

}
