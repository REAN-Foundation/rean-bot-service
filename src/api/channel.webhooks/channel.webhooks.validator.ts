import express from 'express';
import joi from 'joi';
import { ErrorHandler } from '../../common/handlers/error.handler';
import BaseValidator from '../base.validator';
import { TypeUtils } from '../../common/utilities/type.utils';
import {
    ChatMessageCreateModel,
    ChatMessageUpdateModel,
    ChatMessageSearchFilters,
} from '../../domain.types/chat.message.types';
import { MessageDirection, MessageContentType, UserFeedbackType } from '../../domain.types/enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class ChatMessageValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request): Promise<ChatMessageCreateModel> => {
        try {
            const schema = joi.object({
                TenantId                  : joi.number().integer().optional(),
                UserId                    : joi.number().integer().required(),
                SessionId                 : joi.number().integer().required(),
                Platform                  : joi.string().max(256).min(1).optional(),
                LanguageCode              : joi.string().max(8).min(1).optional(),
                Name                      : joi.string().max(256).min(1).optional(),
                MessageContent            : joi.any().required(),
                ImageContent              : joi.any().optional(),
                ImageUrl                  : joi.any().optional(),
                PlatformUserId            : joi.string().max(256).min(1).optional(),
                PlatformMessageId         : joi.string().max(256).min(1).optional(),
                PlatformResponseMessageId : joi.string().max(256).min(1).optional(),
                Direction                 : joi
                    .string()
                    .valid(...Object.values(MessageDirection))
                    .optional(),
                ContentType : joi
                    .string()
                    .valid(...Object.values(MessageContentType))
                    .optional(),
                AssessmentId     : joi.number().integer().optional(),
                AssessmentNodeId : joi.number().integer().required(),
                FeedbackType     : joi
                    .string()
                    .valid(...Object.values(UserFeedbackType))
                    .optional(),
                IdentifiedIntent : joi.string().max(256).min(1).optional(),
            });
            await schema.validateAsync(request.body);
            const model: ChatMessageCreateModel = {
                TenantId                  : request.body.TenantId ? request.body.TenantId : null,
                UserId                    : request.body.UserId ? request.body.UserId : null,
                SessionId                 : request.body.SessionId ? request.body.SessionId : null,
                Platform                  : request.body.Platform ? request.body.Platform : null,
                LanguageCode              : request.body.LanguageCode ? request.body.LanguageCode : 'en-US',
                Name                      : request.body.Name ? request.body.Name : null,
                MessageContent            : request.body.MessageContent ? request.body.MessageContent : null,
                ImageContent              : request.body.ImageContent ? request.body.ImageContent : null,
                ImageUrl                  : request.body.ImageUrl ? request.body.ImageUrl : null,
                PlatformUserId            : request.body.PlatformUserId ? request.body.PlatformUserId : null,
                PlatformMessageId         : request.body.PlatformMessageId ? request.body.PlatformMessageId : null,
                PlatformResponseMessageId : request.body.PlatformResponseMessageId
                    ? request.body.PlatformResponseMessageId
                    : null,
                Direction        : request.body.Direction ? request.body.Direction : 'In',
                ContentType      : request.body.ContentType ? request.body.ContentType : 'Text',
                AssessmentId     : request.body.AssessmentId ? request.body.AssessmentId : null,
                AssessmentNodeId : request.body.AssessmentNodeId ? request.body.AssessmentNodeId : null,
                FeedbackType     : request.body.FeedbackType ? request.body.FeedbackType : 'None',
                IdentifiedIntent : request.body.IdentifiedIntent ? request.body.IdentifiedIntent : null,
            };
            return model;
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<ChatMessageUpdateModel> => {
        try {
            const schema = joi.object({
                TenantId                  : joi.number().integer().optional(),
                UserId                    : joi.number().integer().optional(),
                SessionId                 : joi.number().integer().optional(),
                Platform                  : joi.string().max(256).min(1).optional(),
                LanguageCode              : joi.string().max(8).min(1).optional(),
                Name                      : joi.string().max(256).min(1).optional(),
                MessageContent            : joi.any().optional(),
                ImageContent              : joi.any().optional(),
                ImageUrl                  : joi.any().optional(),
                PlatformUserId            : joi.string().max(256).min(1).optional(),
                PlatformMessageId         : joi.string().max(256).min(1).optional(),
                PlatformResponseMessageId : joi.string().max(256).min(1).optional(),
                Direction                 : joi
                    .string()
                    .valid(...Object.values(MessageDirection))
                    .optional(),
                ContentType : joi
                    .string()
                    .valid(...Object.values(MessageContentType))
                    .optional(),
                AssessmentId     : joi.number().integer().optional(),
                AssessmentNodeId : joi.number().integer().optional(),
                FeedbackType     : joi
                    .string()
                    .valid(...Object.values(UserFeedbackType))
                    .optional(),
                IdentifiedIntent : joi.string().max(256).min(1).optional(),
            });
            await schema.validateAsync(request.body);
            var model: ChatMessageUpdateModel = {};

            if (TypeUtils.hasProperty(request.body, 'TenantId')) {
                model.TenantId = request.body.TenantId;
            }
            if (TypeUtils.hasProperty(request.body, 'UserId')) {
                model.UserId = request.body.UserId;
            }
            if (TypeUtils.hasProperty(request.body, 'SessionId')) {
                model.SessionId = request.body.SessionId;
            }
            if (TypeUtils.hasProperty(request.body, 'Platform')) {
                model.Platform = request.body.Platform;
            }
            if (TypeUtils.hasProperty(request.body, 'LanguageCode')) {
                model.LanguageCode = request.body.LanguageCode;
            }
            if (TypeUtils.hasProperty(request.body, 'Name')) {
                model.Name = request.body.Name;
            }
            if (TypeUtils.hasProperty(request.body, 'MessageContent')) {
                model.MessageContent = request.body.MessageContent;
            }
            if (TypeUtils.hasProperty(request.body, 'ImageContent')) {
                model.ImageContent = request.body.ImageContent;
            }
            if (TypeUtils.hasProperty(request.body, 'ImageUrl')) {
                model.ImageUrl = request.body.ImageUrl;
            }
            if (TypeUtils.hasProperty(request.body, 'PlatformUserId')) {
                model.PlatformUserId = request.body.PlatformUserId;
            }
            if (TypeUtils.hasProperty(request.body, 'PlatformMessageId')) {
                model.PlatformMessageId = request.body.PlatformMessageId;
            }
            if (TypeUtils.hasProperty(request.body, 'PlatformResponseMessageId')) {
                model.PlatformResponseMessageId = request.body.PlatformResponseMessageId;
            }
            if (TypeUtils.hasProperty(request.body, 'Direction')) {
                model.Direction = request.body.Direction;
            }
            if (TypeUtils.hasProperty(request.body, 'ContentType')) {
                model.ContentType = request.body.ContentType;
            }
            if (TypeUtils.hasProperty(request.body, 'AssessmentId')) {
                model.AssessmentId = request.body.AssessmentId;
            }
            if (TypeUtils.hasProperty(request.body, 'AssessmentNodeId')) {
                model.AssessmentNodeId = request.body.AssessmentNodeId;
            }
            if (TypeUtils.hasProperty(request.body, 'FeedbackType')) {
                model.FeedbackType = request.body.FeedbackType;
            }
            if (TypeUtils.hasProperty(request.body, 'IdentifiedIntent')) {
                model.IdentifiedIntent = request.body.IdentifiedIntent;
            }

            return model;
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

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
