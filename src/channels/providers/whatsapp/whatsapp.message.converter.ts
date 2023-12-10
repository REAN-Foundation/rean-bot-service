/* eslint-disable @typescript-eslint/no-unused-vars */
import { IChannelMessageConverter } from '../../channel.message.converter.interface';
import { OutgoingMessage, IncomingMessage } from '../../../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export default class WhatsAppMessageConverter implements IChannelMessageConverter {

    public convertOutMessageToChannelMessage = async (outMessage: OutgoingMessage): Promise<any> => {
        return null;
    };

    public convertInMessageFromChannelMessage = async (inMessage: any): Promise<IncomingMessage> => {
        return null;
    };

    public convertRequestBodyToInMessage = async (body: any): Promise<IncomingMessage> => {
        return null;
    };

    public convertOutMessageoResponseBody = async (message: OutgoingMessage): Promise<any> => {
        return null;
    };

}
