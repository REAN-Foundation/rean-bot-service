/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ChannelType,
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

        const message = inMessage?.message;
        const contact = inMessage?.contact;
        const metadata = inMessage?.metadata;

        const channelUserId = contact?.wa_id;
        const userPhone = channelUserId; // For WhatsApp, the channel user id is the phone number
        const channelUserName = contact?.profile?.name;
        const { firstName, lastName } = tryExtractUserName(channelUserName);

        const botPhoneNumber = metadata?.display_phone_number;
        const botPhoneId = metadata?.phone_number_id;

        const messageId = message?.id;
        const messageTimestamp = message?.timestamp;
        const messageText = message?.text?.body;

        const contextMessageId = message?.context?.id;

        const incomingMessage: IncomingMessage = {
            Channel     : ChannelType.WhatsApp,
            ChannelUser : {
                ChannelUserId : channelUserId,
                FirstName     : firstName,
                LastName      : lastName,
                Phone         : userPhone,
            },
            ChannelMessageId : messageId,
            ChannelSpecifics : {
                Channel            : ChannelType.WhatsApp,
                ReferenceMessageId : contextMessageId,
                BotId              : botPhoneId,
                BotPhoneNumber     : botPhoneNumber,
            },
            Direction   : MessageDirection.In,
            MessageType : MessageContentType.Text,
            Content     : messageText,
            Timestamp   : messageTimestamp,
        };
        return incomingMessage;
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

function tryExtractUserName(userName: string) {
    var firstName = userName;
    var lastName = null;
    const tokens = userName?.split(' ');
    if (tokens && tokens.length > 0) {
        firstName = tokens[0];
        if (tokens.length > 1) {
            lastName = tokens[1];
            firstName = tokens[0];
        }
    }
    return { firstName, lastName };
}

