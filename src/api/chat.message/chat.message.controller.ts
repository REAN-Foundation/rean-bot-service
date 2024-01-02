import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { uuid } from '../../types/miscellaneous/system.types';
import { ChatMessageService } from '../../database/typeorm/services/chat.message.service';
import {
    ChatMessageSearchFilters,
} from '../../types/domain.models/chat.message.domain.models';
import { ChannelType, MessageContentType, MessageDirection } from '../../types/enums';

///////////////////////////////////////////////////////////////////////////////////////

export class ChatMessageController {

    getById = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const service = container.resolve(ChatMessageService);
            var id: uuid = request.params.id;
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

            var filters: ChatMessageSearchFilters = {
                TenantId       : request.query.tenantId ? request.query.tenantId as uuid : null,
                UserId         : request.query.userId ? request.query.tenantId as uuid : null,
                ChannelUserId  : request.query.channelUserId ? request.query.tenantId as uuid : null,
                SessionId      : request.query.sessionId ? request.query.tenantId as uuid : null,
                ChannelType    : request.query.channelType ? request.query.channelType as ChannelType : null,
                TimestampAfter : request.query.after ? new Date(request.query.after as string) : null,
                Direction      : request.query.direction ? request.query.direction as MessageDirection : null,
                ContentType    : request.query.contentType ? request.query.contentType as MessageContentType : null,
            };
            const searchResults = await service.search(filters);
            const message = 'Chat message records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
