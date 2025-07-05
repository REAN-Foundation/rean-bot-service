import { HttpStatusCodes } from './http.status.codes';
import { AppError } from './app.error';

////////////////////////////////////////////////////////////////////////

export class InputValidationError extends AppError {

    _validationErrorMessages: string[] = [];

    constructor(errorMessages: string[]) {
        super('Input validation errors', HttpStatusCodes.BAD_REQUEST);
        this._validationErrorMessages = errorMessages;
        this.message = JSON.stringify(this._validationErrorMessages, null, 2);
    }

    public get errorMessages() {
        return this._validationErrorMessages;
    }

}
