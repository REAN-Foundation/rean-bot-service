/* eslint-disable @typescript-eslint/no-unused-vars */
import { scoped, Lifecycle } from 'tsyringe';
import { IChannelMessageConverter } from '../../channel.message.converter.interface';
import { OutgoingMessage, IncomingMessage } from '../../../domain.types/message';
import { MessageContentType } from '../../../domain.types/enums';
import { SlackInboundMessageConverter } from './slack.inbound.message.converters';
import { SlackOutboundMessageConverter } from './slack.outbound.message.converter';
import { InMessageMetadata } from '../../../domain.types/intermediate.data.types';

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export default class SlackMessageConverter implements IChannelMessageConverter {

    public fromChannel = async (msgMetadata: InMessageMetadata): Promise<IncomingMessage> => {
        // const { message, contact, metadata } = this.fromChannelMessage(msgMetadata);
        // if (!message || !contact) {
        //     return null;
        // }
        const requestBody = msgMetadata.RequestBody;
        const messageType = this.identifyMessageType(requestBody);
        const contentConverter = new SlackInboundMessageConverter(messageType);
        const convertedMessage = await contentConverter.convert(msgMetadata);
        return convertedMessage;
    };

    public toChannel = async (outMessage: OutgoingMessage): Promise<any> => {
        const messageType = outMessage.MessageType;
        const contentConverter = new SlackOutboundMessageConverter(messageType);
        const convertedMessage = await contentConverter.convert(outMessage);
        return convertedMessage;
    };

    public sendRequestBodyToChannel = async (body: any): Promise<any> => {
        return null;
    };

    // private fromChannelMessage = (messageMetadata: InMessageMetadata) => {
    //     const requestBody = messageMetadata.RequestBody;
    //     var message = null;
    //     var contact = null;
    //     var metadata = null;
    //     const temp = requestBody.entry[0]?.changes[0]?.value;
    //     if (!temp) {
    //         return { message, contact, metadata };
    //     }
    //     const contacts = temp.contacts;
    //     const messages = temp.messages;
    //     // For time being, just consider first message and first contact
    //     message = messages[0];
    //     contact = contacts[0];
    //     metadata = temp.metadata;
    //     return { message, contact, metadata };
    // };

    private identifyMessageType = (message: any): MessageContentType => {

        if (message && message.event && message.event.type === 'message' && message.event.text) {
            if (message.event.text.length > 0) {
                return MessageContentType.Text;
            }
        }
        return MessageContentType.Other;
    };

}
