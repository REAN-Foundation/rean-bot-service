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
import { IncomingMessage, OutgoingMessage } from '../../domain.types/message';
import { sessionDtoToChatSession } from '../../domain.types/session.types';

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

            const channel = container.resolve(`IChannel`) as IChannel;
            const envProvider = container.resolve(TenantEnvironmentProvider);
            const messageConverter = channel.messageConverter();
            const dbChatMessageService = container.resolve(ChatMessageService);
            const dbSessionService = container.resolve(SessionService);
            const dbUserService = container.resolve(UserService);

            //1. Authenticate with channel
            const authenticated = await channel.webhookAuthenticator().authenticate(request);

            //2. Check if this message is related to acknowledgement of a message sent
            const ack = await channel.shouldAcknowledge(request);
            if (ack?.ShouldAcknowledge === true) {
                return ResponseHandler.success(request, response, ack.Message, ack.StatusCode);
            }

            //3. Convert incoming message to a standard format
            const incomingMessage: IncomingMessage = await messageConverter.fromChannel(request.body);

            //4. Get User and Session details from the database
            const session = await dbSessionService.getByChannelUserId(incomingMessage.ChannelUserId);
            if (session === null) {
                ErrorHandler.throwNotFoundError(`Session not found for user ${incomingMessage.ChannelSpecifics.ChannelUserId}`);
            }
            const user = session.UserId;

            //4. Process the message along the pre-processing pipeline
            const chatSession = sessionDtoToChatSession(session);
            const preprocessedMessage = await channel.processIncoming(incomingMessage, chatSession);

            //5. Store the incoming message in the database
            const inCreateModel: ChatMessageCreateModel = incomingMessageToCreateModel(preprocessedMessage);
            const storedIncomingMessage = await dbChatMessageService.create(inCreateModel);
            incomingMessage.id = storedIncomingMessage.id;

            //6. Update the message cache with the incoming message from user
            await MessageCache.update(incomingMessage);

            //7. Send the message to the message handlers
            var outgoingMessage: OutgoingMessage = await MessageHandler.handle(incomingMessage);

            //8. Handle feedback if needed
            if (outgoingMessage.Feedback) {
                FeedbackHandler.handle(outgoingMessage);
            }

            //9. Handle Human-Handoff if needed
            if (outgoingMessage.HumanHandoff) {
                HumanHandoffHandler.handle(outgoingMessage);
            }

            //10. Process outgoing message
            outgoingMessage = await channel.processOutgoing(outgoingMessage);

            //11. Store the outgoing message in the database
            const outCreateModel: ChatMessageCreateModel = outgoingMessageToCreateModel(outgoingMessage);
            const storedOutgoingMessage = await dbChatMessageService.create(outCreateModel);

            //12. Update the message cache with the outgoing message from user
            await MessageCache.update(outgoingMessage);

            //13. Convert outgoing message to channel specific format
            const outgoingMessageToChannel = await messageConverter.toChannel(outgoingMessage);

            //14. Send the message to the channel
            const channelSendResponse = await channel.send(outgoingMessageToChannel);
            const respMessage = 'Chat message handled successfully!';

            // const msg = request.body;
            // const channelSendResponse = await channel.send(msg);

            return ResponseHandler.success(request, response, respMessage, 200, null);

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

}
