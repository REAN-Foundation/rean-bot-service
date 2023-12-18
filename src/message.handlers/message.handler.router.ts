import { logger } from "../logger/logger";
import { IncomingMessage } from "../domain.types/message";
import { IMessageHandler } from "./message.handler.interface";

//////////////////////////////////////////////////////////////////////////////////////

export default class MessageHandlerRouter {

    public static getPrimaryHandler = async (message: IncomingMessage): Promise<IMessageHandler> => {
        logger.info('MessageHandlerRouter.getPrimaryHandler');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    };

}
