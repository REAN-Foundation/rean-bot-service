import { ProcessableMessage } from "../domain.types/message";

export interface IMessageHandler {
    handle(message: ProcessableMessage): Promise<ProcessableMessage>;
}
