import { logger } from '../../logger/logger';

export class CacheMap<V> {

    private cache: Map<string, V>;

    constructor() {
        this.cache = new Map<string, V>();
    }

    // Method to set a value in the cache
    set(key: string, value: V): void {
        this.cache.set(key, value);
    }

    // Method to get a value from the cache
    get(key: string): V | undefined {
        logger.info(`size: ${this.cache.size}`);
        return this.cache.get(key);
    }

    // Method to check if a key exists in the cache
    has(key: string): boolean {
        return this.cache.has(key);
    }

    // Method to delete a key from the cache
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    // Method to clear the entire cache
    clear(): void {
        this.cache.clear();
    }

    // Method to get the size of the cache
    size(): number {
        return this.cache.size;
    }

    findAndClear(searchPattern: string): string[] {
        const keys: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.includes(searchPattern)) {
                keys.push(key);
            }
        }
        for (const key of keys) {
            this.cache.delete(key);
        }
        return keys;
    }

}


