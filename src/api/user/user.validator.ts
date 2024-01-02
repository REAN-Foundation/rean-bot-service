import express from 'express';
import joi from 'joi';
import { ErrorHandler } from '../../common/handlers/error.handler';
import BaseValidator from '../base.validator';
import { TypeUtils } from '../../common/utilities/type.utils';
import { UserCreateModel, UserUpdateModel, UserSearchFilters } from '../../types/domain.models/user.domain.models';
import { Gender } from '../../types/enums';

///////////////////////////////////////////////////////////////////////////////////////////////

export class UserValidator extends BaseValidator {

    public validateCreateRequest = async (request: express.Request): Promise<UserCreateModel> => {
        try {
            const schema = joi.object({
                TenantId  : joi.number().integer().optional(),
                Prefix    : joi.string().max(12).min(1).optional(),
                FirstName : joi.string().max(128).min(1).optional(),
                LastName  : joi.string().max(128).min(1).optional(),
                Phone     : joi.string().max(32).min(7).optional(),
                Email     : joi.string().email().optional(),
                Gender    : joi
                    .string()
                    .valid(...Object.values(Gender))
                    .optional(),
                BirthDate         : joi.date().iso().optional(),
                PreferredLanguage : joi.string().email().optional(),
            });
            await schema.validateAsync(request.body);
            const model: UserCreateModel = {
                TenantId          : request.body.TenantId ? request.body.TenantId : null,
                Prefix            : request.body.Prefix ? request.body.Prefix : null,
                FirstName         : request.body.FirstName ? request.body.FirstName : null,
                LastName          : request.body.LastName ? request.body.LastName : null,
                Phone             : request.body.Phone ? request.body.Phone : null,
                Email             : request.body.Email ? request.body.Email : null,
                Gender            : request.body.Gender ? request.body.Gender : 'Unknown',
                BirthDate         : request.body.BirthDate ? request.body.BirthDate : null,
                PreferredLanguage : request.body.PreferredLanguage ? request.body.PreferredLanguage : 'English',
            };
            return model;
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateUpdateRequest = async (request: express.Request): Promise<UserUpdateModel> => {
        try {
            const schema = joi.object({
                TenantId  : joi.number().integer().optional(),
                Prefix    : joi.string().max(12).min(1).optional(),
                FirstName : joi.string().max(128).min(1).optional(),
                LastName  : joi.string().max(128).min(1).optional(),
                Phone     : joi.string().max(32).min(7).optional(),
                Email     : joi.string().email().optional(),
                Gender    : joi
                    .string()
                    .valid(...Object.values(Gender))
                    .optional(),
                BirthDate         : joi.date().iso().optional(),
                PreferredLanguage : joi.string().email().optional(),
            });
            await schema.validateAsync(request.body);
            var model: UserUpdateModel = {};

            if (TypeUtils.hasProperty(request.body, 'TenantId')) {
                model.TenantId = request.body.TenantId;
            }
            if (TypeUtils.hasProperty(request.body, 'Prefix')) {
                model.Prefix = request.body.Prefix;
            }
            if (TypeUtils.hasProperty(request.body, 'FirstName')) {
                model.FirstName = request.body.FirstName;
            }
            if (TypeUtils.hasProperty(request.body, 'LastName')) {
                model.LastName = request.body.LastName;
            }
            if (TypeUtils.hasProperty(request.body, 'Phone')) {
                model.Phone = request.body.Phone;
            }
            if (TypeUtils.hasProperty(request.body, 'Email')) {
                model.Email = request.body.Email;
            }
            if (TypeUtils.hasProperty(request.body, 'Gender')) {
                model.Gender = request.body.Gender;
            }
            if (TypeUtils.hasProperty(request.body, 'BirthDate')) {
                model.BirthDate = request.body.BirthDate;
            }
            if (TypeUtils.hasProperty(request.body, 'PreferredLanguage')) {
                model.PreferredLanguage = request.body.PreferredLanguage;
            }

            return model;
        } catch (error) {
            ErrorHandler.handleValidationError(error);
        }
    };

    public validateSearchRequest = async (request: express.Request): Promise<UserSearchFilters> => {
        try {
            const schema = joi.object({
                tenantId  : joi.number().integer().optional(),
                prefix    : joi.string().max(12).min(1).optional(),
                firstName : joi.string().max(128).min(1).optional(),
                lastName  : joi.string().max(128).min(1).optional(),
                phone     : joi.string().max(32).min(7).optional(),
                email     : joi.string().email().optional(),
                gender    : joi
                    .string()
                    .valid(...Object.values(Gender))
                    .optional(),
                birthDate         : joi.date().iso().optional(),
                preferredLanguage : joi.string().email().optional(),
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

    private getSearchFilters = (query): UserSearchFilters => {
        var filters = {};

        var tenantId = query.tenantId ? query.tenantId : null;
        if (tenantId != null) {
            filters['TenantId'] = tenantId;
        }
        var prefix = query.prefix ? query.prefix : null;
        if (prefix != null) {
            filters['Prefix'] = prefix;
        }
        var firstName = query.firstName ? query.firstName : null;
        if (firstName != null) {
            filters['FirstName'] = firstName;
        }
        var lastName = query.lastName ? query.lastName : null;
        if (lastName != null) {
            filters['LastName'] = lastName;
        }
        var phone = query.phone ? query.phone : null;
        if (phone != null) {
            filters['Phone'] = phone;
        }
        var email = query.email ? query.email : null;
        if (email != null) {
            filters['Email'] = email;
        }
        var gender = query.gender ? query.gender : null;
        if (gender != null) {
            filters['Gender'] = gender;
        }
        var birthDate = query.birthDate ? query.birthDate : null;
        if (birthDate != null) {
            filters['BirthDate'] = birthDate;
        }
        var preferredLanguage = query.preferredLanguage ? query.preferredLanguage : null;
        if (preferredLanguage != null) {
            filters['PreferredLanguage'] = preferredLanguage;
        }

        return filters;
    };

}
