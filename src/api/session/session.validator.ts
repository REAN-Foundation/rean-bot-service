import express from 'express';
import joi from 'joi';
import { ErrorHandler } from '../../common/handlers/error.handler';
import BaseValidator from '../base.validator';
import { SessionSearchFilters } from '../../types/domain.models/session.domain.models';

///////////////////////////////////////////////////////////////////////////////////////////////

export class SessionValidator extends BaseValidator {

    public validateSearchRequest = async (request: express.Request): Promise<SessionSearchFilters> => {
        try {
            const schema = joi.object({
                userId          : joi.string().uuid().optional(),
                channelType     : joi.string().optional(),
                lastMessageDate : joi.date().optional(),
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
        var channelType = query.channelType ? query.channelType : null;
        if (channelType != null) {
            filters['ChannelType'] = channelType;
        }
        var lastMessageDate = query.lastMessageDate ? query.lastMessageDate : null;
        if (lastMessageDate != null) {
            filters['LastMessageDate'] = lastMessageDate;
        }

        return filters;
    };

}
