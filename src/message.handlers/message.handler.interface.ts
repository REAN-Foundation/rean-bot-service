import { Message } from "../domain.types/message";

export interface IMessageHandler {
    handle(message: Message): Promise<Message>;
}
