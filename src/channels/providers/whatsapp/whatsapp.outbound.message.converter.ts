/* eslint-disable @typescript-eslint/no-unused-vars */
import obj from "uuid-apikey";
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
        const message = {
            "messaging_product" : "whatsapp",
            "recipient_type"    : "individual",
            "to"                : outMessage.ChannelUser.Phone,
            "type"              : "text",
            "text"              : {
                "preview_url" : false,
                "body"        : outMessage.Content?.toString()
            }
        };
        return message;
    };

    private toImage = async (outMessage: OutgoingMessage): Promise<any> => {
        if (!outMessage.Content) {
            return null;
        }
        const { url, id } = this.extractResourceUrlOrId(outMessage);
        const message = {
            "messaging_product" : "whatsapp",
            "recipient_type"    : "individual",
            "to"                : outMessage.ChannelUser.Phone,
            "type"              : "image",
            "image"             : url ? { link: url } : { id: id }
        };
        return message;
    };

    private toVideo = async (outMessage: OutgoingMessage): Promise<any> => {
        if (!outMessage.Content) {
            return null;
        }
        const { url, id } = this.extractResourceUrlOrId(outMessage);
        const message = {
            "messaging_product" : "whatsapp",
            "recipient_type"    : "individual",
            "to"                : outMessage.ChannelUser.Phone,
            "type"              : "video",
            "video"             : url ? { link: url } : { id: id }
        };
        if (outMessage.Metadata) {
            const metadata = outMessage.Metadata;
            if (metadata["Caption"] !== undefined && metadata["Caption"] !== null
                && metadata["Caption"].length > 0) {
                message["video"]["caption"] = metadata["Caption"];
            }
        }
        return message;
    };

    private toAudio = async (outMessage: OutgoingMessage): Promise<any> => {
        if (!outMessage.Content) {
            return null;
        }
        const { url, id } = this.extractResourceUrlOrId(outMessage);
        const message = {
            "messaging_product" : "whatsapp",
            "recipient_type"    : "individual",
            "to"                : outMessage.ChannelUser.Phone,
            "type"              : "audio",
            "image"             : url ? { link: url } : { id: id }
        };
        return message;
    };

    private toFile = async (outMessage: OutgoingMessage): Promise<any> => {
        if (!outMessage.Content) {
            return null;
        }
        const { url, id } = this.extractResourceUrlOrId(outMessage);
        const message = {
            "messaging_product" : "whatsapp",
            "recipient_type"    : "individual",
            "to"                : outMessage.ChannelUser.Phone,
            "type"              : "document",
            "document"          : url ? { link: url } : { id: id }
        };
        if (outMessage.Metadata) {
            const metadata = outMessage.Metadata;
            if (metadata["Filename"] !== undefined && metadata["Filename"] !== null
                && metadata["Filename"].length > 0) {
                message["document"]["filename"] = metadata["Filename"];
            }
            if (metadata["Caption"] !== undefined && metadata["Caption"] !== null
                && metadata["Caption"].length > 0) {
                message["document"]["caption"] = metadata["Caption"];
            }
        }
        return message;
    };

    private toOptionUI = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    private toLocation = async (outMessage: OutgoingMessage): Promise<any> => {
        if (!outMessage.Content) {
            return null;
        }
        const loc = outMessage.Content ? JSON.parse(outMessage.Content.toString()) : null;
        if (!loc) {
            return null;
        }
        var location = {
            "longitude" : loc.Longitude,
            "latitude"  : loc.Latitude,
        };
        if (loc.Address) {
            location["address"] = loc.Address;
        }
        if (loc.Name) {
            location["name"] = loc.Name;
        }
        const message = {
            "messaging_product" : "whatsapp",
            "recipient_type"    : "individual",
            "to"                : outMessage.ChannelUser.Phone,
            "type"              : "location",
            "location"          : location,
        };
    };

    private extractResourceUrlOrId(outMessage: OutgoingMessage) {
        let url = null;
        let id = null;
        if (outMessage.Metadata) {
            const metadata = outMessage.Metadata;
            if (metadata["ResourceUrl"] !== undefined && metadata["ResourceUrl"] !== null
                && metadata["ResourceUrl"].length > 0) {
                url = metadata["ResourceUrl"];
            }
            if (metadata["ResourceId"] !== undefined && metadata["ResourceId"] !== null
                && metadata["ResourceId"].length > 0) {
                id = metadata["ResourceId"];
            }
        }
        if (!url && !id) {
            url = outMessage.Content.toString();
        }
        return { url, id };
    }
}
