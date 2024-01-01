import { logger } from "../logger/logger";
import { ProcessableMessage } from "../domain.types/message";
import { IMessageHandler } from "./message.handler.interface";

//////////////////////////////////////////////////////////////////////////////////////

export interface RouterResults {
    Handlers : IMessageHandler[];
    Message  : ProcessableMessage;
}

export default class MessageHandlerRouter {

    public static getHandlers = async (message: ProcessableMessage): Promise<RouterResults> => {
        logger.info('MessageHandlerRouter.getHandlers');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    };

}
