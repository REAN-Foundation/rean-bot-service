import express from 'express';
import { Message } from '../domain.types/message';
import { IChannel } from './channel.interface';
import { logger } from '../logger/logger';
import { IWebhookAuthenticator } from '../auth/webhook.authenticator/webhook.authenticator.interface';

////////////////////////////////////////////////////////////////////////////////

export abstract class ChannelBase implements IChannel {

    public _channelType: string = '';

    init(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    get ChannelType(): string {
        return this._channelType;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async setupWebhook(tenantName: string): Promise<boolean> {
        logger.info(`Setting up webhook for ${this._channelType} channel for tenant ${tenantName}.`);
        throw new Error('Method not implemented.');
    }

    abstract processIncoming (message: Message): Promise<Message>;

    abstract processOutgoing (message: Message): Promise<Message>;

    abstract send (message: Message): Promise<boolean>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async acknowledge (response: express.Response, message: Message): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    abstract webhookAuthenticator(): IWebhookAuthenticator;

}
