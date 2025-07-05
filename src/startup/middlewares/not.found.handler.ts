import { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success : false,
        error   : {
            message : `Route ${req.originalUrl} not found`,
        },
        timestamp : new Date().toISOString(),
    });
};
