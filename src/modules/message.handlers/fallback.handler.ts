import { injectable, Lifecycle, scoped } from 'tsyringe';
import { IMessageHandler } from '../interfaces/handler.interface';
import { HandlerType } from '../../domain.types/intent.types';

///////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class FallbackHandler implements IMessageHandler {

    async handle(messageData: any, conversation: any, intentResult: any): Promise<any> {
        return {
            text : 'I apologize, but I did not understand your request. Could you please rephrase?',
            type : 'text'
        };
    }

    async canHandle(messageData: any, conversation: any): Promise<boolean> {
        return true; // Fallback can handle any message
    }

    getHandlerType(): string {
        return HandlerType.Fallback;
    }

}
