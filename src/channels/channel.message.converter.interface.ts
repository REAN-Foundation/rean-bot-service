import { OutgoingMessage, IncomingMessage } from '../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export interface IChannelMessageConverter {

    toChannel(outMessage: OutgoingMessage): Promise<any>;

    fromChannel(body: any): Promise<IncomingMessage>;

    sendRequestBodyToChannel(body: any): Promise<any>;

}
