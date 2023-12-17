/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { scoped, Lifecycle } from 'tsyringe';
import { IChannelMessageConverter } from '../../channel.message.converter.interface';
import { OutgoingMessage, IncomingMessage } from '../../../domain.types/message';
import {
    MessageContentType,
    MessageDirection,
} from '../../../domain.types/enums';
import { WhatsAppInboundMessageConverter } from './whatsapp.inbound.message.converters';
import { WhatsAppOutboundMessageConverter } from './whatsapp.outbound.message.converter';

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export default class WhatsAppMessageConverter implements IChannelMessageConverter {

    public fromChannel = async (request: express.Request): Promise<IncomingMessage> => {
        const container = request.container;
        const requestBody = request.body;
        const temp = requestBody.entry[0]?.changes[0]?.value;
        if (!temp) {
            return null;
        }
        const contacts = temp.contacts;
        const messages = temp.messages;
        // For time being, just consider first message and first contact
        const message = messages[0];
        const contact = contacts[0];

        const inbound = { message, contact };
        const messageType = this.identifyMessageType(message);

        const contentConverter = new WhatsAppInboundMessageConverter(messageType);
        const convertedMessage = await contentConverter.convert(inbound);
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
        if (message && message.type === 'sticker') {
            return MessageContentType.Other;
        }
        if (message && message.type === 'voice') {
            return MessageContentType.Audio;
        }
        if (message && message.type === 'contacts') {
            return MessageContentType.SharedContact;
        }

        return MessageContentType.Other;
    };

}
