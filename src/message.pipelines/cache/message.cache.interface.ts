import { SerializableMessage } from "../../domain.types/message";

///////////////////////////////////////////////////////////////////////

export interface IMessageCache {

    addMessage(sessionId: string, message: SerializableMessage): void;

    getMessages(sessionId: string): SerializableMessage[] | undefined;

    clearCache(): void;
}
