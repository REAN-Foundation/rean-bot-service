/* eslint-disable @typescript-eslint/no-unused-vars */
import { scoped, Lifecycle, inject } from 'tsyringe';
import { ISupportChannelMessageConverter } from '../../support.channels/support.channel.message.converter.interface';
import { OutgoingSupportMessage, SupportMessage } from '../../../domain.types/common.types';
import { ChannelType, SupportMessageDirection } from '../../../domain.types/enums';
import { SupportInMessageMetadata } from '../../../domain.types/intermediate.types';
import { ChatMessageService } from '../../../database/typeorm/services/chat.message.service';
import { logger } from "../../../logger/logger";
import { SupportMessageService } from '../../../database/typeorm/services/support.message.service';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export default class SlackMessageConverter implements ISupportChannelMessageConverter {

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider
    ) { }

    public fromChannel = async (msgMetadata: SupportInMessageMetadata): Promise<SupportMessage> => {
        const incomingMessage = await this.getCommonData(msgMetadata);
        return incomingMessage;
    };

    public toChannel = async (outMessage: OutgoingSupportMessage): Promise<any> => {
        const slackChannel = this._tenantEnvProvider.getTenantEnvironmentVariable('SLACK_SUPPORT_CHANNEL_ID');
        const text = outMessage.Content;
        const message = {
            channel : slackChannel,
            text    : text,
        };
        return message;
    };

    private getCommonData = async (metadata: SupportInMessageMetadata): Promise<SupportMessage> => {

        if (!metadata?.RequestBody) {
            return null;
        }
        const challenge = metadata?.RequestBody?.challenge;
        if (!challenge) {
            logger.info('This is a test request!');
            return null;
        }

        const event = metadata?.RequestBody?.event;
        const messageThreadTimestamp = event?.thread_ts; // This is treated as support task id
        if (!event?.thread_ts) {
            // Currently slack only supports support use cases. Not user to bot use cases.
            logger.info('This is a parent message!');
            return null;
        }

        const messageTimeStamp = event?.ts; //Debug: Just checking for this

        // Proceed if this is a child message
        logger.info('This is a child message!');

        const supportChannelTaskId = messageThreadTimestamp; //This is support channel's message id
        const chatMessageService: ChatMessageService = metadata.Container.resolve(ChatMessageService);
        const supportMessageService: SupportMessageService = metadata.Container.resolve(SupportMessageService);
        const supportMessage = await supportMessageService.getBySupportChannelMessageId(supportChannelTaskId);
        const ticketId = supportMessage?.SupportTicketId;
        if (!ticketId) {
            logger.error('Ticket id not found!');
            return null;
        }
        const latestMessage = await chatMessageService.getLatestBySupportTicketId(supportChannelTaskId);
        if (!latestMessage) {
            logger.error('Parent message not found!');
            return null;
        }

        const userId = latestMessage.UserId;
        const tenantId = latestMessage.TenantId;
        const tenantName = latestMessage.TenantName;
        const userChannelType = latestMessage.Channel;

        const humanHandoff = latestMessage.HumanHandoff &&
            latestMessage.HumanHandoff.IsHandoff ? true : false;

        // Currently slack only supports support use cases. Not user to bot use cases.
        if (!humanHandoff) {
            logger.error('Human handoff not found!');
            return null;
        }

        const messageText = event?.text;

        //Retrieve message thread timestamp to use as task id

        // Retrieve the channel user id of the sender
        const senderChannelUserId = event?.user;
        if (!senderChannelUserId) {
            logger.error('Channel user id for sender not found!');
            return null;
        }

        // NOTE: Latest slack API documentation does not mention this.
        // Id it being deprecated?
        // Check this if this is a support agent
        var direction = event.client_msg_id ?
            SupportMessageDirection.FromSupport : SupportMessageDirection.ToSupport;

        // Alternatively find the direction by checking user ids
        const slackAgentUserId = this._tenantEnvProvider.getTenantEnvironmentVariable('SLACK_AGENT_USER_ID');
        const isSupportAgent = slackAgentUserId === senderChannelUserId ? true : false;
        var direction = isSupportAgent ? SupportMessageDirection.FromSupport : SupportMessageDirection.ToSupport;

        const messageTextLower = messageText?.toLowerCase();
        const isExitMessage = messageTextLower === 'exit' ? true : false;

        const incomingMessage: SupportMessage = {
            UserId                    : userId,
            TenantId                  : tenantId,
            SupportChannel            : ChannelType.Slack,
            UserChannel               : userChannelType,
            SupportChannelUserId      : senderChannelUserId,
            SupportChannelMessageId   : messageThreadTimestamp,
            SupportChannelAgentUserId : null,
            SupportTicketId           : ticketId,
            SupportChannelTaskId      : supportChannelTaskId,
            Direction                 : direction,
            ChatMessageId             : null,
            LanguageCode              : 'en',
            Content                   : messageText,
            TranslatedContent         : messageText,
            IsExitMessage             : isExitMessage,
            Timestamp                 : event.ts ?? new Date(),
        };
        return incomingMessage;
    };

}
