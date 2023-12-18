import { ProcessibleMessage } from "../domain.types/message";

export interface IMessageHandler {
    handle(message: ProcessibleMessage): Promise<ProcessibleMessage>;
}
