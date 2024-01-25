import { Intent } from "../../intent/intent.emitter";
import { IMessageHandler } from "../message.handler.interface";
import { IntentDto } from "./nlp.out.message";

//////////////////////////////////////////////////////////////////////////////////////

export interface INLPHandler extends IMessageHandler {

    language(): string;

    extractIntentFromReqBody(requestBody: any): Intent;

    identifyIntent(message: any): Promise<IntentDto>;

}
