/* eslint-disable @typescript-eslint/no-unused-vars */
import { IChannelMessageConverter } from '../../channel.message.converter.interface';
import { OutgoingMessage, IncomingMessage } from '../../../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export default class WhatsAppMessageConverter implements IChannelMessageConverter {

    public toChannel = async (outMessage: OutgoingMessage): Promise<any> => {

        const messageType = outMessage.MessageType;

        return null;
    };

    public fromChannel = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    public sendRequestBodyToChannel = async (body: any): Promise<any> => {
        return null;
    };

}
