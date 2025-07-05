import { Request, Response, NextFunction } from "express";
import { AppError } from "../../common/error.handling/app.error";
import { logger } from "../../logger/logger";
import { HttpStatusCodes } from "../../common/error.handling/http.status.codes";

////////////////////////////////////////////////////////////////////////

export const errorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void => {
    const statusCode = error.Code || HttpStatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || "Internal Server Error";

    // Log error for debugging
    logger.error("Error: " + JSON.stringify({
        message   : error.message,
        stack     : error.stack,
        url       : req.url,
        method    : req.method,
        ip        : req.ip,
        userAgent : req.get("User-Agent"),
    }, null, 2));

    res.status(statusCode).json({
        success : false,
        error   : {
            message,
            ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        },
        timestamp : new Date().toISOString(),
    });
};
