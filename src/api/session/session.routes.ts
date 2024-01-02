import express from 'express';
import { SessionController } from './session.controller';
import { context } from '../../auth/context.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {
    const router = express.Router();
    const controller = new SessionController();
    const contextBase = 'Session';

    router.get('/search', context(`${contextBase}.Search`), controller.search);
    router.get('/:id', context(`${contextBase}.GetById`), controller.getById);

    app.use('/api/v1/sessions', router);
};
