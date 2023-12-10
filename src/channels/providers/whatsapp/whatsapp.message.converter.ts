/* eslint-disable @typescript-eslint/no-unused-vars */
import { IChannelMessageConverter } from '../../channel.message.converter.interface';
import { OutgoingMessage, IncomingMessage } from '../../../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export default class WhatsAppMessageConverter implements IChannelMessageConverter {

    public outMessageToChannelFormat = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    public inMessageFromChannelFormat = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    public sendMessageBodyToChannelFormat = async (body: any): Promise<any> => {
        return null;
    };

}
