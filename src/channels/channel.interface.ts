import express from 'express';
import { IncomingMessage, Message, OutgoingMessage } from '../domain.types/message';
import { IWebhookAuthenticator } from '../auth/webhook.authenticator/webhook.authenticator.interface';
import { IChannelMessageConverter } from './channel.message.converter.interface';
import { ChannelType } from '../domain.types/enums';

////////////////////////////////////////////////////////////////////////////////

export interface IChannel {

    init() : Promise<void>;

    messageConverter(): IChannelMessageConverter;

    webhookAuthenticator(): IWebhookAuthenticator;

    channelType(): ChannelType;

    setupWebhook(tenantName: string): Promise<boolean>;

    processIncoming: (message: IncomingMessage) => Promise<IncomingMessage>;

    processOutgoing: (message: OutgoingMessage) => Promise<OutgoingMessage>;

    send: (message: Message) => Promise<boolean>;

    acknowledge: (response: express.Response, message: Message) => Promise<boolean>;

}
