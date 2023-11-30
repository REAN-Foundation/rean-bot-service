import 'reflect-metadata';
import { DependencyContainer } from 'tsyringe';
import { DatabaseClientInjector } from './clients/database.client.injector';
import { RepositoryInjector } from './typeorm/repository.injector';

////////////////////////////////////////////////////////////////////////////////

export class DatabaseInjector {

    static registerInjections(container: DependencyContainer) {
        DatabaseClientInjector.registerInjections(container);
        RepositoryInjector.registerInjections(container);
    }

}
