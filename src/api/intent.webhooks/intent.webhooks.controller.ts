import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { Lifecycle, scoped } from 'tsyringe';
import { logger } from '../../logger/logger';
import { IntentEmitter } from '../../intent/intent.emitter';
import { INLPHandler } from '../../message.handlers/nlp/nlp.handler.interface';

///////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class IntentWebhookController {

    public ping = async (request: express.Request, response: express.Response) => {
        try {
            return ResponseHandler.success(request, response, 'pong', 200, { 'pong': true });
        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    validateIntent = async (request: express.Request, response: express.Response) => {
        try {
            const intent: string = request.query.intent_name as string;
            logger.info("Checking Event Emitter details for Intent Name: " + intent);

            if (!intent || intent.trim() === '') {
                const errMessage = 'Missing required parameter [intent].';
                return ResponseHandler.failure(request, response, errMessage, 400, new Error(errMessage));
            }
            const listenerCount = IntentEmitter.getIntentListeners(intent);
            const listeners = {
                totalListeners : listenerCount
            };
            return ResponseHandler.success(request, response, 'Intent Listeners Info', 200, listeners);

        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

    public processIntent = async (request: express.Request, response: express.Response) => {
        try {
            const container = request.container;
            const nlpHandler: INLPHandler = container.resolve('INLPHandler');
            const intent = nlpHandler.extractIntentFromReqBody(request.body);

            if (!intent || intent.trim() === '') {
                const msg = 'Missing required parameter [intent].';
                return ResponseHandler.failure(request, response, msg, 400, new Error(msg));
            }
            const totalListeners = IntentEmitter.getIntentListenerCount(intent);
            let fulfillmentResponse = null;

            logger.info("Checking Event Emitter details for Intent Name: " + intent);
            if (totalListeners === 0) {
                logger.info("No listeners registered for this Intent. Calling fallback mechanism to notify.");
                fulfillmentResponse = 'Opps! Intent cannot be fulfilled. Please try again after some time.';
                request.body.failureReason = 'No listeners registered for this Intent.';
                IntentEmitter.emit('IntentFulfillment:Failure', request.body);
                const msg = 'Intent not fulfilled.';
                return ResponseHandler.failure(request, response, msg, 500, new Error(msg));
            }
            else {
                logger.info("Listeners registered for this Intent. Calling fulfillment mechanism to notify.");
                fulfillmentResponse = await IntentEmitter.emit(intent, request.body);
            }
            fulfillmentResponse = await IntentEmitter.emit(intent, request);

            // Either overall fulfillment rejected or all of the listeners rejected to fulfill
            const someListenerFulfilled = fulfillmentResponse.some((listenerResponse) => {
                return listenerResponse.status === 'fulfilled'; });
            if (!someListenerFulfilled) {
                request.body.failureReason = fulfillmentResponse;
                IntentEmitter.emit('IntentFulfillment:Failure', request.body);
                return ResponseHandler.failure(request, response, 'Failed to Process intent.', 500, null);
            }

            logger.info(`One or more listeners have fulfilled the Intent successfully.`);
            IntentEmitter.emit('IntentFulfillment:Success', intent);

            return ResponseHandler.success(request, response, 'Intent fulfilled successfully.', 200, fulfillmentResponse);

        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
