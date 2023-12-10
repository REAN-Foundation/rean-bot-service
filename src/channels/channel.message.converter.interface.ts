import { OutgoingMessage, IncomingMessage } from '../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export interface IChannelMessageConverter {

    outMessageToChannelFormat(outMessage: OutgoingMessage): Promise<any>;

    inMessageFromChannelFormat(inMessage: any): Promise<IncomingMessage>;

    sendMessageBodyToChannelFormat(body: any): Promise<any>;

}
