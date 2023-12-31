/* eslint-disable @typescript-eslint/no-unused-vars */
import { scoped, Lifecycle } from 'tsyringe';
import { ISupportChannelMessageConverter } from '../../support.channels/support.channel.message.converter.interface';
import { OutgoingSupportMessage, SupportMessage } from '../../../domain.types/message';
import { SupportMessageDirection } from '../../../domain.types/enums';
import { SupportInMessageMetadata } from '../../../domain.types/intermediate.data.types';
import { ChatMessageService } from '../../../database/typeorm/services/chat.message.service';
import { logger } from "../../../logger/logger";

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export default class SlackMessageConverter implements ISupportChannelMessageConverter {

    public fromChannel = async (msgMetadata: SupportInMessageMetadata): Promise<SupportMessage> => {
        const incomingMessage = await this.getCommonData(msgMetadata);
        return incomingMessage;
    };

    public toChannel = async (outMessage: OutgoingSupportMessage): Promise<any> => {
        const convertedMessage = await contentConverter.convert(outMessage);
        return convertedMessage;
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

        // Proceed if this is a child message
        logger.info('This is a child message!');

        const supportChannelTaskId = messageThreadTimestamp;
        const chatMessageService: ChatMessageService = metadata.Container.resolve(ChatMessageService);
        const parentMessage = await chatMessageService.getBySupportTicketId(supportChannelTaskId);
        if (!parentMessage) {
            logger.error('Parent message not found!');
            return null;
        }

        const latestMessage = await chatMessageService.getLatestBySupportTicketId(supportChannelTaskId);

        const humanHandoff = parentMessage.HumanHandoff &&
            parentMessage.HumanHandoff.IsHandoff ? true : false;

        // Currently slack only supports support use cases. Not user to bot use cases.
        if (!humanHandoff) {
            logger.error('Human handoff not found!');
            return null;
        }

        const messageText = event?.text;

        //Retrieve message thread timestamp to use as task id

        const slackChannelUserId = event?.user ?? parentMessage.SupportChannel?.SupportTaskId;
        if (!slackChannelUserId) {
            logger.error('Channel user id not found!');
            return null;
        }

        const direction = event.client_msg_id ?
            SupportMessageDirection.FromSupport : SupportMessageDirection.ToSupport;

        const userChannelType = parentMessage.Channel;
        const channelUserId = parentMessage.ChannelUserId;
        const messageTextLower = messageText?.toLowerCase();
        const isExitMessage = messageTextLower === 'exit' ? true : false;
        const userId = parentMessage.UserId;
        const tenantId = parentMessage.TenantId;
        const tenantName = parentMessage.TenantName;
        const channelMessageId = parentMessage?.ChannelSpecifics?.ReferenceMessageId;

        const incomingMessage: SupportMessage = {
            UserId         : userId,
            TenantId       : tenantId,
            TenantName     : tenantName,
            SupportChannel : {
                SupportChannelType      : ChannelType.Slack,
                MessageDirection        : direction,
                SupportChannelUserId    : slackChannelUserId,
                SupportChannelAgentId   : null,
                ChatMessageId           : null,
                TicketId                : ticketId,
                SupportChannelTaskId    : supportChannelTaskId,
                SupportChannelMessageId : supportChannelTaskId,
                IsExitMessage           : isExitMessage,
            },
        };
        return incomingMessage;
    };

}
