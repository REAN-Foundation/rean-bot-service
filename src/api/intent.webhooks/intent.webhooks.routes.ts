import express from 'express';
import { IntentWebhookController } from './intent.webhooks.controller';
import { context } from '../../auth/context.handler';
import { Lifecycle, inject, scoped } from 'tsyringe';

///////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class IntentWebhookRoutes {

    constructor (
        @inject(IntentWebhookController) private _controller?: IntentWebhookController
    ) {
    }

    public register = (app: express.Application): void => {

        const router = express.Router();

        const contextBase = 'IntentWebhook';

        router.get('/:client/chat-bot/ping', context(`${contextBase}.Ping`), this._controller.ping);
        router.get('/:client/chat-bot/intent/validate', context(`${contextBase}.Validate`), this._controller.validateIntent);
        router.post('/:client/chat-bot/intent/fulfill', context(`${contextBase}.Fulfill`), this._controller.processIntent);

        app.use('/v1/', router);
    };

}
