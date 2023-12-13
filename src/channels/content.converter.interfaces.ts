import { OutgoingMessage, IncomingMessage } from '../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export interface IContentConverter {
    convert(message: OutgoingMessage | Record<string, any>)
        : Promise<IncomingMessage | Record<string, any>>;
}
