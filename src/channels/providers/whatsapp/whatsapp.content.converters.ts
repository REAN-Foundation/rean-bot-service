/* eslint-disable @typescript-eslint/no-unused-vars */
import { InAppMessage } from "aws-sdk/clients/pinpoint";
import {
    MessageContentType,
    MessageDirection
} from "../../../domain.types/enums";
import { IncomingMessage, OutgoingMessage } from "../../../domain.types/message";

////////////////////////////////////////////////////////////////////////////////

export class WhatsAppContentConverter  {

    _contentType: MessageContentType = MessageContentType.Text;

    _direction: MessageDirection = MessageDirection.In;

    constructor(contentType: MessageContentType, direction: MessageDirection) {
        this._contentType = contentType;
        this._direction = direction;
    }

    public convert = async (message: OutgoingMessage | Record<string, any>)
        : Promise<IncomingMessage | Record<string, any>> => {
        if (this._direction === MessageDirection.Out) {
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

        } else {
            if (this._contentType === MessageContentType.Text) {
                return await this.fromText(message as InAppMessage);
            }
            else if (this._contentType === MessageContentType.Image) {
                return await this.fromImage(message as InAppMessage);
            }
            else if (this._contentType === MessageContentType.Video) {
                return await this.fromVideo(message as InAppMessage);
            }
            else if (this._contentType === MessageContentType.Audio) {
                return await this.fromAudio(message as InAppMessage);
            }
            else if (this._contentType === MessageContentType.File) {
                return await this.fromFile(message as InAppMessage);
            }
            else if (this._contentType === MessageContentType.OptionsUI) {
                return await this.fromOptionUI(message as InAppMessage);
            }
            else if (this._contentType === MessageContentType.Feedback) {
                return await this.fromEmojis(message as InAppMessage);
            }
            else if (this._contentType === MessageContentType.Location) {
                return await this.fromLocation(message as InAppMessage);
            }
            return await this.fromText(message as InAppMessage);
        }
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

    private fromText = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    private fromImage = async (inMessage: any): Promise<any> => {
        return null;
    };

    private fromVideo = async (inMessage: any): Promise<any> => {
        return null;
    };

    private fromAudio = async (inMessage: any): Promise<any> => {
        return null;
    };

    private fromFile = async (inMessage: any): Promise<any> => {
        return null;
    };

    private fromOptionUI = async (inMessage: any): Promise<any> => {
        return null;
    };

    private fromEmojis = async (inMessage: any): Promise<any> => {
        return null;
    };

    private fromLocation = async (inMessage: any): Promise<any> => {
        return null;
    };

}
