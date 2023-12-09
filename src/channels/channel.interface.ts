import express from 'express';
import { Message } from '../domain.types/message';
import { IWebhookAuthenticator } from '../auth/webhook.authenticator/webhook.authenticator.interface';

////////////////////////////////////////////////////////////////////////////////

export interface IChannel {

    init() : Promise<void>;

    setupWebhook(tenantName: string): Promise<boolean>;

    processIncoming: (message: Message) => Promise<Message>;

    processOutgoing: (message: Message) => Promise<Message>;

    send: (message: Message) => Promise<boolean>;

    acknowledge: (response: express.Response, message: Message) => Promise<boolean>;

    webhookAuthenticator(): IWebhookAuthenticator;

}
