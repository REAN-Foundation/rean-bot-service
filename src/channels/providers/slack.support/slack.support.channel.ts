/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import http from 'https';
import needle from "needle";
import { WebClient } from '@slack/web-api';
import { createEventAdapter, SlackEventAdapter } from '@slack/events-api';
import { scoped, Lifecycle, inject, injectable } from "tsyringe";
import { Acknowledgement, Message, OutgoingMessage } from "../../../domain.types/message";
import { ChannelType } from "../../../domain.types/enums";
import { ChannelBase } from "../../channel.base";
import { TenantEnvironmentProvider } from "../../../auth/tenant.environment/tenant.environment.provider";
import { IWebhookAuthenticator } from "../../../auth/webhook.authenticator/webhook.authenticator.interface";
import { logger } from "../../../logger/logger";
import { IChannelMessageConverter } from "../../channel.message.converter.interface";
import { ISupportChannel } from "../../support.channels/support.channel.interface";
import { IChannel } from "../../channel.interface";
import { SupportChannelCommon } from "../../support.channels/support.channel.base";
import { ResponseHandler } from "../../../common/handlers/response.handler";

//////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
@injectable()
export class SlackSupportChannel extends ChannelBase implements ISupportChannel {

    _initialized = false;

    _client: WebClient = null;

    _slackEventAdapter: SlackEventAdapter = null;

    _currentSlackChannelId: string = null; //Support channel Id for the current tenant

    constructor(
        @inject('TenantName') private _tenantName?: string,
        @inject('IWebhookAuthenticator') private _authenticator?: IWebhookAuthenticator,
        @inject('SlackMessageConverter') private _messageConverter?: IChannelMessageConverter,
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider
    ) {
        super();
        this._channelType = ChannelType.Slack;
    }

    async init(): Promise<void> {
        if (!this._initialized || this._client === null) {
            logger.info('Initializing Slack Channel');
            const token = this._tenantEnvProvider.getTenantEnvironmentVariable('SLACK_TOKEN_FEEDBACK');
            const secret = this._tenantEnvProvider.getTenantEnvironmentVariable('SLACK_SECRET_FEEDBACK');
            this._currentSlackChannelId = this._tenantEnvProvider.getTenantEnvironmentVariable('SLACK_FEEDBACK_CHANNEL_ID');
            this._client = new WebClient(token);
            this._slackEventAdapter = createEventAdapter(secret);
            this._initialized = true;
        }
    }

    public webhookAuthenticator = (): IWebhookAuthenticator => {
        return this._authenticator;
    };

    public messageConverter = (): IChannelMessageConverter => {
        return this._messageConverter;
    };

    public shouldAcknowledge = async (request: express.Request): Promise<Acknowledgement> => {
        var ack: Acknowledgement = {
            ShouldAcknowledge : true, //Always acknowledge
            Message           : null,
            StatusCode        : null,
            Data              : request.body.challenge,
        };
        return ack;
    };

    public send = async (channelUserId: string, message: any): Promise<any> => {
        try {

            const apiVersion = this._tenantEnvProvider.getTenantEnvironmentVariable("META_API_VERSION");
            const apiToken = this._tenantEnvProvider.getTenantEnvironmentVariable("META_API_TOKEN");
            const host = this._tenantEnvProvider.getTenantEnvironmentVariable("META_WHATSAPP_HOST");
            const url = host + '/' + apiVersion + '/' + channelUserId + '/messages';
            const postData = JSON.stringify(message);
            const options = {
                headers : {
                    'Content-Type'  : 'application/json',
                    'Authorization' : `Bearer ${apiToken}`,
                },
                compressed : true,
            };

            const response = await needle('post', url, postData, options);
            if (response.statusCode !== 201 && response.statusCode !== 200) {
                logger.error(`Error occurred while sending message to Whatsapp: ${response.body}`);
            }
            logger.info(`Message sent to Whatsapp: ${response.body}`);
            return response.body;
        }
        catch (error) {
            logger.error(`Error occurred while sending message to Whatsapp: ${error}`);
        }
    };

    public sendSupportResponse = async (outChannel: IChannel, message: OutgoingMessage): Promise<any> => {
        return await SupportChannelCommon.sendSupportResponse(outChannel, message);
    };

    public acknowledge = async (
        request: express.Request,
        response: express.Response,
        ack: Acknowledgement): Promise<any> => {
        const challenge = ack.Data;
        return response.status(200).send(challenge);
    };

    //#region  Private Methods

    //#endregion

}
