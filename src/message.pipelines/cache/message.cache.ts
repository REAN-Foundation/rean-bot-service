import LocalMemoryMessageCache from "./providers/local.memory.message.cache";
import RedisMessageCache  from "./providers/redis.message.cache";
import { IMessageCache } from "./message.cache.interface";
import { SerializableMessage } from "../../domain.types/message";

///////////////////////////////////////////////////////////////////////

export default class MessageCache {

    private static _cache: IMessageCache;

    public static init(): void {
        if (!this._cache) {
            const useRedis = process.env.REDIS_MESSAGE_CACHE === 'true';
            if (useRedis) {
                this._cache = new RedisMessageCache();
            }
            else {
                this._cache = new LocalMemoryMessageCache();
            }
        }
    }

    public static addMessage(sessionId: string, message: SerializableMessage): void {
        this._cache.addMessage(sessionId, message);
    }

    public static getMessages(sessionId: string): SerializableMessage[] | undefined {
        return this._cache.getMessages(sessionId);
    }

    public static clearCache(): void {
        this._cache.clearCache();
    }

}
