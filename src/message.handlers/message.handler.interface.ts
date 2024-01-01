import { ProcessableMessage } from "../domain.types/common.types";

export interface IMessageHandler {
    handle(message: ProcessableMessage): Promise<ProcessableMessage>;
}
