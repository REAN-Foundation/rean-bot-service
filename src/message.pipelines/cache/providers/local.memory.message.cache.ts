import { IMessageCache } from "../message.cache.interface";
import { SerializableMessage } from "../../../domain.types/message";

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

    public clearCache(): void {
        this.cache.clear();
    }

}
