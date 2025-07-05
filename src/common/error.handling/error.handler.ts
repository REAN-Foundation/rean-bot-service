import { logger } from '../../logger/logger';
import { HttpStatusCodes } from './http.status.codes';
import { AppError } from './app.error';
import { InputValidationError } from './input.validation.error';

////////////////////////////////////////////////////////////////////////

export class ErrorHandler {

    static throwInputValidationError = (errorMessages: string[]) => {
        throw new InputValidationError(errorMessages);
    };

    static throwDuplicateUserError = (message: string) => {
        throw new AppError(message, HttpStatusCodes.CONFLICT);
    };

    static throwNotFoundError = (message: string) => {
        throw new AppError(message, HttpStatusCodes.NOT_FOUND);
    };

    static throwUnauthorizedUserError = (message: string) => {
        throw new AppError(message, HttpStatusCodes.UNAUTHORIZED);
    };

    static throwForebiddenAccessError = (message: string) => {
        throw new AppError(message, HttpStatusCodes.FORBIDDEN);
    };

    static throwDbAccessError = (message: string, error: Error) => {
        throw new AppError(message, HttpStatusCodes.INTERNAL_SERVER_ERROR, error);
    };

    static throwConflictError = (message: string) => {
        throw new AppError(message, HttpStatusCodes.CONFLICT);
    };

    static throwFailedPreconditionError = (message: string) => {
        throw new AppError(message, HttpStatusCodes.PRECONDITION_FAILED);
    };

    static throwInternalServerError = (message: string, error: Error = null) => {
        throw new AppError(message, HttpStatusCodes.INTERNAL_SERVER_ERROR, error);
    };

    static handleValidationError = (error: any) => {
        if (error.isJoi === true) {
            logger.error(error.message);
            const errorMessages = error.details.map(x => x.message);
            ErrorHandler.throwInputValidationError(errorMessages);
        }
        else {
            ErrorHandler.throwInputValidationError(error.message);
        }
    };

}
