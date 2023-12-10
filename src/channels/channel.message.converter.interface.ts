import { OutgoingMessage, IncomingMessage } from '../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export interface IChannelMessageConverter {

    convertOutMessageToChannelMessage(outMessage: OutgoingMessage): Promise<any>;

    convertInMessageFromChannelMessage(inMessage: any): Promise<IncomingMessage>;

    convertRequestBodyToInMessage(body: any): Promise<IncomingMessage>;

    convertOutMessageoResponseBody(message: OutgoingMessage): Promise<any>;

}
