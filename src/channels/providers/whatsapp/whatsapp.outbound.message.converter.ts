/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    MessageContentType,
    MessageDirection
} from "../../../domain.types/enums";
import { IncomingMessage, OutgoingMessage } from "../../../domain.types/message";

////////////////////////////////////////////////////////////////////////////////

export class WhatsAppOutboundMessageConverter  {

    _contentType: MessageContentType = MessageContentType.Text;

    _direction: MessageDirection = MessageDirection.Out;

    constructor(contentType: MessageContentType) {
        this._contentType = contentType;
    }

    public convert = async (message: OutgoingMessage | Record<string, any>)
        : Promise<IncomingMessage | Record<string, any>> => {

        if (this._contentType === MessageContentType.Text) {
            return await this.toText(message as OutgoingMessage);
        }
        else if (this._contentType === MessageContentType.Image) {
            return await this.toImage(message as OutgoingMessage);
        }
        else if (this._contentType === MessageContentType.Video) {
            return await this.toVideo(message as OutgoingMessage);
        }
        else if (this._contentType === MessageContentType.Audio) {
            return await this.toAudio(message as OutgoingMessage);
        }
        else if (this._contentType === MessageContentType.File) {
            return await this.toFile(message as OutgoingMessage);
        }
        else if (this._contentType === MessageContentType.OptionsUI) {
            return await this.toOptionUI(message as OutgoingMessage);
        }
        else if (this._contentType === MessageContentType.Feedback) {
            return await this.toEmojis(message as OutgoingMessage);
        }
        else if (this._contentType === MessageContentType.Location) {
            return await this.toLocation(message as OutgoingMessage);
        }
        return await this.toText(message as OutgoingMessage);

    };

    private toText = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toImage = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toVideo = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toAudio = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toFile = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toOptionUI = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toEmojis = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toLocation = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toUrl = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

}
