import express from 'express';
import { ChannelWebhookController } from './channel.webhooks.controller';
import { context } from '../../auth/context.handler';
import { Lifecycle, inject, scoped } from 'tsyringe';
// import { logger } from '../../logger/logger';

///////////////////////////////////////////////////////////////////////////////////

// export const register = (app: express.Application): void => {
//     const router = express.Router();
//     const controller = new ChatMessageController();
//     const contextBase = 'ChatMessage';
//     router.post('/', context(`${contextBase}.Create`), controller.create);
//     router.get('/search', context(`${contextBase}.Search`), controller.search);
//     router.get('/:id', context(`${contextBase}.GetById`), controller.getById);
//     router.put('/:id', context(`${contextBase}.Update`), controller.update);
//     router.delete('/:id', context(`${contextBase}.Delete`), controller.delete);
//     app.use('/api/v1/chat_messages', router);
// };

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
        // router.get(`/:client/:channel/:unique_token/webhook`,
        //context(`${contextBase}.AuthenticateWebhook`), this._controller.authenticateWebhook);

        app.use('/v1/', router);
    };

}
