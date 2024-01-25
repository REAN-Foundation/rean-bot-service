import { SupportInMessageMetadata } from '../../types/intermediate.types';
import { ProcessableSupportMessage, OutgoingSupportMessage } from '../../types/common.types';

////////////////////////////////////////////////////////////////////////////////

export interface ISupportChannelMessageConverter {

    toChannel(outMessage: OutgoingSupportMessage): Promise<any>;

    fromChannel(body: SupportInMessageMetadata): Promise<ProcessableSupportMessage>;

}
