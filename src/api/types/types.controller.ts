import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import {
    LogicalOperatorList,
    OperatorList,
    CompositionOperatorList,
    MathematicalOperatorList,
    ConditionOperandDataTypeList,
    ExecutionStatusList,
    InputSourceTypeList
} from '../../domain.types/operator.types';

///////////////////////////////////////////////////////////////////////////////////////

export class TypesController {

    //#region member variables and constructors

    constructor() {
        // this._roleService = new RoleService();
    }

    //#endregion

    //#region Action methods

    getConditionOperatorTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Condition operator types retrieved successfully!', 200, {
                Types : OperatorList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getLogicalOperatorTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Logical operator types retrieved successfully!', 200, {
                Types : LogicalOperatorList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getCompositeOperatorTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Composite operator types retrieved successfully!', 200, {
                Types : CompositionOperatorList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getMathematicalOperatorTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Mathematical operator types retrieved successfully!', 200, {
                Types : MathematicalOperatorList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getOperandDataTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Operand data types retrieved successfully!', 200, {
                Types : ConditionOperandDataTypeList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getExecutionStatusTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Execution status types retrieved successfully!', 200, {
                Types : ExecutionStatusList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    getInputSourceTypes = async (request: express.Request, response: express.Response): Promise<void> => {
        try {
            ResponseHandler.success(request, response, 'Input source types retrieved successfully!', 200, {
                Types : InputSourceTypeList,
            });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    //#endregion

}
