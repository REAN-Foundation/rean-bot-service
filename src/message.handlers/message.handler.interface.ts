import { ProcessableMessage } from "../types/common.types";

export interface IMessageHandler {
    handle(message: ProcessableMessage): Promise<ProcessableMessage>;
}
