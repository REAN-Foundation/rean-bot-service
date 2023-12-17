/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    MessageContentType,
    MessageDirection
} from "../../../domain.types/enums";
import { IncomingMessage } from "../../../domain.types/message";

////////////////////////////////////////////////////////////////////////////////

export class WhatsAppInboundMessageConverter  {

    _contentType: MessageContentType = MessageContentType.Text;

    _direction: MessageDirection = MessageDirection.Out;

    constructor(contentType: MessageContentType) {
        this._contentType = contentType;
    }

    public convert = async (inbound: any) : Promise<IncomingMessage> => {

        if (this._contentType === MessageContentType.Text) {
            return await this.fromText(inbound);
        }
        else if (this._contentType === MessageContentType.Image) {
            return await this.fromImage(inbound);
        }
        else if (this._contentType === MessageContentType.Video) {
            return await this.fromVideo(inbound);
        }
        else if (this._contentType === MessageContentType.Audio) {
            return await this.fromAudio(inbound);
        }
        else if (this._contentType === MessageContentType.File) {
            return await this.fromFile(inbound);
        }
        else if (this._contentType === MessageContentType.OptionsUI) {
            return await this.fromOptionUI(inbound);
        }
        else if (this._contentType === MessageContentType.Feedback) {
            return await this.fromEmojis(inbound);
        }
        else if (this._contentType === MessageContentType.Location) {
            return await this.fromLocation(inbound);
        }
        return await this.fromText(inbound);

    };

    private fromText = async (inMessage: any): Promise<IncomingMessage> => {
        const message = inMessage.message;
        const contact = inMessage.contact;

        return null;
    };

    private fromImage = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    private fromVideo = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    private fromAudio = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    private fromFile = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    private fromOptionUI = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    private fromEmojis = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    private fromLocation = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

}
