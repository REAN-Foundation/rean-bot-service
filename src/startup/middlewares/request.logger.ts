import express from 'express';
import { logger } from '../../logger/logger';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const requestLogger = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
): void => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(
            `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
        );
    });

    next();
};
