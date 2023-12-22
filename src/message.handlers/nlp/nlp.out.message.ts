import { Intent } from "../../intent/intent.emitter";

//////////////////////////////////////////////////////////////////////////////////////

export interface IntentDto {
    Intent    : Intent;
    Confidence: number;
    Entities  : any[];
    Payload   : INLPOutMessage;
}

//////////////////////////////////////////////////////////////////////////////////////

export interface INLPOutMessage {

    getText(): string[];

    getImageObject(): any;

    getIntent(): Intent;

    getPayload(): any;

    getParseMode(): string;

}
