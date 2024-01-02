import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { uuid } from '../../types/miscellaneous/system.types';
import { SessionValidator } from './session.validator';
import { SessionService } from '../../database/typeorm/services/session.service';
import { SessionSearchFilters } from '../../types/domain.models/session.domain.models';

///////////////////////////////////////////////////////////////////////////////////////

export class SessionController {

    getById = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const service = container.resolve(SessionService);
            var id: uuid = request.params.id as uuid;
            const record = await service.getById(id);
            const message = 'Session retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            const validator: SessionValidator = new SessionValidator();
            var filters: SessionSearchFilters = await validator.validateSearchRequest(request);
            const container = request.container;
            const service = container.resolve(SessionService);
            const searchResults = await service.search(filters);
            const message = 'Session records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
