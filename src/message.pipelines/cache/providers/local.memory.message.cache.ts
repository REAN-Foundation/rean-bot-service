import { IMessageCache } from "../message.cache.interface";
import { SerializableMessage } from "../../../types/common.types";

///////////////////////////////////////////////////////////////////////

export default class LocalMemoryMessageCache implements IMessageCache {

    private cache: Map<string, SerializableMessage[]>;

    constructor() {
        this.cache = new Map<string, SerializableMessage[]>();
    }

    public addMessage(sessionId: string, message: SerializableMessage): void {
        if (!this.cache.has(sessionId)) {
            this.cache.set(sessionId, []);
        }
        this.cache.get(sessionId)?.push(message);
    }

    public getMessages(sessionId: string): SerializableMessage[] | undefined {
        return this.cache.get(sessionId);
    }

    public removeMessages(sessionId: string): void {
        this.cache.delete(sessionId);
    }

    public updateMessage(sessionId: string, message: SerializableMessage): void {
        const messages = this.cache.get(sessionId);
        if (messages) {
            const index = messages.findIndex(m => m.id === message.id);
            if (index > -1) {
                messages[index] = message;
            }
        }
    }

    public clearCache(): void {
        this.cache.clear();
    }

}
