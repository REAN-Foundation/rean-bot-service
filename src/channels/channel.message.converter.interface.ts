import express from 'express';
import { OutgoingMessage, IncomingMessage } from '../domain.types/message';

////////////////////////////////////////////////////////////////////////////////

export interface IChannelMessageConverter {

    toChannel(outMessage: OutgoingMessage): Promise<any>;

    fromChannel(request: express.Request): Promise<IncomingMessage>;

    sendRequestBodyToChannel(body: any): Promise<any>;

}
