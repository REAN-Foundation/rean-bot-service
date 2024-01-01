import { SupportInMessageMetadata } from '../../domain.types/intermediate.types';
import { SupportMessage, OutgoingSupportMessage } from '../../domain.types/common.types';

////////////////////////////////////////////////////////////////////////////////

export interface ISupportChannelMessageConverter {

    toChannel(outMessage: OutgoingSupportMessage): Promise<any>;

    fromChannel(body: SupportInMessageMetadata): Promise<SupportMessage>;

}
