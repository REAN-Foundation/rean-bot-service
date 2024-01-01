import { InMessageMetadata } from '../domain.types/intermediate.types';
import { OutgoingMessage, IncomingMessage } from '../domain.types/common.types';

////////////////////////////////////////////////////////////////////////////////

export interface IChannelMessageConverter {

    toChannel(outMessage: OutgoingMessage): Promise<any>;

    fromChannel(body: InMessageMetadata): Promise<IncomingMessage>;

    sendRequestBodyToChannel(body: any): Promise<any>;

}
