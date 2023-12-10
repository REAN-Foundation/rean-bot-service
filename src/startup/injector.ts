import 'reflect-metadata';
import { ChannelType } from '../domain.types/enums';
// import { MessageHandlerType } from '../domain.types/enums/message.handler.enum';
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

import { ModuleInjector } from '../modules/module.injector';
import { DatabaseInjector } from '../database/database.injector';

//////////////////////////////////////////////////////////////////////

export class Injector {

    private static _baseContainer: DependencyContainer = container;

    public static get BaseContainer() {
        return Injector._baseContainer;
    }

    static registerScopedInjections(ctnr: DependencyContainer) {

        ctnr.register(`${ChannelType.WhatsApp}Channel`, { useClass: WhatsAppChannel });
        ctnr.register(`${ChannelType.WhatsAppD360}Channel`, { useClass: WhatsAppD360Channel });
        // ctnr.register(`${ChannelType.Telegram}Channel`, { useClass: TelegramChannel });
        // ctnr.register(`${ChannelType.Teams}Channel`, { useClass: TeamsChannel });
        // ctnr.register(`${ChannelType.Web}Channel`, { useClass: WebChannel });
        // ctnr.register(`${ChannelType.Mobile}Channel`, { useClass: MobileChannel });
        // ctnr.register(`${ChannelType.Clickup}Channel`, { useClass: ClickupChannel });
        // ctnr.register(`${ChannelType.Slack}Channel`, { useClass: SlackChannel });

        // ctnr.register(`${MessageHandlerType.DialogFlow}MessageHandler`, { useClass: DialogFlowMessageHandler });
        // ctnr.register(`${MessageHandlerType.LLM}MessageHandler`, { useClass: LLMSMessageHandler });
        // ctnr.register(`${MessageHandlerType.Assessments}MessageHandler`, { useClass: AssessmentsMessageHandler });
        // ctnr.register(`${MessageHandlerType.Feedback}MessageHandler`, { useClass: FeedbackMessageHandler });
        // ctnr.register(`${MessageHandlerType.Custom}MessageHandler`, { useClass: CustomMessageHandler });

        ctnr.register(`${ChannelType.WhatsApp}Authenticator`, { useClass: WhatsAppAuthenticator });
        ctnr.register(`${ChannelType.WhatsAppD360}Authenticator`, { useClass: WhatsAppD360Authenticator });
        ctnr.register(`${ChannelType.Telegram}Authenticator`, { useClass: TelegramAuthenticator });
        // ctnr.register(`${ChannelType.Teams}Authenticator`, { useClass: TeamsAuthenticator });
        ctnr.register(`${ChannelType.Web}Authenticator`, { useClass: WebAppAuthenticator });
        ctnr.register(`${ChannelType.Mobile}Authenticator`, { useClass: MobileAppAuthenticator });
        ctnr.register(`${ChannelType.Clickup}Authenticator`, { useClass: ClickUpAuthenticator });
        ctnr.register(`${ChannelType.Slack}Authenticator`, { useClass: SlackAuthenticator });

    }

    static registerInjections() {
        ModuleInjector.registerInjections(this._baseContainer);
        DatabaseInjector.registerInjections(this._baseContainer);
    }

}
