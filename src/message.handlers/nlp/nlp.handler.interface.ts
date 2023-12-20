import { ProcessibleMessage } from "../../domain.types/message";
import { IMessageHandler } from "../message.handler.interface";

export interface INLPHandler extends IMessageHandler {

    language(): string;

}
