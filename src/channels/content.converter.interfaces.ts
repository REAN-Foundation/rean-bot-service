import { OutgoingMessage, IncomingMessage } from '../types/common.types';

////////////////////////////////////////////////////////////////////////////////

export interface IContentConverter {
    convert(message: OutgoingMessage | Record<string, any>)
        : Promise<IncomingMessage | Record<string, any>>;
}
