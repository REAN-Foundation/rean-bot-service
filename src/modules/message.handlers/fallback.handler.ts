import { injectable } from 'tsyringe';
import { IMessageHandler } from './interfaces/handler.interface';

@injectable()
export class FallbackHandler implements IMessageHandler {

    private fallbackResponses = [
        "I'm not sure I understand. Could you please rephrase that?",
        "I didn't catch that. Can you try asking in a different way?",
        "I'm having trouble understanding. Could you be more specific?",
        "I'm not able to help with that right now. Is there something else I can assist you with?"
    ];

    async handle(message: any, conversation: any, intentResult: any): Promise<any> {
        const fallbackCount = conversation.context.fallbackCount || 0;

        // Escalate to human after 3 fallbacks
        if (fallbackCount >= 2) {
            return {
                text     : "I'm having difficulty understanding your request. Let me connect you with a human agent who can better assist you.",
                type     : 'human_handoff',
                metadata : {
                    reason        : 'repeated_fallback',
                    fallbackCount : fallbackCount + 1
                }
            };
        }

        // Update fallback count
        conversation.context.fallbackCount = fallbackCount + 1;

        const responseIndex = Math.min(fallbackCount, this.fallbackResponses.length - 1);

        return {
            text     : this.fallbackResponses[responseIndex],
            type     : 'fallback',
            metadata : {
                fallbackCount   : fallbackCount + 1,
                originalMessage : message.content
            }
        };
    }

}
