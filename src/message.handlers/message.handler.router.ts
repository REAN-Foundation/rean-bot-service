import { logger } from "../logger/logger";
import { ProcessibleMessage } from "../domain.types/message";
import { IMessageHandler } from "./message.handler.interface";

//////////////////////////////////////////////////////////////////////////////////////

export interface RouterResults {
    Handlers : IMessageHandler[];
    Message  : ProcessibleMessage;
}

export default class MessageHandlerRouter {

    public static getHandlers = async (message: ProcessibleMessage): Promise<RouterResults> => {
        logger.info('MessageHandlerRouter.getHandlers');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    };

}
