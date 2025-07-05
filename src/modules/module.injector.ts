import 'reflect-metadata';
import { DependencyContainer } from 'tsyringe';
import { ConfigurationManager } from '../config/configuration.manager';
import { MockMessagingService } from './general/sms/providers/mock.messaging.service';
import { SendGridEmailService } from './general/email/providers/sendgrid.email.service';
import { SMTPEmailService } from './general/email/providers/smtp.email.service';

////////////////////////////////////////////////////////////////////////////////

export class ModuleInjector {

    public static registerInjections(container: DependencyContainer) {
        ModuleInjector.injectEmailProvider(container);
        ModuleInjector.injectSmsProvider(container);
    }

    private static injectSmsProvider(container: DependencyContainer) {
        const smsProvider = ConfigurationManager.SmsProvider();
        if (smsProvider === 'Twilio') {
            // container.register('IMessagingService', TwilioMessagingService);
        }
        else if (smsProvider === 'Mock') {
            container.register('IMessagingService', MockMessagingService);
        }
    }

    private static injectEmailProvider(container: DependencyContainer) {
        const emailProvider = ConfigurationManager.EmailProvider();
        if (emailProvider === 'SendGrid') {
            container.register('IEmailService', SendGridEmailService);
        }
        else if (emailProvider === 'SMTP') {
            container.register('IEmailService', SMTPEmailService);
        }
    }

}
