import express from 'express';
import { SupportChannelWebhookController } from './support.channel.webhooks.controller';
import { context } from '../../auth/context.handler';
import { Lifecycle, inject, scoped } from 'tsyringe';
// import { logger } from '../../logger/logger';

///////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class SupportChannelWebhookRoutes {

    constructor (
        @inject(SupportChannelWebhookController) private _controller?: SupportChannelWebhookController
    ) {
    }

    public register = (app: express.Application): void => {

        const router = express.Router();

        const contextBase = 'SupportChannelWebhook';

        router.post(`/:client/:channel/:unique_token/receive`, context(`${contextBase}.ReceiveMessage`), this._controller.receiveMessage);

        app.use('/v1/support', router);
    };

}
