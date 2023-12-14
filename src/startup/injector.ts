/* eslint-disable @typescript-eslint/no-unused-vars */

import 'reflect-metadata';
import { ChannelType } from '../domain.types/enums';
// import { MessageHandlerType } from '../domain.types/enums';
import { DependencyContainer, container } from 'tsyringe';

import { WhatsAppAuthenticator } from '../auth/webhook.authenticator/providers/whatsapp.authenticator';
import { WhatsAppD360Authenticator } from '../auth/webhook.authenticator/providers/whatsapp.d360.authenticator';
import { TelegramAuthenticator } from '../auth/webhook.authenticator/providers/telegram.authenticator';
import { WebAppAuthenticator } from '../auth/webhook.authenticator/providers/web.app.authenticator';
import { MobileAppAuthenticator } from '../auth/webhook.authenticator/providers/mobile.app.authenticator';
import { ClickUpAuthenticator } from '../auth/webhook.authenticator/providers/clickup.authenticator';
import { SlackAuthenticator } from '../auth/webhook.authenticator/providers/slack.authenticator';

import { WhatsAppChannel } from '../channels/providers/whatsapp/whatsapp.channel';
import { WhatsAppD360Channel } from '../channels/providers/whatsapp/whatsapp.d360.channel';

// import { TelegramChannel } from '../channels/providers/telegram/telegram.channel';
// import { WebChannel } from '../channels/providers/web/web.channel';
// import { MobileChannel } from '../channels/providers/mobile/mobile.channel';
// import { ClickupChannel } from '../channels/providers/clickup/clickup.channel';
// import { SlackChannel } from '../channels/providers/slack/slack.channel';

import { ModuleInjector } from '../modules/module.injector';
import { DatabaseInjector } from '../database/database.injector';
import WhatsAppMessageConverter from '../channels/providers/whatsapp/whatsapp.message.converter';

//////////////////////////////////////////////////////////////////////

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
        if (channel === ChannelType.WhatsAppD360) {
            ctnr.register('IChannel', { useClass: WhatsAppD360Channel });
            ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
            ctnr.register('IWebhookAuthenticator', { useClass: WhatsAppD360Authenticator });
        }
        if (channel === ChannelType.Telegram) {
            ctnr.register('IChannel', { useClass: WhatsAppChannel });
            ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
            ctnr.register('IWebhookAuthenticator', { useClass: TelegramAuthenticator });
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
        // if (channel === ChannelType.Clickup) {
        //     ctnr.register('IChannel', { useClass: ClickupChannel });
        //     ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
        //     ctnr.register('IWebhookAuthenticator', { useClass: ClickUpAuthenticator });
        // }
        // if (channel === ChannelType.Slack) {
        //     ctnr.register('IChannel', { useClass: SlackChannel });
        //     ctnr.register('IChannelMessageConverter', { useClass: WhatsAppMessageConverter });
        //     ctnr.register('IWebhookAuthenticator', { useClass: SlackAuthenticator });
        // }

        // Message Handler injections
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
