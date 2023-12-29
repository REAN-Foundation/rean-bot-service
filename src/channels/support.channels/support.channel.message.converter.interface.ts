import { SupportInMessageMetadata } from '../../domain.types/intermediate.data.types';
import { SupportMessage, OutgoingSupportMessage } from '../../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export interface ISupportChannelMessageConverter {

    toChannel(outMessage: OutgoingSupportMessage): Promise<any>;

    fromChannel(body: SupportInMessageMetadata): Promise<SupportMessage>;

}
