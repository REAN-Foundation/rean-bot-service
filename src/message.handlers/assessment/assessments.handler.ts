import { logger } from "../../logger/logger";
import { ProcessibleMessage } from "../../domain.types/message";
import { IMessageHandler } from "../message.handler.interface";

export class AssessmentMessageHandler implements IMessageHandler {

    public async handle(message: ProcessibleMessage): Promise<ProcessibleMessage> {
        logger.info('AssessmentMessageHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    }

}

