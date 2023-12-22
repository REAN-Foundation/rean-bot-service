import express from 'express';
import { ChatMessageController } from './chat.message.controller';
import { context } from '../../auth/context.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {
    const router = express.Router();
    const controller = new ChatMessageController();
    const contextBase = 'ChatMessage';

    router.get('/search', context(`${contextBase}.Search`), controller.search);
    router.get('/:id', context(`${contextBase}.GetById`), controller.getById);

    app.use('/api/v1/chat_messages', router);
};
