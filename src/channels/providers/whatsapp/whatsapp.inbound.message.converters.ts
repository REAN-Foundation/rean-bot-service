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
        else if (this._contentType === MessageContentType.OptionChoice) {
            return await this.fromOptionChoice(inbound);
        }
        else if (this._contentType === MessageContentType.Location) {
            return await this.fromLocation(inbound);
        }
        return await this.fromText(inbound);

    };

    private getCommonData = (inMessage): IncomingMessage => {

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
            Direction : MessageDirection.In,
            Metadata  : metadata,
            Timestamp : new Date(parseInt(messageTimestamp)),
        };
        return incomingMessage;
    };

    private fromText = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        incomingMessage.Content = message?.text?.body;
        incomingMessage.MessageType = MessageContentType.Text;

        return incomingMessage;
    };

    private fromImage = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const metadata_ = {
            mimetype : message?.image?.mime_type,
            sha256   : message?.image?.sha256,
            caption  : message?.image?.caption,
        };
        incomingMessage.Content = message?.image?.id;
        incomingMessage.MessageType = MessageContentType.Image;
        incomingMessage.Metadata = metadata_;

        return incomingMessage;
    };

    private fromVideo = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const metadata_ = {
            mimetype : message?.video?.mime_type,
            sha256   : message?.video?.sha256,
            caption  : message?.video?.caption,
        };
        incomingMessage.Content = message?.video?.id;
        incomingMessage.MessageType = MessageContentType.Video;
        incomingMessage.Metadata = metadata_;

        return incomingMessage;
    };

    private fromAudio = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const data = message?.audio ?? message?.data;
        if (data) {
            const metadata_ = {
                mimetype : data.mime_type,
                sha256   : data.sha256,
                voice    : data.voice,
            };
            incomingMessage.Content = data.id;
            incomingMessage.Metadata = metadata_;
        }
        incomingMessage.MessageType = MessageContentType.Audio;
        return incomingMessage;
    };

    private fromFile = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const metadata_ = {
            mimetype : message?.document?.mime_type,
            sha256   : message?.document?.sha256,
            filename : message?.document?.filename,
        };
        incomingMessage.Content = message?.document?.id;
        incomingMessage.MessageType = MessageContentType.File;
        incomingMessage.Metadata = metadata_;

        return incomingMessage;
    };

    private fromOptionChoice = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const interactive = message?.interactive;
        const metadata_ = {
            type        : message?.interactive?.type,
            reply_id    : interactive?.button_reply ? interactive?.button_reply?.id : interactive?.list_reply?.id,
            reply_title : interactive?.button_reply ? interactive?.button_reply?.title : interactive?.list_reply?.title,
        };
        incomingMessage.Content = JSON.stringify(metadata_);
        incomingMessage.MessageType = MessageContentType.OptionChoice;
        incomingMessage.Metadata = metadata_;

        return incomingMessage;
    };

    private fromLocation = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const metadata_ = {
            latitude  : message?.location?.latitude,
            longitude : message?.location?.longitude,
        };
        incomingMessage.Content = JSON.stringify(metadata_);
        incomingMessage.MessageType = MessageContentType.Location;
        incomingMessage.Metadata = metadata_;

        return incomingMessage;
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

