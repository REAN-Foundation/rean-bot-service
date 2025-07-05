import { Request, Response, NextFunction } from 'express';
import { Middleware } from './auth.types';
import { authenticateClientMiddleware } from './client.app.auth.middleware';
import { authenticateUserMiddleware } from './user.authentication.middleware';
import { authorizeUserMiddleware } from './user.authorization.middleware';

//////////////////////////////////////////////////////////////////////////////////////////////////////

export class ContextHandler {

    public static handle = (context:string): Middleware[] => {
        var middlewares: Middleware[] = [];
        var contextSetter = async (request: Request, response: Response, next: NextFunction) => {
            request.context = context;
            next();
        };
        middlewares.push(contextSetter);
        middlewares.push(authenticateClientMiddleware as Middleware);
        middlewares.push(authenticateUserMiddleware as Middleware);
        middlewares.push(authorizeUserMiddleware as Middleware);

        return middlewares;
    }

}

export const context = ContextHandler.handle;
