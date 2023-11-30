import express from 'express';
import { UserController } from './user.controller';
import { context } from '../../auth/context.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {
    const router = express.Router();
    const controller = new UserController();
    const contextBase = 'User';

    router.post('/', context(`${contextBase}.Create`), controller.create);
    router.get('/search', context(`${contextBase}.Search`), controller.search);
    router.get('/:id', context(`${contextBase}.GetById`), controller.getById);
    router.put('/:id', context(`${contextBase}.Update`), controller.update);
    router.delete('/:id', context(`${contextBase}.Delete`), controller.delete);

    app.use('/api/v1/users', router);
};
