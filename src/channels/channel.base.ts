import express from 'express';
import { Acknowledgement, IncomingMessage, Message, OutgoingMessage } from '../domain.types/message';
import { IChannel } from './channel.interface';
import { IWebhookAuthenticator } from '../auth/webhook.authenticator/webhook.authenticator.interface';
import { IChannelMessageConverter } from './channel.message.converter.interface';
import { ChannelType } from '../domain.types/enums';

////////////////////////////////////////////////////////////////////////////////

export abstract class ChannelBase implements IChannel {

    public _channelType: ChannelType = ChannelType.Mock;

    public channelType(): ChannelType {
        return this._channelType;
    }

    abstract init(): Promise<void>;

    abstract webhookAuthenticator(): IWebhookAuthenticator;

    abstract messageConverter(): IChannelMessageConverter;

    abstract setupWebhook(): Promise<boolean>;

    abstract shouldAcknowledge(request: express.Request): Promise<Acknowledgement>;

    abstract processIncoming (message: IncomingMessage): Promise<IncomingMessage>;

    abstract processOutgoing (message: OutgoingMessage): Promise<OutgoingMessage>;

    abstract send (message: Message): Promise<boolean>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async acknowledge (response: express.Response, message: Message): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

}
