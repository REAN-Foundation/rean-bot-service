import express from 'express';
import { Acknowledgement, ChatSession, IncomingMessage, OutgoingMessage } from '../types/common.types';
import { IWebhookAuthenticator } from '../auth/webhook.authenticator/webhook.authenticator.interface';
import { IChannelMessageConverter } from './channel.message.converter.interface';
import { ChannelType } from '../types/enums';

////////////////////////////////////////////////////////////////////////////////

export interface IChannel {

    init() : Promise<void>;

    messageConverter(): IChannelMessageConverter;

    webhookAuthenticator(): IWebhookAuthenticator;

    channelType(): ChannelType;

    setupWebhook(tenantName: string): Promise<boolean>;

    shouldAcknowledge: (request: express.Request) => Promise<Acknowledgement>;

    processIncoming: (message: IncomingMessage, session: ChatSession) => Promise<IncomingMessage>;

    processOutgoing: (message: OutgoingMessage) => Promise<OutgoingMessage>;

    send: (channelUserId: string, message: any) => Promise<any>;

    acknowledge: (request: express.Request, response: express.Response, ack: Acknowledgement) => Promise<any>;

}
