import express from "express";
import { logger } from "../logger/logger";
import { register as registerRuleRoutes } from '../api/rule/rule.routes';
import { register as registerConditionRoutes } from '../api/condition/condition.routes';
import { register as registerTypesRoutes } from '../api/types/types.routes';
import path from "path";

////////////////////////////////////////////////////////////////////////////////////

export class RouteHandler {

    public static setup = async (expressApp: express.Application): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {

                //Handling the base route
                expressApp.get('/api/v1/', (_request, response) => {
                    response.status(200).json({
                        Status   : 'success',
                        HttpCode : 200,
                        Message  : `${process.env.SERVICE_NAME}-[${process.env.NODE_ENV}]`,
                        Data     : null,
                    });
                });

                // Health check route
                expressApp.get('/health-check', (_request, response) => {
                    response.status(200).json({
                        Status   : 'success',
                        HttpCode : 200,
                        Message  : 'OK',
                        Data     : {
                            Timestamp : new Date().toISOString(),
                            Uptime    : process.uptime(),
                        },
                    });
                });

                // Serve the Docsify index.html
                expressApp.get("/api/docs", (req, res) => {
                    res.sendFile(path.join(__dirname, "docs/index.html"));
                });

                registerRuleRoutes(expressApp);
                registerConditionRoutes(expressApp);
                registerTypesRoutes(expressApp);

                resolve(true);

            } catch (error) {
                logger.error('Error initializing the router: ' + error.message);
                reject(false);
            }
        });
    };

}
