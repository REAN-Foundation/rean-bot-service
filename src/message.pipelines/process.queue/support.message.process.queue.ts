/* eslint-disable @typescript-eslint/no-unused-vars */
import PQueue from 'p-queue';
import { logger } from '../../logger/logger';
import { uuid } from '../../types/miscellaneous/system.types';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { IChannel } from '../../channels/channel.interface';
import { ChatMessageService } from '../../database/typeorm/services/chat.message.service';
import { SessionService } from '../../database/typeorm/services/session.service';
import { UserService } from '../../database/typeorm/services/user.service';
import { ChatMessageCreateModel, incomingMessageToCreateModel } from '../../types/domain.models/chat.message.domain.models';
import { ChannelUser, IncomingMessage,  ProcessableMessage } from '../../types/common.types';
import { SessionCreateModel, sessionDtoToChatSession } from '../../types/domain.models/session.domain.models';
import { UserCreateModel } from '../../types/domain.models/user.domain.models';
import { registerUser } from '../../integrations/reancare/api.access/user';
import { CoreTypesStore } from '../../integrations/reancare/core.types.store';
import { Tenant } from '../../types/common.types';
import { ChannelType } from '../../types/enums';
import MessageHandlerRouter from '../../message.handlers/message.handler.router';
import MessageCache from '../cache/message.cache';
import { OutMessageProcessor } from './outmessage.processor';
import { InMessageMetadata } from '../../types/intermediate.types';
import { FeedbackHandler } from '../../message.handlers/feedback/feedback.handler';
import { HumanHandoffHandler } from '../../message.handlers/human.handoff/human.handoff.handler';
import { SupportMessageService } from '../../database/typeorm/services/support.message.service';

///////////////////////////////////////////////////////////////////////////////////////////

export default class SupportMessageProcessQueue {

    private static _queue: PQueue = new PQueue({ concurrency: 4 });

