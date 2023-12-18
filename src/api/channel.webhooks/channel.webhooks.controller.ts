/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { ErrorHandler } from '../../common/handlers/error.handler';
import { uuid } from '../../domain.types/miscellaneous/system.types';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { IChannel } from '../../channels/channel.interface';
import { ChatMessageService } from '../../database/typeorm/services/chat.message.service';
import { SessionService } from '../../database/typeorm/services/session.service';
import { UserService } from '../../database/typeorm/services/user.service';
import { ChatMessageCreateModel, incomingMessageToCreateModel, outgoingMessageToCreateModel } from '../../domain.types/chat.message.types';
import { ChannelUser, IncomingMessage, OutgoingMessage, ProcessibleMessage } from '../../domain.types/message';
import { SessionCreateModel, sessionDtoToChatSession } from '../../domain.types/session.types';
import { logger } from '../../logger/logger';
import { UserCreateModel } from '../../domain.types/user.types';
import { registerUser } from '../../integrations/reancare/api.access/user';
import { CoreTypesStore } from '../../integrations/reancare/core.types.store';
import { Tenant } from '../../domain.types/tenant.types';
import { ChannelType } from '../../domain.types/enums';
import MessageHandlerRouter from '../../message.handlers/message.handler.router';
import MessageCache from '../../message.pipelines/cache/message.cache';
import { SerializableMessage } from '../../domain.types/message';
import MessageProcessQueue from '../../message.pipelines/process.queue/message.process.queue';

///////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class ChannelWebhookController {

    receiveMessage = async (request: express.Request, response: express.Response) => {
        try {
            const channelName = request.params.channel;
            const tenantName = request.params.client;
            const container = request.container;

            //Register tenant name as a dependency
            container.register("TenantName", { useValue: tenantName });
            container.register("ChannelName", { useValue: channelName });

            const envProvider = container.resolve(TenantEnvironmentProvider);
            const tenantId = envProvider.getTenantEnvironmentVariable('TENANT_ID');
            const channel = container.resolve(`IChannel`) as IChannel;

            //1. Authenticate with channel
            await channel.webhookAuthenticator().authenticate(request);

            //2. Check if this message is related to acknowledgement of a message sent
            const ack = await channel.shouldAcknowledge(request);
            if (ack?.ShouldAcknowledge === true) {
                return ResponseHandler.success(request, response, ack.Message, ack.StatusCode);
            }

            const messageBody = {
                container,
                requestBody : request.body,
                channel,
                channelName,
                tenantName,
                tenantId,
            };

            MessageProcessQueue.enqueue(messageBody);

            return ResponseHandler.success(request, response, 'Message received successfully!', 200, null);

        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    sendMessage = async (request: express.Request, response: express.Response) => {
        try {
            const uniqueToken = request.params.unique_token;

            const channelName = request.params.channel;
            const tenantName = request.params.client;
            const container = request.container;

            //Register tenant name as a dependency
            container.register("TenantName", { useValue: tenantName });
            container.register("ChannelName", { useValue: channelName });

            const channel = container.resolve(`IChannel`) as IChannel;
            const envProvider = container.resolve(TenantEnvironmentProvider);
            const messageConverter = channel.messageConverter();
            const dbChatMessageService = container.resolve(ChatMessageService);
            const dbSessionService = container.resolve(SessionService);
            const dbUserService = container.resolve(UserService);

            const respMessage = 'Chat message sent successfully!';

            return ResponseHandler.success(request, response, respMessage, 200, null);

        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    private getUserDetails = async (
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
