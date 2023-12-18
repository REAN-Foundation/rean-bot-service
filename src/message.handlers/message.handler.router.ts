import { logger } from "../logger/logger";
import { ProcessibleMessage } from "../domain.types/message";
import { IMessageHandler } from "./message.handler.interface";

//////////////////////////////////////////////////////////////////////////////////////

export default class MessageHandlerRouter {

    public static getPrimaryHandler = async (message: ProcessibleMessage): Promise<IMessageHandler> => {
        logger.info('MessageHandlerRouter.getPrimaryHandler');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    };

}
