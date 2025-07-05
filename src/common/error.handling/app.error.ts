import { HttpStatusCodes } from './http.status.codes';

////////////////////////////////////////////////////////////////////////

export class AppError extends Error {

    Trace: string[] = [];

    Code = HttpStatusCodes.INTERNAL_SERVER_ERROR;

    constructor(message: string, errorCode: number, error: Error = null) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.message = message ?? '❌ An unexpected error';
        this.message = this.message + (error != null ? '> ' + error.message : '');
        this.Trace = error != null ? error.stack?.split('\n') : [];
        this.Code = errorCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR;
    }

}
