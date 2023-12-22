import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { uuid } from '../../domain.types/miscellaneous/system.types';
import { ChatMessageService } from '../../database/typeorm/services/chat.message.service';
import {
    ChatMessageSearchFilters,
} from '../../domain.types/chat.message.types';
import { ChatMessageValidator } from '../channel.webhooks/channel.webhooks.validator';

///////////////////////////////////////////////////////////////////////////////////////

export class ChatMessageController {

    //#region member variables and constructors

    _validator: ChatMessageValidator = new ChatMessageValidator();

    //#endregion

    getById = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const service = container.resolve(ChatMessageService);
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await service.getById(id);
            const message = 'Chat message retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const service = container.resolve(ChatMessageService);
            var filters: ChatMessageSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await service.search(filters);
            const message = 'Chat message records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
