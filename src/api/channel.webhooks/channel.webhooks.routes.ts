import express from 'express';
import { ChannelWebhookController } from './channel.webhooks.controller';
import { context } from '../../auth/context.handler';
import { Lifecycle, inject, scoped } from 'tsyringe';
// import { logger } from '../../logger/logger';

///////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class ChannelWebhookRoutes {

    constructor (
        @inject(ChannelWebhookController) private _controller?: ChannelWebhookController
    ) {
    }

    public register = (app: express.Application): void => {

        const router = express.Router();

        const contextBase = 'ChannelWebhook';

        router.post(`/:client/:channel/:unique_token/send`, context(`${contextBase}.SendMessage`), this._controller.sendMessage);
        router.post(`/:client/:channel/:unique_token/receive`, context(`${contextBase}.ReceiveMessage`), this._controller.receiveMessage);
        //router.get(`/:client/:channel/:unique_token/webhook`,
        //context(`${contextBase}.Authenticate`), this._controller.authenticate);

        app.use('/v1/', router);
    };

}
