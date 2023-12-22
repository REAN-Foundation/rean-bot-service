import { Intent } from "../../../intent/intent.emitter";
import { logger } from "../../../logger/logger";
import { INLPOutMessage } from "../nlp.out.message";

///////////////////////////////////////////////////////////////////////////////////
// Format for response of Dialogflow Detect Intent API
// Ref: https://cloud.google.com/dialogflow/es/docs/reference/rest/v2/DetectIntentResponse
///////////////////////////////////////////////////////////////////////////////////

export class DialogFlowOutMessage implements INLPOutMessage {

    constructor(private _responses: any) {}

    public getText() {
        const text = [];
        const res = this._responses[0];
        const fulfillmentMessages = res.queryResult.fulfillmentMessages;
        if (fulfillmentMessages[0].platform &&
            fulfillmentMessages[0].platform === 'TELEGRAM' &&
            fulfillmentMessages[0].payload) {
            text[0] = fulfillmentMessages[0]
                .payload
                .fields
                .telegram
                .structValue
                .fields
                .text
                .stringValue;
            if (fulfillmentMessages[1]) {
                if (fulfillmentMessages[1].text){
                    text[1] = fulfillmentMessages[1].text.text[0];
                }
            }
        }
        else if (fulfillmentMessages[0] && fulfillmentMessages[0].text) {
            text[0] = fulfillmentMessages[0].text.text[0];
        }
        else {
            text[0] = "Sorry, something went wrong. Let me consult an expert and get back to you.";
        }
        return text;
    }

    public getImageObject() {
        let image = { url: "", caption: "" };
        const res = this._responses[0];
        const fulfillmentMessages = res.queryResult.fulfillmentMessages;
        if (fulfillmentMessages[0].platform &&
            fulfillmentMessages[0].platform === "TELEGRAM" &&
            fulfillmentMessages[0].payload){
            if (fulfillmentMessages[1]){
                if (fulfillmentMessages[1].image){
                    image = fulfillmentMessages[1].image.imageUri;
                }
            }
        }
        else if (fulfillmentMessages[1] && fulfillmentMessages[1].image){
            image = {
                url     : fulfillmentMessages[1].image.imageUri,
                caption : fulfillmentMessages[1].image.accessibilityText
            };
        }
        else {
            logger.info("no image");
        }

        return image;
    }

    public getIntent(): Intent {
        const res = this._responses[0];
        const intent = res.queryResult && res.queryResult.intent ? res.queryResult.intent.displayName : null;
        return intent;
    }

    public getPayload() {
        const res = this._responses[0];
        let payload = null;
        const fulfillmentMessages = res.queryResult.fulfillmentMessages;
        if (fulfillmentMessages.length > 1) {
            if (fulfillmentMessages[1].payload !== undefined) {
                payload = fulfillmentMessages[1].payload;
            }
        }
        return payload;
    }

    public getParseMode() {
        let parse_mode = null;
        const res = this._responses[0];
        const fulfillmentMessages = res.queryResult.fulfillmentMessages;
        if (fulfillmentMessages[0].platform &&
            fulfillmentMessages[0].platform === "TELEGRAM" &&
            fulfillmentMessages[0].payload) {
            if (fulfillmentMessages[1]){
                if (fulfillmentMessages[0].payload.fields.telegram.structValue.fields.parse_mode.stringValue &&
                    fulfillmentMessages[0].payload.fields.telegram.structValue.fields.parse_mode.stringValue === 'HTML') {
                    parse_mode = fulfillmentMessages[0]
                        .payload
                        .fields
                        .telegram
                        .structValue
                        .fields
                        .parse_mode
                        .stringValue;
                }
            }
        }
        return parse_mode;
    }

}
