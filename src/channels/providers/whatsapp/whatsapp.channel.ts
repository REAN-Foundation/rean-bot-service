/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import http from 'https';
import needle from "needle";
import { scoped, Lifecycle, inject, injectable } from "tsyringe";
import { Acknowledgement, Message, OutgoingMessage } from "../../../domain.types/message";
import { ChannelType } from "../../../domain.types/enums";
import { ChannelBase } from "../../channel.base";
import { TenantEnvironmentProvider } from "../../../auth/tenant.environment/tenant.environment.provider";
import { IWebhookAuthenticator } from "../../../auth/webhook.authenticator/webhook.authenticator.interface";
import { logger } from "../../../logger/logger";
import { IChannelMessageConverter } from "../../channel.message.converter.interface";
import { updateAcknowledgement } from "./whatsapp.channel.common";

//////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
@injectable()
export class WhatsAppChannel extends ChannelBase {

    constructor(
        @inject('TenantName') private _tenantName?: string,
        @inject('IWebhookAuthenticator') private _authenticator?: IWebhookAuthenticator,
        @inject('IChannelMessageConverter') private _messageConverter?: IChannelMessageConverter,
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider
    ) {
        super();
        this._channelType = ChannelType.WhatsApp;
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
        const statuses = request.body.entry[0].changes[0].value.statuses;
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

    public processIncoming = async (message: Message): Promise<Message> => {
        throw new Error("Method not implemented.");
    };

    public processOutgoing = async (message: Message): Promise<OutgoingMessage> => {
        throw new Error("Method not implemented.");
    };

    public acknowledge = async (response: express.Response, message: Message): Promise<boolean> => {
        throw new Error("Method not implemented.");
    };

    //#region  Private Methods

    //#endregion

}
