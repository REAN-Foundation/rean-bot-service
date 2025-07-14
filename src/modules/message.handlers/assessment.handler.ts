import { injectable } from 'tsyringe';
import { IMessageHandler } from '../interfaces/handler.interface';

@injectable()
export class AssessmentHandler implements IMessageHandler {

    async handle(messageData: any, conversation: any, intentResult: any): Promise<any> {
        return {
            text: 'Assessment handler response',
            type: 'text'
        };
    }

    async canHandle(messageData: any, conversation: any): Promise<boolean> {
        return true; // Basic implementation
    }

    getHandlerType(): string {
        return 'ASSESSMENT';
    }
}
