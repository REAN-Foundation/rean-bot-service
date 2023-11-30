/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import { TypeORMDatabaseConnector } from './typeorm/typeorm.database.connector';

///////////////////////////////////////////////////////////////////////////////////

export default class DatabaseConnector {

    static setup = async (): Promise<boolean> => {
        return await TypeORMDatabaseConnector.setup();
    };

    static close = (): Promise<boolean> => {
        return TypeORMDatabaseConnector.close();
    };

}
