import { ILogger } from './logger.interface';
import { CustomDebugLogger } from './custom/custom.debug.logger';
import { CustomProdLogger } from './custom/custom.prod.logger';

///////////////////////////////////////////////////////////

class Logger {

    static getLogger = (): ILogger => {

        var logger_: ILogger = new CustomDebugLogger();

        logger_ = new CustomDebugLogger();
        if (process.env.NODE_ENV === 'production') {
            logger_ = new CustomProdLogger();
        }

        return logger_;
    };

    static _logger: ILogger = this.getLogger();

    static info = (str: string) => {
        this._logger?.info(str);
    };

    static error = (str: string) => {
        this._logger?.error(str);
    };

    static warn = (str: string) => {
        this._logger?.warn(str);
    };

    static debug = (str: string) => {
        this._logger?.debug(str);
    };

}

export { Logger as logger };
