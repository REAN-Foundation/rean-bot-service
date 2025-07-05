import express from "express";
import { ResponseHandler } from "../common/handlers/response.handler";
import { logger } from "../logger/logger";

/////////////////////////////////////////////////////////////////////////////

export const authorizeUserMiddleware = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
): Promise<void> => {
    try {
        const context = request.context;
        if (context == null || context === 'undefined') {
            ResponseHandler.failure(request, response, 'Unauthorized', 401);
            return;
        }

        const currentUser = request.currentUser ?? null;
        if (!currentUser) {
            ResponseHandler.failure(request, response, 'Unauthorized', 401);
            return;
        }

        const isAuthorized = await checkRoleBasedPermissions(request);
        if (!isAuthorized) {
            ResponseHandler.failure(request, response, 'Unauthorized', 401);
            return;
        }
        next();
    } catch (error) {
        logger.error(error.message);
        ResponseHandler.failure(request, response, 'User authorization error: ' + error.message, 401);
    }
};

const checkRoleBasedPermissions = async (request: express.Request): Promise<boolean> => {
    //TO DO: Implement role based permissions
    return true;
};
