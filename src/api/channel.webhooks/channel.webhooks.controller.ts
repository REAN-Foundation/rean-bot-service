import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { ErrorHandler } from '../../common/handlers/error.handler';
import { uuid } from '../../domain.types/miscellaneous/system.types';
import { WebhookValidator } from './channel.webhooks.validator';
import { WebhookService } from '../../database/typeorm/services/chat.message.service';
import {
    WebhookCreateModel,
    WebhookSearchFilters,
    WebhookUpdateModel,
} from '../../domain.types/chat.message.types';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';
import { IChannel } from '../../channels/channel.interface';

///////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class ChannelWebhookController {

    // //#region member variables and constructors

    // _validator: WebhookValidator = new WebhookValidator();

    // //#endregion

    sendMessage = async (request: express.Request, response: express.Response) => {
        try {
            const channelName = request.params.channel;
            const tenantName = request.params.client;
            const uniqueToken = request.params.unique_token;

            const container = request.container;
            const channel = container.resolve(`${channelName}Channel`) as IChannel;
            const msg = request.body;
            const response = await channel.send(msg);

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