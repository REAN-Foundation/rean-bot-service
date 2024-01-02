import { SupportInMessageMetadata } from '../../types/intermediate.types';
import { HumanSupportMessage, OutgoingSupportMessage } from '../../types/common.types';

////////////////////////////////////////////////////////////////////////////////

export interface ISupportChannelMessageConverter {

    toChannel(outMessage: OutgoingSupportMessage): Promise<any>;

    fromChannel(body: SupportInMessageMetadata): Promise<HumanSupportMessage>;

}