    public static enqueue = async (messageBody: any): Promise<void> => {

        await this._queue.add(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.processMessage(messageBody);
        });

    };

    private static processMessage = async (messageBody: InMessageMetadata): Promise<void> => {

        logger.info('SupportMessageProcessQueue.processMessage');
        logger.info(JSON.stringify(messageBody, null, 2));

        const container   = messageBody.Container;
        const body        = messageBody.RequestBody;
        const channel     = messageBody.Channel as IChannel;
        const channelName = messageBody.ChannelName;
        const tenantName  = messageBody.TenantName;
        const tenantId    = messageBody.TenantId as uuid;

        const tenant: Tenant = {
            id   : tenantId,
            Name : tenantName,
        };
        const dbChatMessageService = container.resolve(ChatMessageService);
        const dbSupportMessageService = container.resolve(SupportMessageService);

        //1. Convert incoming message to a standard format
        const messageConverter = channel.messageConverter();
        const incomingMessage: IncomingMessage = await messageConverter.fromChannel(messageBody);
        incomingMessage.TenantId = tenantId;
        incomingMessage.TenantName = tenantName;

        //2. Get User and Session details from the database
        const channelUser = incomingMessage.ChannelUser;
        const channelUserId = incomingMessage.ChannelUser.ChannelUserId;
        const channelType = channel.channelType();
        var { session, botUser } = await this.getUserDetails(
            container,
            channelUserId,
            channelType,
            channelUser,
            tenant);

        //3. Process the message along the pre-processing pipeline
        const chatSession = sessionDtoToChatSession(session);
        const preprocessedMessage = await channel.processIncoming(incomingMessage, chatSession);

        //4. Store the incoming message in the database
        const inCreateModel: ChatMessageCreateModel = incomingMessageToCreateModel(preprocessedMessage);
        const storedIncomingMessage = await dbChatMessageService.create(inCreateModel);
        incomingMessage.id = storedIncomingMessage.id;

        //5. Update the message cache with the incoming message from user
        await MessageCache.addMessage(session.id, incomingMessage);

        //6. Send the message to the message handlers
        const selected = await MessageHandlerRouter.getHandlers(incomingMessage);
        const messageHandlers = selected.Handlers;
        var processable: ProcessableMessage = selected.Message;

        //7. If feedback, handle it right away
        if (processable.Feedback) {
            const feedbackHandler = container.resolve('FeedbackHandler') as FeedbackHandler;
            await feedbackHandler.handle(processable);
            return;
        }

        //8. If Human-Handoff, continue on it right away
        if (processable.HumanHandoff) {
            const humanHandoffHandler = container.resolve('HumanHandoffHandler') as HumanHandoffHandler;
            await humanHandoffHandler.handle(processable);
            return;
        }

        //9. Process the message through all identified message handlers
        const processedMessages: ProcessableMessage[] = [];
        for await (const handler of messageHandlers) {
            const outProcessable = await handler.handle(processable);
            processedMessages.push(outProcessable);
        }

        //10. Process outgoing messages through the post-processing pipeline
        const meta = {
            container,
            channel,
            channelName,
            tenantName,
            tenantId,
            session,
            botUser,
        };
        const results = [];
        const outProcessor: OutMessageProcessor = container.resolve('OutMessageProcessor');
        for await (const outProcessable of processedMessages) {
            const result = await outProcessor.process(meta, outProcessable);
            results.push(result);
        }

        logger.info('MessageProcessQueue.processMessage completed');

    };

    private static getUserDetails = async (
        container,
        channelUserId: string,
        channelType: ChannelType,
        channelUser: ChannelUser,
        tenant: Tenant) => {

        const dbSessionService = container.resolve(SessionService);
        const dbUserService = container.resolve(UserService);

        var session = await dbSessionService.getByChannelUserId(channelUserId);
        var botUser = null;
        if (session === null) {

            logger.info(`Session not found for user ${channelUserId}. Creating a new session with channel ${channelType}...`);

            botUser = await dbUserService.getByChannelUserId(channelUserId);
            if (botUser === null) {
                logger.info(`User not found for channel user id ${channelUserId}`);

                //Currently only supporting patient roles.
                //In future, this should be made flexible enough to support other roles.
                const userRole = (await CoreTypesStore.getPersonRoles()).find(x => x.RoleName === 'Patient');

                // First register the user to rean-care-service
                const coreUser = await registerUser(
                    tenant.id,      // Client/Tenant identifier in REAN ecosystem
                    channelUserId,  // User identifier in the channel
                    userRole.id,    // Role identifier in REAN ecosystem
                    channelUser.Phone,
                    channelUser.FirstName,
                    channelUser.LastName
                );
                if (coreUser) {
                    // Then create the user in the bot database
                    const userCreateModel: UserCreateModel = {
                        id        : coreUser.id,
                        TenantId  : tenant.id,
                        FirstName : channelUser.FirstName,
                        LastName  : channelUser.LastName,
                        Email     : channelUser.Email,
                        Phone     : channelUser.Phone,
                    };
                    botUser = await dbUserService.create(userCreateModel);
                }
                if (botUser === null) {
                    throw new Error(`Unable to create bot user for channel user id ${channelUserId}`);
                }
                // Then create the session in the bot database
                const sessionCreateModel: SessionCreateModel = {
                    UserId        : botUser.id,
                    Channel       : channelType,
                    ChannelUserId : channelUserId,
                    TenantId      : tenant.id,
                    TenantName    : tenant.Name,
                };
                session = await dbSessionService.create(sessionCreateModel);
                if (session === null) {
                    throw new Error(`Unable to create session for channel user id ${channelUserId}`);
                }
            }
        }
        else {
            session = await dbSessionService.update(session.id, { LastMessageDate: new Date() });
            botUser = await dbUserService.getById(session.UserId);
        }
        return { session, botUser };
    };

}
