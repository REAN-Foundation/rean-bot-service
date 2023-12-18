/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import PQueue from 'p-queue';
import { logger } from '../../logger/logger';
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
import { UserCreateModel } from '../../domain.types/user.types';
import { registerUser } from '../../integrations/reancare/api.access/user';
import { CoreTypesStore } from '../../integrations/reancare/core.types.store';
import { Tenant } from '../../domain.types/tenant.types';
import { ChannelType } from '../../domain.types/enums';
import MessageHandlerRouter from '../../message.handlers/message.handler.router';
import MessageCache from '../../message.pipelines/cache/message.cache';
import { SerializableMessage } from '../../domain.types/message';

///////////////////////////////////////////////////////////////////////////////////////////

export default class MessageProcessQueue {

    private static _queue: PQueue = new PQueue({ concurrency: 4 });

    public static enqueue = async (messageBody: any): Promise<void> => {

        await this._queue.add(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.processMessage(messageBody);
        });

    };

    private static processMessage = async (messageBody: any): Promise<void> => {

        logger.info('MessageProcessQueue.processMessage');
        logger.info(JSON.stringify(messageBody, null, 2));

        const tenant: Tenant = {
            id   : tenantId,
            Name : tenantName,
        };
        const dbChatMessageService = container.resolve(ChatMessageService);

        //3. Convert incoming message to a standard format
        const messageConverter = channel.messageConverter();
        const incomingMessage: IncomingMessage = await messageConverter.fromChannel(request);

        //4. Get User and Session details from the database
        const channelUser = incomingMessage.ChannelUser;
        const channelUserId = incomingMessage.ChannelUser.ChannelUserId;
        const channelType = channel.channelType();
        var { session, botUser } = await this.getUserDetails(
            container,
            channelUserId,
            channelType,
            channelUser,
            tenant);

        //4. Process the message along the pre-processing pipeline
        const chatSession = sessionDtoToChatSession(session);
        const preprocessedMessage = await channel.processIncoming(incomingMessage, chatSession);

        //5. Store the incoming message in the database
        const inCreateModel: ChatMessageCreateModel = incomingMessageToCreateModel(preprocessedMessage);
        const storedIncomingMessage = await dbChatMessageService.create(inCreateModel);
        incomingMessage.id = storedIncomingMessage.id;

        //6. Update the message cache with the incoming message from user
        await MessageCache.addMessage(session.id, incomingMessage);

        //7. Send the message to the message handlers
        const primaryHandler = await MessageHandlerRouter.getPrimaryHandler(incomingMessage);
        const processible: ProcessibleMessage = await primaryHandler.handle(incomingMessage);

        //8. Handle feedback if needed
        if (processible.Feedback) {
            FeedbackHandler.handle(processible);
        }

        //9. Handle Human-Handoff if needed
        if (processible.HumanHandoff) {
            HumanHandoffHandler.handle(processible);
        }

        //10. Intent handling if an intent is detected
        if (processible.Intent) {
            processible = IntentHandler.handle(processible);
        }

        //11. Process outgoing message
        processible = await channel.processOutgoing(processible);

        //12. Store the outgoing message in the database
        const outCreateModel: ChatMessageCreateModel = outgoingMessageToCreateModel(processible);
        const storedOutgoingMessage = await dbChatMessageService.create(outCreateModel);

        //13. Update the message cache with the outgoing message from user
        await MessageCache.update(processible);

        //14. Convert outgoing message to channel specific format
        const outgoingMessageToChannel = await messageConverter.toChannel(processible);

        //15. Send the message to the channel
        const channelSendResponse = await channel.send(outgoingMessageToChannel);
        const respMessage = 'Chat message handled successfully!';

        // const msg = request.body;
        // const channelSendResponse = await channel.send(msg);

    };

}
