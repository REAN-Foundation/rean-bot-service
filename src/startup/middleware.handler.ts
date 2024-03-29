import express from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import cors from 'cors';
import { HttpLogger } from '../logger/http.logger';
import { logger } from '../logger/logger';
import { Injector } from './injector';
import { getChannelType } from '../types/enums';

////////////////////////////////////////////////////////////////////////////////////

export class MiddlewareHandler {

    public static setup = async (expressApp: express.Application): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {

                //Create child container and register scoped injections
                expressApp.use((request, _response, next) => {
                    request.container = Injector.BaseContainer.createChildContainer();
                    const tenantName = request.params.client ?? null;
                    const channelName = request.params.channel ?? null;
                    const channelType = getChannelType(channelName);
                    Injector.registerScopedInjections(request.container, tenantName, channelType);
                    next();
                });

                expressApp.use(express.urlencoded({ extended: true }));
                expressApp.use(express.json());
                expressApp.use(helmet());
                expressApp.use(
                    cors({
                        origin : '*', //Allow all origins, change this to restrict access to specific origins
                    })
                );
                if (process.env.HTTP_LOGGING_ENABLED === 'true') {
                    HttpLogger.use(expressApp);
                }

                //File upload configuration
                const maxUploadFileSize = parseInt(process.env.MAX_UPLOAD_FILE_SIZE) || 104857600; //100MB
                expressApp.use(
                    fileUpload({
                        limits            : { fileSize: maxUploadFileSize },
                        preserveExtension : true,
                        createParentPath  : true,
                        parseNested       : true,
                        useTempFiles      : true,
                        tempFileDir       : '/tmp/uploads/',
                    })
                );

                //Your custom middlewares go here

                resolve(true);
            } catch (error) {
                logger.error('Error initializing the middlewares: ' + error.message);
                reject(error);
            }
        });
    };

    //Add your custom middlewares here
    //...

}
