import { Message } from "../domain.types/message";
import { IMessageHandler } from "./message.handler.interface";

export interface MessageHandlerRouter {
    getHandler(message: Message): Promise<IMessageHandler>;
}
