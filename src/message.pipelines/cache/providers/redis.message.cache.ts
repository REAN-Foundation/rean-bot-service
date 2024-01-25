/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMessageCache } from "../message.cache.interface";
import { SerializableMessage } from "../../../types/common.types";

///////////////////////////////////////////////////////////////////////

export default class RedisMessageCache implements IMessageCache {

    // Implement Redis-based cache logic here
    // ...
    public addMessage(sessionId: string, message: SerializableMessage): void {
        // Implement Redis-based addMessage logic here
    }

    public getMessages(sessionId: string): SerializableMessage[] | undefined {
        // Implement Redis-based getMessages logic here
        return undefined;
    }

    public clearCache(): void {
        // Implement Redis-based clearCache logic here
    }

    public removeMessages(sessionId: string): void {
        throw new Error("Method not implemented.");
    }

    public updateMessage(sessionId: string, message: SerializableMessage): void {
        throw new Error("Method not implemented.");
    }

}
