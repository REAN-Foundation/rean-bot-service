import { container } from 'tsyringe';

export class ApplicationContainer {
    static getContainer() {
        return container;
    }
}
