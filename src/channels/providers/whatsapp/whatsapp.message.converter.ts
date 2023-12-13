/* eslint-disable @typescript-eslint/no-unused-vars */
import { IChannelMessageConverter } from '../../channel.message.converter.interface';
import { OutgoingMessage, IncomingMessage } from '../../../domain.types/message';
import {
    MessageContentType,
    MessageDirection,
} from '../../../domain.types/enums';
import { WhatsAppContentConverter } from './whatsapp.content.converters';
import { scoped, Lifecycle } from 'tsyringe';

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export default class WhatsAppMessageConverter implements IChannelMessageConverter {

    public toChannel = async (outMessage: OutgoingMessage): Promise<any> => {
        const messageType = outMessage.MessageType;
        const direction = MessageDirection.Out;
        const contentConverter = new WhatsAppContentConverter(messageType, direction);
        const convertedMessage = await contentConverter.convert(outMessage);
        return convertedMessage;
    };

    public fromChannel = async (inMessage: any): Promise<IncomingMessage> => {
        const messageType = this.identifyMessageType(inMessage);
        const direction = MessageDirection.In;
        const contentConverter = new WhatsAppContentConverter(messageType, direction);
        const convertedMessage = await contentConverter.convert(inMessage);
        return convertedMessage as IncomingMessage;
    };

    public sendRequestBodyToChannel = async (body: any): Promise<any> => {
        return null;
    };

    private identifyMessageType = (inMessage: any): MessageContentType => {
        return MessageContentType.Text;
    };

}
