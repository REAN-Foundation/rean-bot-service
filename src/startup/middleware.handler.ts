import express from "express";
// import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { HttpLogger } from "../logger/http.logger";
import { logger } from "../logger/logger";
import path from "path";
import morgan from "morgan";
import { requestLogger } from "./middlewares/request.logger";

////////////////////////////////////////////////////////////////////////////////////

export class MiddlewareHandler {

    public static setup = async (expressApp: express.Application): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            try {
                expressApp.use(helmet());

                // Serve Docsify static files
                expressApp.use("/api/docs", express.static(path.join("docs")));

                expressApp.use(express.urlencoded({ extended: true, limit: "100mb" }));
                expressApp.use(express.json({ limit: "100mb" }));

                expressApp.use(compression());

                expressApp.use(cors({
                    origin : '*', //Allow all origins, change this to restrict access to specific origins
                }));
                if (process.env.HTTP_LOGGING === 'true') {
                    expressApp.use(morgan("combined"));
                    HttpLogger.use(expressApp);
                }

                expressApp.use(requestLogger);

                //File upload configuration
                // const maxUploadFileSize = parseInt(process.env.MAX_UPLOAD_FILE_SIZE) || 104857600; //100MB
                // expressApp.use(fileUpload({
                //     limits            : { fileSize: maxUploadFileSize },
                //     preserveExtension : true,
                //     createParentPath  : true,
                //     parseNested       : true,
                //     useTempFiles      : true,
                //     tempFileDir       : '/tmp/uploads/'
                // }));

                //Your custom middlewares go here

                resolve(true);
            }
            catch (error) {
                logger.error('Error initializing the middlewares: ' + error.message);
                reject(error);
            }
        });
    };

}
