import express from 'express';
import { inject, Lifecycle, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../tenant.environment/tenant.environment.provider';
import { IWebhookAuthenticator, WebhookAuthTokens } from '../webhook.authenticator.interface';

///////////////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class WhatsAppAuthenticator implements IWebhookAuthenticator{

    constructor(
        @inject(TenantEnvironmentProvider) private _envService?: TenantEnvironmentProvider
    ){}

    get tokens(): WebhookAuthTokens {
        const urlToken = this._envService.getTenantEnvironmentVariable('WEBHOOK_WHATSAPP_CLIENT_URL_TOKEN');
        const tokens: WebhookAuthTokens = {
            UrlToken : urlToken
        };
        return tokens;
    }

    authenticate(request: express.Request): void {
        const tokens = this.tokens;
        if (tokens.UrlToken === request.params.unique_token){
            return;
        }
        throw new Error(`Unable to authenticate webhook request from Whatsapp-Meta for tenant ${request.tenantName}.`);
    }

}
