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

///////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class ChannelWebhookController {

    // //#region member variables and constructors

    // _validator: WebhookValidator = new WebhookValidator();

    // //#endregion

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

            //1. Convert incoming message to a standard format
            const incomingMessage = await messageConverter.fromChannel(request.body);
            //2. Process the message along the pre-processing pipeline
            const preprocessedMessage = await channel.processIncoming(incomingMessage);
            //3. Get User and Session details from the database
            const session = await dbSessionService.getByChannelUserId(incomingMessage.ChannelSpecifics.ChannelUserId);
            if (session === null) {
                ErrorHandler.throwNotFoundError(`Session not found for user ${incomingMessage.ChannelSpecifics.ChannelUserId}`);
            }
            const user = session.UserId;
            //4. Store the incoming message in the database
            const serializableMessage = await dbChatMessageService.getCreateModel(preprocessedMessage, user, session);
            const storedMessage = await dbChatMessageService.create(serializableMessage);
            //4. Update the message cache with the incoming message from user

            //4. Send the message to the message handlers

            //5. Handle feedback if needed

            //6. Handle Human-Handoff if needed

            //7. Process outgoing message
            const outgoingMessage = await channel.processOutgoing(storedMessage);

            //8. Store the outgoing message in the database
            const serializableOutgoingMessage = await dbChatMessageService.getCreateModel(outgoingMessage);
            const storedOutgoingMessage = await dbChatMessageService.create(serializableOutgoingMessage);
            //9. Send the message to the channel
            const sent = await channel.send(outgoingMessage);

            const respMessage = 'Chat message sent successfully!';

            const msg = request.body;
            const channelSendResponse = await channel.send(msg);

            const message = 'Chat message added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    receiveMessage = async (request: express.Request, response: express.Response) => {
        try {
            const channelName = request.params.channel;
            const tenantName = request.params.client;
            const uniqueToken = request.params.unique_token;


            const container = request.container;

            const channel = container.resolve(`${channelName}Channel`) as IChannel;
            const envProvider = container.resolve(TenantEnvironmentProvider);

            const msg = request.body;
            const response = await channel.receive(msg);

            const record = await this._service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add chat message!');
            }
            const message = 'Chat message added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await this._service.getById(id);
            const message = 'Chat message retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const id = await this._validator.requestParamAsUUID(request, 'id');
            var model: WebhookUpdateModel = await this._validator.validateUpdateRequest(request);
            const updatedRecord = await this._service.update(id, model);
            const message = 'Chat message updated successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            var filters: WebhookSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await this._service.search(filters);
            const message = 'Chat message records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const result = await this._service.delete(id);
            const message = 'Chat message deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
