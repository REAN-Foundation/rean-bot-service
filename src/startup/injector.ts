/* eslint-disable @typescript-eslint/no-unused-vars */

import 'reflect-metadata';
import { ChannelType } from '../domain.types/enums';
// import { MessageHandlerType } from '../domain.types/enums';
import { DependencyContainer, container } from 'tsyringe';

import { WhatsAppAuthenticator } from '../auth/webhook.authenticator/providers/whatsapp.authenticator';
import { TelegramAuthenticator } from '../auth/webhook.authenticator/providers/telegram.authenticator';
import { WebAppAuthenticator } from '../auth/webhook.authenticator/providers/web.app.authenticator';
import { MobileAppAuthenticator } from '../auth/webhook.authenticator/providers/mobile.app.authenticator';
import { ClickUpAuthenticator } from '../auth/webhook.authenticator/providers/clickup.authenticator';
import { SlackAuthenticator } from '../auth/webhook.authenticator/providers/slack.authenticator';

import { WhatsAppChannel } from '../channels/providers/whatsapp/whatsapp.channel';
import { ClickupChannel } from '../channels/providers/clickup/clickup.channel';
import { SlackChannel } from '../channels/providers/slack/slack.channel';

// import { TelegramChannel } from '../channels/providers/telegram/telegram.channel';
// import { WebChannel } from '../channels/providers/web/web.channel';
// import { MobileChannel } from '../channels/providers/mobile/mobile.channel';

import { DialogFlowHandler } from '../message.handlers/nlp/dialogflow/dialogflow.handler';

import WhatsAppMessageConverter from '../channels/providers/whatsapp/whatsapp.message.converter';
import { UserLanguage } from '../message.pipelines/translation/user.language';
import { GoogleTranslator } from '../message.pipelines/translation/providers/google.translator';

import { ModuleInjector } from '../modules/module.injector';
import { DatabaseInjector } from '../database/database.injector';
import { OpenAIProvider } from '../integrations/llm/providers/openai.provider';
import { AwsSpeechService } from '../message.pipelines/speech/providers/aws.speech.service';

///////////////////////////////////////////////////////////////////////////////////////////

export class Injector {

    private static _baseContainer: DependencyContainer = container;

    public static get BaseContainer() {
        return Injector._baseContainer;
    }

    static registerScopedInjections(ctnr: DependencyContainer, tenantName?: string, channel?: ChannelType) {

        // Keys
        ctnr.register('TenantName', { useValue: tenantName });
        ctnr.register('ChannelName', { useValue: channel.toString() });

        // Channels specific injections
        if (channel === ChannelType.WhatsApp) {
            ctnr.register('IChannel', { useClass: WhatsAppChannel });
            ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
            ctnr.register('IWebhookAuthenticator', { useClass: WhatsAppAuthenticator });
        }
        if (channel === ChannelType.Telegram) {
            ctnr.register('IChannel', { useClass: WhatsAppChannel });
            ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
            ctnr.register('IWebhookAuthenticator', { useClass: TelegramAuthenticator });
        }
        if (channel === ChannelType.Clickup) {
            ctnr.register('IChannel', { useClass: ClickupChannel });
            // ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
            ctnr.register('IWebhookAuthenticator', { useClass: ClickUpAuthenticator });
        }
        if (channel === ChannelType.Slack) {
            ctnr.register('IChannel', { useClass: SlackChannel });
            // ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
            ctnr.register('IWebhookAuthenticator', { useClass: SlackAuthenticator });
        }

        // if (channel === ChannelType.Web) {
        //     ctnr.register('IChannel', { useClass: WebChannel });
        //     ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
        //     ctnr.register('IWebhookAuthenticator', { useClass: WebAppAuthenticator });
        // }
        // if (channel === ChannelType.Mobile) {
        //     ctnr.register('IChannel', { useClass: MobileChannel });
        //     ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
        //     ctnr.register('IWebhookAuthenticator', { useClass: MobileAppAuthenticator });
        // }

        ctnr.register('UserLanguage', { useClass: UserLanguage });
        ctnr.register('ITranslator', { useClass: GoogleTranslator });
        ctnr.register('ILLMServiceProvider', { useClass: OpenAIProvider });
        ctnr.register('ISpeechService', { useClass: AwsSpeechService });

        // Message Handler injections

        ctnr.register('INLPHandler', { useClass: DialogFlowHandler });

        // ctnr.register(`${MessageHandlerType.DialogFlow}MessageHandler`, { useClass: DialogFlowMessageHandler });
        // ctnr.register(`${MessageHandlerType.LLM}MessageHandler`, { useClass: LLMSMessageHandler });
        // ctnr.register(`${MessageHandlerType.Assessments}MessageHandler`, { useClass: AssessmentsMessageHandler });
        // ctnr.register(`${MessageHandlerType.Feedback}MessageHandler`, { useClass: FeedbackMessageHandler });
        // ctnr.register(`${MessageHandlerType.Custom}MessageHandler`, { useClass: CustomMessageHandler });

        // Support channels injections
        // For support channels, inject through concrete classes
        // ctnr.register(`${ChannelType.Clickup}Channel`, { useClass: ClickupChannel });
        // ctnr.register(`${ChannelType.Slack}Channel`, { useClass: SlackChannel });
        ctnr.register(`${ChannelType.Clickup}Authenticator`, { useClass: ClickUpAuthenticator });
        ctnr.register(`${ChannelType.Slack}Authenticator`, { useClass: SlackAuthenticator });

    }

    static registerInjections() {
        ModuleInjector.registerInjections(this._baseContainer);
        DatabaseInjector.registerInjections(this._baseContainer);
    }

}
