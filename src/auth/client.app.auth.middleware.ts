import express from "express";
import { AuthResult } from "./auth.types";
import { ResponseHandler } from "../common/handlers/response.handler";
import { logger } from "../logger/logger";
import { clientAppCache } from "./client.app.cache";
import { CurrentClient } from "../domain.types/miscellaneous/current.client";

/////////////////////////////////////////////////////////////////////////////

export const authenticateClientMiddleware = async (
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
            if (authResult.Result === false){
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
    try {
        var res: AuthResult = {
            Result        : true,
            Message       : 'Authenticated',
            HttpErrorCode : 200,
        };
        let apiKey: string = request.headers['x-api-key'] as string;

        if (!apiKey) {
            res = {
                Result        : false,
                Message       : 'Missing API key for the client',
                HttpErrorCode : 401,
            };
            return res;
        }
        apiKey = apiKey.trim();

        //////////////////////////////////////////////////////////////////////
        //TODO: User the following after multi-tenancy is applied

        const expectedApiKey = process.env.INTERNAL_API_KEY;
        if (apiKey !== expectedApiKey) {
            res = {
                Result        : false,
                Message       : 'Invalid API Key: Forbidden access',
                HttpErrorCode : 403,
            };
            return res;
        }
        // const currentClient = await clientAppCache.get(apiKey);
        // if (!currentClient) {
        //     res = {
        //         Result        : false,
        //         Message       : 'Invalid API Key: Forbidden access',
        //         HttpErrorCode : 403,
        //     };
        //     return res;
        // }
        //////////////////////////////////////////////////////////////////////

        const currentClient: CurrentClient = {
            Code: process.env.CLIENT_CODE,
            Name: process.env.CLIENT_NAME,
            IsPrivileged: true,
        }

        request.currentClient = currentClient;

    } catch (err) {
        logger.error(JSON.stringify(err, null, 2));
        res = {
            Result        : false,
            Message       : 'Error authenticating client application',
            HttpErrorCode : 401,
        };
    }
    return res;
};
