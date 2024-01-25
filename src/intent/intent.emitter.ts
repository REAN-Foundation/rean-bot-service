import { logger } from "../logger/logger";

//////////////////////////////////////////////////////////////////////////////////////

export type Intent = string;
export type IntentListener = (intent: string, eventObj: any) => Promise<any>; // Listener function type

//////////////////////////////////////////////////////////////////////////////////////

export class IntentEmitter {

    // Static Map of Intent Listeners
    static _intentListenersMap: Map<Intent, IntentListener[]> = new Map<Intent, IntentListener[]>();

    // Register the Intent with a listener
    static registerListener(intent: Intent, listener: IntentListener) {

        logger.info(`Register an Intent: ${intent} with listener.`);

        const topic = intent.toLowerCase();
        if (!IntentEmitter._intentListenersMap.has(topic)) {
            const listeners: IntentListener[] = [];
            listeners.push(listener);
            IntentEmitter._intentListenersMap.set(topic, listeners);
        }
        else {
            const listeners = IntentEmitter._intentListenersMap.get(topic);
            listeners.push(listener);
            IntentEmitter._intentListenersMap.set(topic, listeners);
        }
    }

    // Custom Intent Emitter with PromiseHandlers
    static emit = async (intent: Intent, eventObj: any) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                let consolidatedResponse = null;

                logger.info(`Processing Intent ${intent}`);

                const listeners = IntentEmitter.getIntentListeners(intent);
                const promises = [];
                for (const listener of listeners) {
                    promises.push(listener(intent, eventObj));
                }
                consolidatedResponse = await Promise.allSettled(promises);

                // TODO: implement here - if we need consolidated output to be sent - varies per Intent
                resolve(consolidatedResponse);

            } catch (error) {
                logger.error(`IntentEmitterException: ${error.message}`);
                reject('Error: IntentFulfillmentException!');
            }
        });
    };

    // Get listeners already registered for given intent
    static getIntentListeners(intent: Intent) {
        const topic = intent.toLowerCase();
        if (IntentEmitter._intentListenersMap.has(topic)) {
            const listeners = IntentEmitter._intentListenersMap.get(topic);
            return listeners;
        }
        return [];
    }

    // Get listener count already registered for given intent
    static getIntentListenerCount(intent: Intent) {
        const topic = intent.toLowerCase();
        if (IntentEmitter._intentListenersMap.has(topic)) {
            const listeners = IntentEmitter._intentListenersMap.get(topic);
            return listeners.length;
        }
        return 0;
    }

}
