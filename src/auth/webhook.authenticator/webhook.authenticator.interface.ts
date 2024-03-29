import express from 'express';

export interface WebhookAuthTokens {
    HeaderToken?: string;
    UrlToken   ?: string;
}

export interface IWebhookAuthenticator {

    authenticate(request: express.Request): void;

    get tokens() : WebhookAuthTokens;

}
