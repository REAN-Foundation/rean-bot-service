/* eslint-disable @typescript-eslint/no-unused-vars */
import { logger } from "../../../logger/logger";
import {
    ChannelType,
    MessageContentType,
    MessageDirection
} from "../../../domain.types/enums";
import { IncomingMessage } from "../../../domain.types/message";
import { InMessageMetadata } from "../../../domain.types/intermediate.data.types";
import { ChatMessageService } from "../../../database/typeorm/services/chat.message.service";

////////////////////////////////////////////////////////////////////////////////

export class SlackInboundMessageConverter  {

    _contentType: MessageContentType = MessageContentType.Text;

    _direction: MessageDirection = MessageDirection.Out;

    constructor(
        contentType: MessageContentType
    ) {
        this._contentType = contentType;
    }

    public convert = async (metadata: InMessageMetadata) : Promise<IncomingMessage> => {

        if (this._contentType === MessageContentType.Text) {
            return await this.fromText(metadata);
        }
        // else if (this._contentType === MessageContentType.Image) {
        //     return await this.fromImage(inbound);
        // }
        return await this.fromText(metadata);

    };

    private getCommonData = async (metadata: InMessageMetadata): Promise<IncomingMessage> => {

        if (!metadata?.RequestBody) {
            return null;
        }
        const challenge = metadata?.RequestBody?.challenge;
        const event = metadata?.RequestBody?.event;
        const messageThreadTimestamp = event?.thread_ts; // This is treated as support task id
        if (!event?.thread_ts) {
            // Currently slack only supports support use cases. Not user to bot use cases.
            logger.info('This is a parent message!');
            return null;
        }
        if (!challenge) {
            logger.info('This is a test request!');
            return null;
        }

        // Proceed if this is a child message
        logger.info('This is a child message!');

        const supportTaskId = messageThreadTimestamp;
        const chatMessageService: ChatMessageService = metadata.Container.resolve(ChatMessageService);
        const threadParentMessage = await chatMessageService.getBySupportTaskId(supportTaskId);
        if (!threadParentMessage) {
            logger.error('Parent message not found!');
            return null;
        }
        const humanHandoff = threadParentMessage.HumanHandoff &&
            threadParentMessage.HumanHandoff.IsHandoff ? true : false;

        // Currently slack only supports support use cases. Not user to bot use cases.
        if (!humanHandoff) {
            logger.error('Human handoff not found!');
            return null;
        }

        const messageText = event?.text;

        //Retrieve message thread timestamp to use as task id

        const channelUserId = event?.user ?? threadParentMessage.SupportChannel?.SupportTaskId;
        if (!channelUserId) {
            logger.error('Channel user id not found!');
            return null;
        }

        const userChannelType = threadParentMessage.Channel;
        const messageTextLower = messageText?.toLowerCase();
        const supportExitMessage = messageTextLower === 'exit' ? true : false;

        const userId = threadParentMessage.UserId;
        const tenantId = threadParentMessage.TenantId;
        const tenantName = threadParentMessage.TenantName;
        const channelType = threadParentMessage.Channel; // Please note that these are user facing channel

        const contextMessageId = threadParentMessage?.SupportTaskId;

        const incomingMessage: IncomingMessage = {
            Channel     : ChannelType.WhatsApp,
            ChannelUser : {
                ChannelUserId : threadParentMessage.ChannelUserId,
                FirstName     : '',
                LastName      : '',
                // Phone         : userPhone,
            },
            ChannelMessageId : threadParentMessage.ChannelMessageId,
            ChannelSpecifics : {
                Channel            : ChannelType.WhatsApp,
                ReferenceMessageId : contextMessageId,
                // BotId              : botPhoneId,
                // BotPhoneNumber     : botPhoneNumber,
            },
            Direction      : MessageDirection.In,
            Metadata       : metadata,
            Timestamp      : threadParentMessage.Timestamp,
            SupportChannel : {
                SupportChannelType   : ChannelType.Slack,
                SupportChannelUserId : channelUserId,
                ReferenceMessageId   : contextMessageId,
                IsSupportResponse    : humanHandoff,
                SupportTaskId        : supportTaskId,
                SupportExitMessage   : supportExitMessage,
            },
        };
        return incomingMessage;
    };

    private fromText = async (inMessage: any): Promise<IncomingMessage> => {

        const message = inMessage?.message;
        const incomingMessage = await this.getCommonData(inMessage);
        incomingMessage.Content = message?.text?.body;
        incomingMessage.MessageType = MessageContentType.Text;

        return incomingMessage;
    };

    // private fromImage = async (inMessage: any): Promise<IncomingMessage> => {
    //     const message = inMessage?.message;
    //     const incomingMessage = this.getCommonData(inMessage);
    //     incomingMessage.MessageType = MessageContentType.Image;
    //     incomingMessage.Content = message?.image?.id;
    //     const metadata_ = {
    //         MimeType : message?.image?.mime_type,
    //         Sha256   : message?.image?.sha256,
    //         Caption  : message?.image?.caption,
    //     };
    //     incomingMessage.Metadata = metadata_;
    //     incomingMessage.MessageType = MessageContentType.Image;
    //     return incomingMessage;
    // };

