import dotenv from 'dotenv';
dotenv.config();
import { Telemetry } from './telemetry/instrumenter'; //!This should be imported before Application
import Application from './app';
import { logger } from './logger/logger';
import { DatabaseConnector } from './database/database.connector';

/////////////////////////////////////////////////////////////////////////

(async () => {
    Telemetry.instance().details();
    const app = Application.instance();
    await app.start();
})();

/////////////////////////////////////////////////////////////////////////

//Shutting down the service gracefully

// const TERMINATION_SIGNALS = [
//     `exit`,
//     `SIGINT`,
//     `SIGUSR1`,
//     `SIGUSR2`,
//     `uncaughtException`,
//     `SIGTERM`
// ];

// TERMINATION_SIGNALS.forEach((terminationEvent) => {
//     process.on(terminationEvent, (data) => {
//         Telemetry.instance().shutdown();
//         logger.info(`Received ${terminationEvent} signal`);
//         logger.error(JSON.stringify(data, null, 2));
//         process.exit(0);
//     });
// });

// Handle graceful shutdown
process.on("SIGTERM", async () => {
    logger.info("🛑 SIGTERM received, shutting down gracefully");
    Telemetry.instance().shutdown();
    await DatabaseConnector.close();
    process.exit(0);
});

process.on("SIGINT", async () => {
    logger.info("🛑 SIGINT received, shutting down gracefully");
    Telemetry.instance().shutdown();
    await DatabaseConnector.close();
    process.exit(0);
});

process.on("uncaughtException", async (error) => {
    logger.error("🛑 Uncaught exception received, shutting down gracefully");
    logger.error(error.message);
    logger.error(JSON.stringify(error.stack, null, 2));
    Telemetry.instance().shutdown();
    await DatabaseConnector.close();
    process.exit(1);
});

process.on("unhandledRejection", async (reason: any, promise: Promise<any>) => {
    logger.error("🛑 Unhandled rejection received, shutting down gracefully");
    logger.error(`reason: ${reason}`);
    logger.error(`promise: ${JSON.stringify(promise, null, 2)}`);
    Telemetry.instance().shutdown();
    await DatabaseConnector.close();
    process.exit(1);
});

/////////////////////////////////////////////////////////////////////////
