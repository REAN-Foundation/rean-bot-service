import { OutgoingMessage, IncomingMessage } from '../domain.types/common.types';

////////////////////////////////////////////////////////////////////////////////

export interface IContentConverter {
    convert(message: OutgoingMessage | Record<string, any>)
        : Promise<IncomingMessage | Record<string, any>>;
}
