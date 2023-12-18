export interface StoredMessage {
    id: string;
    content: string;
    timestamp: number;
}

export interface IMessageCache {
    addMessage(sessionId: string, message: StoredMessage): void;
    getMessages(sessionId: string): StoredMessage[] | undefined;
    clearCache(): void;
}
