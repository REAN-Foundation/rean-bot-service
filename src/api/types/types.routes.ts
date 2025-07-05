import express from 'express';
import {
    TypesController
} from './types.controller';
import { context } from '../../auth/context.handler';

///////////////////////////////////////////////////////////////////////////////////

export const register = (app: express.Application): void => {

    const router = express.Router();
    const controller = new TypesController();
    const contextBase = 'Types';

    router.get('/condition-operator-types', context(`${contextBase}.GetConditionOperatorTypes`), controller.getConditionOperatorTypes);
    router.get('/logical-operator-types', context(`${contextBase}.GetLogicalOperatorTypes`), controller.getLogicalOperatorTypes);
    router.get('/composite-operator-types', context(`${contextBase}.GetCompositeOperatorTypes`), controller.getCompositeOperatorTypes);
    router.get('/mathematical-operator-types', context(`${contextBase}.GetMathematicalOperatorTypes`), controller.getMathematicalOperatorTypes);
    router.get('/operand-data-types', context(`${contextBase}.GetOperandDataTypes`), controller.getOperandDataTypes);
    router.get('/input-source-types', context(`${contextBase}.GetInputSourceTypes`), controller.getInputSourceTypes);

    app.use('/api/v1/types', router);
};
