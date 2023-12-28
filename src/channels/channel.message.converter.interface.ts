import { InMessageMetadata } from '../domain.types/intermediate.data.types';
import { OutgoingMessage, IncomingMessage } from '../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export interface IChannelMessageConverter {

    toChannel(outMessage: OutgoingMessage): Promise<any>;

    fromChannel(body: InMessageMetadata): Promise<IncomingMessage>;

    sendRequestBodyToChannel(body: any): Promise<any>;

}
