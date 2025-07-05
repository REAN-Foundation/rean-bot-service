import express from "express";
import { AuthResult } from "./auth.types";
import { ResponseHandler } from "../common/handlers/response.handler";
import { logger } from "../logger/logger";
import { CurrentUser } from "../domain.types/miscellaneous/current.user";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

/////////////////////////////////////////////////////////////////////////////

export const authenticateUserMiddleware = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
): Promise<void> => {
    try {
        const requestUrl = request.originalUrl;

        // Handle certain endpoints separately
        const isHealthCheck = requestUrl === '/api/v1' && request.method === 'GET';
        if (isHealthCheck) {
            logger.info('Health check request');
            next();
        }
        else {
            const authResult = await authenticate(request);
            if (authResult.Result === false) {
                ResponseHandler.failure(request, response, authResult.Message, authResult.HttpErrorCode);
                return;
            }
            next();
        }
    } catch (error) {
        logger.error(error.message);
        ResponseHandler.failure(request, response, 'Client authentication error: ' + error.message, 401);
    }
};

const authenticate = async (request: express.Request): Promise<AuthResult> => {

    let res: AuthResult = {
        Result: true,
        Message: 'Authenticated',
        HttpErrorCode: 200,
    };

    try {

        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        const missingToken = token == null || token === 'null' || token === undefined;

        if (missingToken) {
            res = {
                Result: false,
                Message: 'Unauthorized user access',
                HttpErrorCode: 401,
            };
            return res;
        }

        // synchronous verification
        var user = jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET) as JwtPayload;
        var sessionId = user.SessionId ?? null;
        if (!sessionId) {
            const IsPrivilegedUser = request.currentClient.IsPrivileged as boolean;
            if (IsPrivilegedUser) {
                request.currentUser = user as CurrentUser;
                return res;
            }
            res = {
                Result: false,
                Message: 'Your session has expired. Please login to the app again.',
                HttpErrorCode: 403,
            };

            return res;
        }

        const expiresAt = user.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (expiresAt < currentTime) {
            res = {
                Result: false,
                Message: 'Invalid or expired user login session.',
                HttpErrorCode: 403,
            };

            return res;
        }

        request.currentUser = user as CurrentUser;
        request.currentUserTenantId = request.currentUser?.TenantId;
        res = {
            Result: true,
            Message: 'Authenticated',
            HttpErrorCode: 200,
        };

        return res;
    } catch (err) {
        logger.error(JSON.stringify(err, null, 2));
        logger.error(err.message);
        res = {
            Result: false,
            Message: 'Forbidden user access: ' + err.message, // Please do not change this and if needed to change then check with app developer
            HttpErrorCode: 403,
        };
        return res;
    }
};
