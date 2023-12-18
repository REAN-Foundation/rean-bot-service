import { IMessageCache, StoredMessage } from "../message.cache.interface";

///////////////////////////////////////////////////////////////////////

export default class LocalMemoryMessageCache implements IMessageCache {

    private cache: Map<string, StoredMessage[]>;

    constructor() {
        this.cache = new Map<string, StoredMessage[]>();
    }

    public addMessage(sessionId: string, message: StoredMessage): void {
        if (!this.cache.has(sessionId)) {
            this.cache.set(sessionId, []);
        }
        this.cache.get(sessionId)?.push(message);
    }

    public getMessages(sessionId: string): StoredMessage[] | undefined {
        return this.cache.get(sessionId);
    }

    public clearCache(): void {
        this.cache.clear();
    }

}
