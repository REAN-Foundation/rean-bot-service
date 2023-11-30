import 'reflect-metadata';
import { DependencyContainer, container } from 'tsyringe';
import { ModuleInjector } from '../modules/module.injector';
import { DatabaseInjector } from '../database/database.injector';

//////////////////////////////////////////////////////////////////////

export class Injector {

    private static _container: DependencyContainer = container;

    public static get Container() {
        return Injector._container;
    }

    static registerInjections() {
        ModuleInjector.registerInjections(Injector.Container);
        DatabaseInjector.registerInjections(Injector.Container);
    }

}
