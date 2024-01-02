/* eslint-disable @typescript-eslint/no-unused-vars */
import { scoped, Lifecycle } from 'tsyringe';
import { IChannelMessageConverter } from '../../../channel.message.converter.interface';
import { OutgoingMessage, IncomingMessage } from '../../../../types/common.types';
import { MessageContentType } from '../../../../types/enums';
import { WhatsAppInboundMessageConverter } from './whatsapp.inbound.message.converters';
import { WhatsAppOutboundMessageConverter } from './whatsapp.outbound.message.converter';
import { InMessageMetadata } from '../../../../types/intermediate.types';

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export default class WhatsAppMessageConverter implements IChannelMessageConverter {

    public fromChannel = async (msgMetadata: InMessageMetadata): Promise<IncomingMessage> => {
        const { message, contact, metadata } = this.fromChannelMessage(msgMetadata);
        if (!message || !contact) {
            return null;
        }
        const messageType = this.identifyMessageType(message);
        const contentConverter = new WhatsAppInboundMessageConverter(messageType);
        const convertedMessage = await contentConverter.convert({ message, contact });
        return convertedMessage;
    };

    public toChannel = async (outMessage: OutgoingMessage): Promise<any> => {
        const messageType = outMessage.MessageType;
        const contentConverter = new WhatsAppOutboundMessageConverter(messageType);
        const convertedMessage = await contentConverter.convert(outMessage);
        return convertedMessage;
    };

    public sendRequestBodyToChannel = async (body: any): Promise<any> => {
        return null;
    };

    private fromChannelMessage = (messageMetadata: InMessageMetadata) => {
        const requestBody = messageMetadata.RequestBody;
        var message = null;
        var contact = null;
        var metadata = null;
        const temp = requestBody.entry[0]?.changes[0]?.value;
        if (!temp) {
            return { message, contact, metadata };
        }
        const contacts = temp.contacts;
        const messages = temp.messages;
        // For time being, just consider first message and first contact
        message = messages[0];
        contact = contacts[0];
        metadata = temp.metadata;
        return { message, contact, metadata };
    };

    private identifyMessageType = (message: any): MessageContentType => {

        if (message && message.type === 'text') {
            return MessageContentType.Text;
        }
        if (message && message.type === 'image') {
            return MessageContentType.Image;
        }
        if (message && message.type === 'video') {
            return MessageContentType.Video;
        }
        if (message && message.type === 'reaction') {
            return MessageContentType.MessageReaction;
        }
        if (message && message.type === 'audio') {
            return MessageContentType.Audio;
        }
        if (message && message.type === 'location') {
            return MessageContentType.Location;
        }
        if (message && message.type === 'document') {
            return MessageContentType.File;
        }
        if (message && message.type === 'voice') {
            return MessageContentType.Audio;
        }
        if (message && message.type === 'contacts') {
            return MessageContentType.SharedContact;
        }
        if (message && message.type === 'interactive') {
            return MessageContentType.OptionChoice;
        }
        if (message && message.type === 'sticker') {
            return MessageContentType.Other;
        }
        return MessageContentType.Other;
    };

}
