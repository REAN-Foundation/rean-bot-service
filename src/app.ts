import "reflect-metadata";
import express from 'express';
import { RequestRouter } from './startup/request.router';
import { logger } from './logger/logger';
import { Scheduler } from './startup/scheduler';
import { Seeder } from './startup/seeder';
import { DatabaseConnector } from "./database/database.connector";
import { Injector } from "./startup/injector";
import { MiddlewareHandler } from "./startup/middlewares/middleware.handler";
import { notFoundHandler } from "./startup/middlewares/not.found.handler";
import { errorHandler } from "./startup/middlewares/error.handler";

///////////////////////////////////////////////////////////////////////////////////////////

export default class Application {

    //#region Construction

    private _app: express.Application = null;

    private static _instance: Application = null;

    private constructor() {
        this._app = express();
    }

    public static instance(): Application {
        return this._instance || (this._instance = new this());
    }

    //#endregion

    public app(): express.Application {
        return this._app;
    }

    public start = async(): Promise<void> => {
        try {
            await this.warmUp();
            await this.listen();
        }
        catch (error){
            logger.error(`❌ An error occurred while starting ${process.env.SERVICE_NAME}.` + error.message);
        }
    };

    warmUp = async () => {
        await Injector.registerInjections();
        await DatabaseConnector.setup();
        await MiddlewareHandler.setup(this.app());
        await RequestRouter.setup(this.app());
        await this.initializeErrorHandlerMiddlewares();
        await Seeder.seed();
        await Scheduler.instance().schedule();
    };

    private listen = () => {
        return new Promise((resolve, reject) => {
            try {
                const port = process.env.PORT;
                const server = this._app.listen(port, () => {
                    const serviceName = `${process.env.SERVICE_NAME}-[${process.env.NODE_ENV}]`;
                    logger.info(`🚀 ${serviceName} is up and listening on port ${process.env.PORT.toString()}`);
                    logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
                    logger.info(`✅ Health check: http://localhost:${port}/health-check`);
                    this._app.emit("server_started");
                });
                module.exports.server = server;
                resolve(this._app);
            }
            catch (error) {
                logger.error(`❌ An error occurred while listening on port ${process.env.PORT.toString()}.` + error.message);
                reject(error);
            }
        });
    };

    private initializeErrorHandlerMiddlewares(): void {
        logger.info('🔥 Initializing error handler middlewares...');
        // 404 handler middleware
        this._app.use(notFoundHandler);

        // Global error handler middleware
        this._app.use(errorHandler);
    }

}
