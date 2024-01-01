import express from 'express';
import { Acknowledgement, IncomingMessage, OutgoingMessage } from '../domain.types/common.types';
import { IChannel } from './channel.interface';
import { IWebhookAuthenticator } from '../auth/webhook.authenticator/webhook.authenticator.interface';
import { IChannelMessageConverter } from './channel.message.converter.interface';
import { ChannelType } from '../domain.types/enums';
import { logger } from '../logger/logger';
import { ResponseHandler } from '../common/handlers/response.handler';

////////////////////////////////////////////////////////////////////////////////

export abstract class ChannelBase implements IChannel {

    public _channelType: ChannelType = ChannelType.Mock;

    public channelType(): ChannelType {
        return this._channelType;
    }

    abstract init(): Promise<void>;

    abstract webhookAuthenticator(): IWebhookAuthenticator;

    abstract messageConverter(): IChannelMessageConverter;

    abstract send (channelUserId: string, message: any): Promise<boolean>;

    public setupWebhook = async (): Promise<boolean> => {
        return true;
    };

    public shouldAcknowledge = async (request: express.Request): Promise<Acknowledgement> => {
        logger.info('ChannelBase.shouldAcknowledge: Acknowledging request');
        logger.info(JSON.stringify(request.body, null, 2));
        var ack: Acknowledgement = {
            ShouldAcknowledge : true, //Always acknowledge
            Message           : null,
            StatusCode        : null,
            Data              : null,
        };
        return ack;
    };

    public processIncoming = async (message: IncomingMessage): Promise<IncomingMessage> => {
        return message;
    };

    public processOutgoing = async (message: OutgoingMessage): Promise<OutgoingMessage> => {
        return message;
    };

    public acknowledge = async (request: express.Request,
        response: express.Response, ack: Acknowledgement): Promise<any> => {
        const message = ack?.Message ?? 'Acknowledged successfully!';
        return ResponseHandler.success(request, response, message, ack.StatusCode, ack.Data);
    };

}
