/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ChannelType,
    MessageContentType,
    MessageDirection
} from "../../../types/enums";
import { IncomingMessage } from "../../../types/common.types";

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
        else if (this._contentType === MessageContentType.SharedContact) {
            return await this.fromContact(inbound);
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
        incomingMessage.MessageType = MessageContentType.Image;

        const isSticker = message?.type === 'sticker';
        if (isSticker) {
            incomingMessage.Content = message?.sticker?.id;
            const metadata_ = {
                MimeType : message?.sticker?.mime_type,
                Sha256   : message?.sticker?.sha256,
                Animated : message?.sticker?.animated,
            };
            incomingMessage.Metadata = metadata_;
        }
        else {
            incomingMessage.Content = message?.image?.id;
            const metadata_ = {
                MimeType : message?.image?.mime_type,
                Sha256   : message?.image?.sha256,
                Caption  : message?.image?.caption,
            };
            incomingMessage.Metadata = metadata_;
        }
        incomingMessage.MessageType = MessageContentType.Image;

        return incomingMessage;
    };

    private fromVideo = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const metadata_ = {
            MimeType : message?.video?.mime_type,
            Sha256   : message?.video?.sha256,
            Caption  : message?.video?.caption,
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
                MimeType : data.mime_type,
                Sha256   : data.sha256,
                Voice    : data.voice,
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
            MimeType : message?.document?.mime_type,
            Sha256   : message?.document?.sha256,
            Filename : message?.document?.filename,
        };
        incomingMessage.Content = message?.document?.id;
        incomingMessage.MessageType = MessageContentType.File;
        incomingMessage.Metadata = metadata_;

        return incomingMessage;
    };

    private fromOptionChoice = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const i = message?.interactive;
        const metadata_ = {
            Type                : message?.interactive?.type === 'list_reply' ? 'list' : 'button',
            SelectedOptionId    : i?.button_reply ? i?.button_reply?.id : i?.list_reply?.id,
            SelectedOptionTitle : i?.button_reply ? i?.button_reply?.title : i?.list_reply?.title,
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
            Latitude  : message?.location?.latitude,
            Longitude : message?.location?.longitude,
            Name      : message?.location?.name,
            Address   : message?.location?.address,
        };
        incomingMessage.Content = JSON.stringify(metadata_);
        incomingMessage.MessageType = MessageContentType.Location;
        incomingMessage.Metadata = metadata_;

        return incomingMessage;
    };

    private fromContact = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = this.getCommonData(inMessage);
        const contactList = message?.contacts.map((c) => {
            const email = c?.emails.length > 0 ? c?.emails[0]?.email : null;
            const phone = c?.phones.length > 0 ? c?.phones[0]?.phone : null;
            const channelUserId = c?.phones.length > 0 ? c?.phones[0]?.wa_id : null;
            const channelUserName = c?.name?.formatted_name;
            const firstName = c?.name?.first_name;
            const lastName = c?.name?.last_name;
            const prefix = c?.name?.prefix;
            return {
                ContactId       : c?.wa_id,
                ContactName     : c?.profile?.name,
                FirstName       : firstName,
                LastName        : lastName,
                Prefix          : prefix,
                Phone           : phone,
                Email           : email,
                ChannelUserId   : channelUserId,
                ChannelUserName : channelUserName,
            };
        });
        const metadata_ = {
            ContactList : contactList,
        };
        incomingMessage.Content = JSON.stringify(metadata_);
        incomingMessage.MessageType = MessageContentType.SharedContact;
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

