import express from 'express';
import joi from 'joi';
import { ErrorHandler } from '../../common/handlers/error.handler';
import BaseValidator from '../base.validator';
import {
    ChatMessageSearchFilters,
} from '../../domain.types/chat.message.types';
import { MessageDirection, MessageContentType, UserFeedbackType } from '../../domain.types/enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class ChatMessageValidator extends BaseValidator {


    public validateSearchRequest = async (request: express.Request): Promise<ChatMessageSearchFilters> => {
        try {
            const schema = joi.object({
                tenantId                  : joi.number().integer().optional(),
                userId                    : joi.number().integer().optional(),
                sessionId                 : joi.number().integer().optional(),
                platform                  : joi.string().max(256).min(1).optional(),
                languageCode              : joi.string().max(8).min(1).optional(),
                name                      : joi.string().max(256).min(1).optional(),
                messageContent            : joi.any().optional(),
                imageContent              : joi.any().optional(),
                imageUrl                  : joi.any().optional(),
                platformUserId            : joi.string().max(256).min(1).optional(),
                platformMessageId         : joi.string().max(256).min(1).optional(),
                platformResponseMessageId : joi.string().max(256).min(1).optional(),
                sentTimestamp             : joi.date().iso().optional(),
                deliveredTimestamp        : joi.date().iso().optional(),
                readTimestamp             : joi.date().iso().optional(),
                direction                 : joi
                    .string()
                    .valid(...Object.values(MessageDirection))
                    .optional(),
                contentType : joi
                    .string()
                    .valid(...Object.values(MessageContentType))
                    .optional(),
                assessmentId     : joi.number().integer().optional(),
                assessmentNodeId : joi.number().integer().optional(),
                feedbackType     : joi
                    .string()
                    .valid(...Object.values(UserFeedbackType))
                    .optional(),
                identifiedIntent : joi.string().max(256).min(1).optional(),
                humanHandoff     : joi.boolean().optional(),
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

    private getSearchFilters = (query): ChatMessageSearchFilters => {
        var filters = {};

        var tenantId = query.tenantId ? query.tenantId : null;
        if (tenantId != null) {
            filters['TenantId'] = tenantId;
        }
        var userId = query.userId ? query.userId : null;
        if (userId != null) {
            filters['UserId'] = userId;
        }
        var sessionId = query.sessionId ? query.sessionId : null;
        if (sessionId != null) {
            filters['SessionId'] = sessionId;
        }
        var platform = query.platform ? query.platform : null;
        if (platform != null) {
            filters['Platform'] = platform;
        }
        var languageCode = query.languageCode ? query.languageCode : null;
        if (languageCode != null) {
            filters['LanguageCode'] = languageCode;
        }
        var name = query.name ? query.name : null;
        if (name != null) {
            filters['Name'] = name;
        }
        var messageContent = query.messageContent ? query.messageContent : null;
        if (messageContent != null) {
            filters['MessageContent'] = messageContent;
        }
        var imageContent = query.imageContent ? query.imageContent : null;
        if (imageContent != null) {
            filters['ImageContent'] = imageContent;
        }
        var imageUrl = query.imageUrl ? query.imageUrl : null;
        if (imageUrl != null) {
            filters['ImageUrl'] = imageUrl;
        }
        var platformUserId = query.platformUserId ? query.platformUserId : null;
        if (platformUserId != null) {
            filters['PlatformUserId'] = platformUserId;
        }
        var platformMessageId = query.platformMessageId ? query.platformMessageId : null;
        if (platformMessageId != null) {
            filters['PlatformMessageId'] = platformMessageId;
        }
        var platformResponseMessageId = query.platformResponseMessageId ? query.platformResponseMessageId : null;
        if (platformResponseMessageId != null) {
            filters['PlatformResponseMessageId'] = platformResponseMessageId;
        }
        var sentTimestamp = query.sentTimestamp ? query.sentTimestamp : null;
        if (sentTimestamp != null) {
            filters['SentTimestamp'] = sentTimestamp;
        }
        var deliveredTimestamp = query.deliveredTimestamp ? query.deliveredTimestamp : null;
        if (deliveredTimestamp != null) {
            filters['DeliveredTimestamp'] = deliveredTimestamp;
        }
        var readTimestamp = query.readTimestamp ? query.readTimestamp : null;
        if (readTimestamp != null) {
            filters['ReadTimestamp'] = readTimestamp;
        }
        var direction = query.direction ? query.direction : null;
        if (direction != null) {
            filters['Direction'] = direction;
        }
        var contentType = query.contentType ? query.contentType : null;
        if (contentType != null) {
            filters['ContentType'] = contentType;
        }
        var assessmentId = query.assessmentId ? query.assessmentId : null;
        if (assessmentId != null) {
            filters['AssessmentId'] = assessmentId;
        }
        var assessmentNodeId = query.assessmentNodeId ? query.assessmentNodeId : null;
        if (assessmentNodeId != null) {
            filters['AssessmentNodeId'] = assessmentNodeId;
        }
        var feedbackType = query.feedbackType ? query.feedbackType : null;
        if (feedbackType != null) {
            filters['FeedbackType'] = feedbackType;
        }
        var identifiedIntent = query.identifiedIntent ? query.identifiedIntent : null;
        if (identifiedIntent != null) {
            filters['IdentifiedIntent'] = identifiedIntent;
        }
        var humanHandoff = query.humanHandoff ? query.humanHandoff : null;
        if (humanHandoff != null) {
            filters['HumanHandoff'] = humanHandoff;
        }

        return filters;
    };

}
