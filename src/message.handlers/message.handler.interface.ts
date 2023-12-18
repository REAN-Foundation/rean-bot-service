import { IncomingMessage, OutgoingMessage } from "../domain.types/message";

export interface IMessageHandler {
    handle(message: IncomingMessage): Promise<OutgoingMessage>;
}
