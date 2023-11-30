import dotenv from 'dotenv';
dotenv.config();

import Application from './app';
import { logger } from './logger/logger';

/////////////////////////////////////////////////////////////////////////

(async () => {
    const app = Application.instance();
    await app.start();
})();

/////////////////////////////////////////////////////////////////////////

//Shutting down the service gracefully

const TERMINATION_SIGNALS = [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`];

TERMINATION_SIGNALS.forEach((terminationEvent) => {
    process.on(terminationEvent, (data) => {
        logger.info(`Received ${terminationEvent} signal`);
        logger.error(JSON.stringify(data, null, 2));
        process.exit(0);
    });
});

/////////////////////////////////////////////////////////////////////////
