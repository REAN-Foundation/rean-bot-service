import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../common/handlers/response.handler';

//////////////////////////////////////////////////////////////////////////////////////////////////////
export type Middleware = (request: Request, response: Response, next: NextFunction) => Promise<void>;
//////////////////////////////////////////////////////////////////////////////////////////////////////

export class ContextHandler {

    public static handle = (context: string): Middleware[] => {

        var middlewares: Middleware[] = [];

        //Set context
        var contextSetter = async (request: Request, response: Response, next: NextFunction) => {
            request.context = context;
            const tokens = context.split('.');
            if (tokens.length < 2) {
                ResponseHandler.failure(request, response, 'Invalid request context', 400);
                return;
            }
            request.context = context;
            next();
        };
        middlewares.push(contextSetter);
        return middlewares;
    };

}

export const context = ContextHandler.handle;
