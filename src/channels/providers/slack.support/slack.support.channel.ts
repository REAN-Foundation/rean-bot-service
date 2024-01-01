/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import { WebClient } from '@slack/web-api';
import { createEventAdapter, SlackEventAdapter } from '@slack/events-api';
import { scoped, Lifecycle, inject, injectable } from "tsyringe";
import { Acknowledgement, OutgoingMessage } from "../../../domain.types/message";
import { ChannelType } from "../../../domain.types/enums";
import { ChannelBase } from "../../channel.base";
import { TenantEnvironmentProvider } from "../../../auth/tenant.environment/tenant.environment.provider";
import { IWebhookAuthenticator } from "../../../auth/webhook.authenticator/webhook.authenticator.interface";
import { logger } from "../../../logger/logger";
import { IChannelMessageConverter } from "../../channel.message.converter.interface";
import { ISupportChannel } from "../../support.channels/support.channel.interface";
import { IChannel } from "../../channel.interface";
import { SupportChannelCommonUtilities } from "../../support.channels/support.channel.common.utilities";

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
            await this.init();

            const text = message.text;
            const response = await this._client.chat.postMessage(message);
            const supportChannelTaskId = response.ts;
            logger.info(`Response -> Message sent to Slack: ${JSON.stringify(response, null, 2)}`);
            return supportChannelTaskId;


            // let messageContent = response[response.length - 1].dataValues.messageContent;
            // messageContent = (topic !== null) ? topic : messageContent;

            // const objID = (topic !== null) ?
            //     response[response.length - 2].dataValues.id :
            //     response[response.length - 1].dataValues.id;

            // const chatMessageRepository = (
            //    await this.entityManagerProvider.getEntityManager(this.clientEnvironmentProviderService))
            //    .getRepository(ChatMessage);
            // await chatMessageRepository.update({ supportChannelTaskID: response.ts }, { where: { id: objID } })
            //     .then(() => { console.log("updated"); })
            //     .catch(error => console.log("error on update", error));

        }
        catch (error) {
            logger.error(`Error occurred while sending message to Whatsapp: ${error}`);
        }
    };

    public sendSupportResponse = async (outChannel: IChannel, message: OutgoingMessage): Promise<any> => {
        return await SupportChannelCommonUtilities.sendSupportResponse(outChannel, message);
    };

    public acknowledge = async (
        request: express.Request,
        response: express.Response,
        ack: Acknowledgement): Promise<any> => {
        const challenge = ack.Data;
        return response.status(200).send(challenge);
    };

}
