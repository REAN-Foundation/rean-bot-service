/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import http from 'https';
import { scoped, Lifecycle, inject } from "tsyringe";
import { Acknowledgement, Message, OutgoingMessage } from "../../../domain.types/message";
import { ChannelType } from "../../../domain.types/enums";
import { ChannelBase } from "../../channel.base";
import { TenantEnvironmentProvider } from "../../../auth/tenant.environment/tenant.environment.provider";
import { IWebhookAuthenticator } from "../../../auth/webhook.authenticator/webhook.authenticator.interface";
import { logger } from "../../../logger/logger";
import { IChannelMessageConverter } from "../../channel.message.converter.interface";
import { updateAcknowledgement } from "../whatsapp/whatsapp.channel.common";

//////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class WhatsAppD360Channel extends ChannelBase {

    constructor(
        @inject('TenantName') private _tenantName?: string,
        @inject('IWebhookAuthenticator') private _authenticator?: IWebhookAuthenticator,
        @inject('IChannelMessageConverter') private _messageConverter?: IChannelMessageConverter,
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider
    ) {
        super();
        this._channelType = ChannelType.WhatsAppD360;
    }

    async init(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public webhookAuthenticator = (): IWebhookAuthenticator => {
        return this._authenticator;
    };

    public messageConverter = (): IChannelMessageConverter => {
        return this._messageConverter;
    };

    public shouldAcknowledge = async (request: express.Request): Promise<Acknowledgement> => {
        var ack: Acknowledgement = {
            ShouldAcknowledge : false,
            Message           : null,
            StatusCode        : null,
        };
        const statuses = request.body.statuses;
        if (statuses) {
            ack = await updateAcknowledgement(statuses, ack, request);
        }
        return ack;
    };

    public setupWebhook = async (): Promise<boolean> => {

        const baseUrl = this._tenantEnvProvider.getTenantEnvironmentVariable("BASE_URL");
        const apiKey = this._tenantEnvProvider.getTenantEnvironmentVariable("WHATSAPP_LIVE_API_KEY");
        const host = this._tenantEnvProvider.getTenantEnvironmentVariable("WHATSAPP_LIVE_API_HOST");
        const urlToken = this._authenticator.tokens?.UrlToken;
        const headerToken = this._authenticator.tokens?.HeaderToken;
        const webhookUrl = `${baseUrl}/v1/${this._tenantName}/whatsapp/${urlToken}/receive`;

        const postData = JSON.stringify({
            'url'     : webhookUrl,
            "headers" : {
                "authentication" : headerToken
            }
        });
        const options = {
            hostname : host,
            path     : '/v1/configs/webhook',
            method   : 'POST',
            headers  : {
                'Content-Type' : 'application/json',
                'D360-Api-Key' : apiKey
            }
        };

        return new Promise((resolve, reject) => {
            const request = http.request(options, (response) => {
                response.setEncoding('utf8');
                response.on('data', () => {
                    resolve(true);
                });
                response.on('end', () => {
                    //console.log("Webhook URL set for Whatsapp");
                    resolve(true);
                });
            });
            request.on('error', (err) => {
                logger.error(`Problem with setting up webhook request: ${err.message}`);
                reject();
            });
            request.write(postData);
            request.end();
        });

    };

    public processIncoming = async (message: any): Promise<Message> => {
        const incomingMessage = await this._messageConverter.fromChannel(message);
        return incomingMessage;
    };

    public processOutgoing = async (message: OutgoingMessage): Promise<OutgoingMessage> => {
        throw new Error("Method not implemented.");
    };

    public send = async (message: Message): Promise<boolean> => {
        throw new Error("Method not implemented.");
    };

    public acknowledge = async (response: express.Response, message: Message): Promise<boolean> => {
        throw new Error("Method not implemented.");
    };

}