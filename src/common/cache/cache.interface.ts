export interface ICache<T> {
    set(key: string, value: T): Promise<void>;
    get(key: string): Promise<T | undefined>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    findAndClear(searchPattern: string): Promise<string[]>;
}
