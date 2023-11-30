import express from 'express';
import joi from 'joi';
import { ErrorHandler } from '../../common/handlers/error.handler';
import BaseValidator from '../base.validator';
import { TypeUtils } from '../../common/utilities/type.utils';
import { SessionCreateModel, SessionUpdateModel, SessionSearchFilters } from '../../domain.types/session.types';

///////////////////////////////////////////////////////////////////////////////////////////////

export class SessionValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request): Promise<SessionCreateModel> => {
        try {
            const schema = joi.object({
                UserId   : joi.number().integer().required(),
                Platform : joi.string().email().required(),
            });
            await schema.validateAsync(request.body);
            const model: SessionCreateModel = {
                UserId   : request.body.UserId ? request.body.UserId : null,
                Platform : request.body.Platform ? request.body.Platform : 'WhatsApp',
            };
            return model;
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<SessionUpdateModel> => {
        try {
            const schema = joi.object({
                UserId   : joi.number().integer().optional(),
                Platform : joi.string().email().optional(),
            });
            await schema.validateAsync(request.body);
            var model: SessionUpdateModel = {};

            if (TypeUtils.hasProperty(request.body, 'UserId')) {
                model.UserId = request.body.UserId;
            }
            if (TypeUtils.hasProperty(request.body, 'Platform')) {
                model.Platform = request.body.Platform;
            }

            return model;
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request): Promise<SessionSearchFilters> => {
        try {
            const schema = joi.object({
                userId          : joi.number().integer().optional(),
                platform        : joi.string().email().optional(),
                lastMessageDate : joi.date().iso().optional(),
            });
            await schema.validateAsync(request.query);
            const filters = this.getSearchFilters(request.query);
            const baseFilters = await this.validateBaseSearchFilters(request);
            return {
                ...baseFilters,
                ...filters,
            };
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    private getSearchFilters = (query): SessionSearchFilters => {
        var filters = {};

        var userId = query.userId ? query.userId : null;
        if (userId != null) {
            filters['UserId'] = userId;
        }
        var platform = query.platform ? query.platform : null;
        if (platform != null) {
            filters['Platform'] = platform;
        }
        var lastMessageDate = query.lastMessageDate ? query.lastMessageDate : null;
        if (lastMessageDate != null) {
            filters['LastMessageDate'] = lastMessageDate;
        }

        return filters;
    };

}
