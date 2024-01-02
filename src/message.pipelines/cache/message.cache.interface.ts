import { SerializableMessage } from "../../types/common.types";

///////////////////////////////////////////////////////////////////////

export interface IMessageCache {

    addMessage(sessionId: string, message: SerializableMessage): void;

    getMessages(sessionId: string): SerializableMessage[] | undefined;

    removeMessages(sessionId: string): void;

    updateMessage(sessionId: string, message: SerializableMessage): void;

    clearCache(): void;
}
