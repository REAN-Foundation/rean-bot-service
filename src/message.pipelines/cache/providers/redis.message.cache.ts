/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMessageCache, StoredMessage } from "../message.cache.interface";

///////////////////////////////////////////////////////////////////////

export default class RedisMessageCache implements IMessageCache {

    // Implement Redis-based cache logic here
    // ...
    public addMessage(sessionId: string, message: StoredMessage): void {
        // Implement Redis-based addMessage logic here
    }

    public getMessages(sessionId: string): StoredMessage[] | undefined {
        // Implement Redis-based getMessages logic here
        return undefined;
    }

    public clearCache(): void {
        // Implement Redis-based clearCache logic here
    }

}
