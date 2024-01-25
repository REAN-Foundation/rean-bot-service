import { InMessageMetadata } from '../types/intermediate.types';
import { OutgoingMessage, IncomingMessage } from '../types/common.types';

////////////////////////////////////////////////////////////////////////////////

export interface IChannelMessageConverter {

    toChannel(outMessage: OutgoingMessage): Promise<any>;

    fromChannel(body: InMessageMetadata): Promise<IncomingMessage>;

    sendRequestBodyToChannel(body: any): Promise<any>;

}
