import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { ErrorHandler } from '../../common/handlers/error.handler';
import { uuid } from '../../types/miscellaneous/system.types';
import { UserValidator } from './user.validator';
import { UserService } from '../../database/typeorm/services/user.service';
import { UserCreateModel, UserSearchFilters, UserUpdateModel } from '../../types/domain.models/user.domain.models';

///////////////////////////////////////////////////////////////////////////////////////

export class UserController {

    //#region member variables and constructors

    _validator: UserValidator = new UserValidator();

    //#endregion

    create = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const service = container.resolve(UserService);
            var model: UserCreateModel = await this._validator.validateCreateRequest(request);
            const record = await service.create(model);
            if (record === null) {
                ErrorHandler.throwInternalServerError('Unable to add user!');
            }
            const message = 'User added successfully!';
            return ResponseHandler.success(request, response, message, 201, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getById = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const service = container.resolve(UserService);
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const record = await service.getById(id);
            const message = 'User retrieved successfully!';
            return ResponseHandler.success(request, response, message, 200, record);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    update = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const service = container.resolve(UserService);
            const id = await this._validator.requestParamAsUUID(request, 'id');
            var model: UserUpdateModel = await this._validator.validateUpdateRequest(request);
            const updatedRecord = await service.update(id, model);
            const message = 'User updated successfully!';
            ResponseHandler.success(request, response, message, 200, updatedRecord);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    search = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const service = container.resolve(UserService);
            var filters: UserSearchFilters = await this._validator.validateSearchRequest(request);
            const searchResults = await service.search(filters);
            const message = 'User records retrieved successfully!';
            ResponseHandler.success(request, response, message, 200, searchResults);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    delete = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            const container = request.container;
            const service = container.resolve(UserService);
            var id: uuid = await this._validator.requestParamAsUUID(request, 'id');
            const result = await service.delete(id);
            const message = 'User deleted successfully!';
            ResponseHandler.success(request, response, message, 200, result);
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