    // private fromVideo = async (inMessage: any): Promise<IncomingMessage> => {
    //     const message = inMessage?.message;
    //     const incomingMessage = this.getCommonData(inMessage);
    //     const metadata_ = {
    //         MimeType : message?.video?.mime_type,
    //         Sha256   : message?.video?.sha256,
    //         Caption  : message?.video?.caption,
    //     };
    //     incomingMessage.Content = message?.video?.id;
    //     incomingMessage.MessageType = MessageContentType.Video;
    //     incomingMessage.Metadata = metadata_;
    //     return incomingMessage;
    // };

    // private fromAudio = async (inMessage: any): Promise<IncomingMessage> => {
    //     const message = inMessage?.message;
    //     const incomingMessage = this.getCommonData(inMessage);
    //     const data = message?.audio ?? message?.data;
    //     if (data) {
    //         const metadata_ = {
    //             MimeType : data.mime_type,
    //             Sha256   : data.sha256,
    //             Voice    : data.voice,
    //         };
    //         incomingMessage.Content = data.id;
    //         incomingMessage.Metadata = metadata_;
    //     }
    //     incomingMessage.MessageType = MessageContentType.Audio;
    //     return incomingMessage;
    // };

    // private fromFile = async (inMessage: any): Promise<IncomingMessage> => {
    //     const message = inMessage?.message;
    //     const incomingMessage = this.getCommonData(inMessage);
    //     const metadata_ = {
    //         MimeType : message?.document?.mime_type,
    //         Sha256   : message?.document?.sha256,
    //         Filename : message?.document?.filename,
    //     };
    //     incomingMessage.Content = message?.document?.id;
    //     incomingMessage.MessageType = MessageContentType.File;
    //     incomingMessage.Metadata = metadata_;
    //     return incomingMessage;
    // };

    // private fromOptionChoice = async (inMessage: any): Promise<IncomingMessage> => {
    //     const message = inMessage?.message;
    //     const incomingMessage = this.getCommonData(inMessage);
    //     const i = message?.interactive;
    //     const metadata_ = {
    //         Type                : message?.interactive?.type === 'list_reply' ? 'list' : 'button',
    //         SelectedOptionId    : i?.button_reply ? i?.button_reply?.id : i?.list_reply?.id,
    //         SelectedOptionTitle : i?.button_reply ? i?.button_reply?.title : i?.list_reply?.title,
    //     };
    //     incomingMessage.Content = JSON.stringify(metadata_);
    //     incomingMessage.MessageType = MessageContentType.OptionChoice;
    //     incomingMessage.Metadata = metadata_;
    //     return incomingMessage;
    // };

    // private fromLocation = async (inMessage: any): Promise<IncomingMessage> => {
    //     const message = inMessage?.message;
    //     const incomingMessage = this.getCommonData(inMessage);
    //     const metadata_ = {
    //         Latitude  : message?.location?.latitude,
    //         Longitude : message?.location?.longitude,
    //         Name      : message?.location?.name,
    //         Address   : message?.location?.address,
    //     };
    //     incomingMessage.Content = JSON.stringify(metadata_);
    //     incomingMessage.MessageType = MessageContentType.Location;
    //     incomingMessage.Metadata = metadata_;
    //     return incomingMessage;
    // };

    // private fromContact = async (inMessage: any): Promise<IncomingMessage> => {
    //     const message = inMessage?.message;
    //     const incomingMessage = this.getCommonData(inMessage);
    //     const contactList = message?.contacts.map((c) => {
    //         const email = c?.emails.length > 0 ? c?.emails[0]?.email : null;
    //         const phone = c?.phones.length > 0 ? c?.phones[0]?.phone : null;
    //         const channelUserId = c?.phones.length > 0 ? c?.phones[0]?.wa_id : null;
    //         const channelUserName = c?.name?.formatted_name;
    //         const firstName = c?.name?.first_name;
    //         const lastName = c?.name?.last_name;
    //         const prefix = c?.name?.prefix;
    //         return {
    //             ContactId       : c?.wa_id,
    //             ContactName     : c?.profile?.name,
    //             FirstName       : firstName,
    //             LastName        : lastName,
    //             Prefix          : prefix,
    //             Phone           : phone,
    //             Email           : email,
    //             ChannelUserId   : channelUserId,
    //             ChannelUserName : channelUserName,
    //         };
    //     });
    //     const metadata_ = {
    //         ContactList : contactList,
    //     };
    //     incomingMessage.Content = JSON.stringify(metadata_);
    //     incomingMessage.MessageType = MessageContentType.SharedContact;
    //     incomingMessage.Metadata = metadata_;
    //     return incomingMessage;
    // };

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

