import { CacheMap } from "../common/cache/cache.map";
import type { CurrentClient } from "../domain.types/miscellaneous/current.client";
import { logger } from "../logger/logger";

///////////////////////////////////////////////////////////////////////////////////////

export class ClientAppCache {

    private cache: CacheMap<CurrentClient>;

    constructor() {
        this.cache = new CacheMap<CurrentClient>();
    }

    set = async (key: string, value: CurrentClient): Promise<void> => {
        try {
            this.cache.set(key, value);
        } catch (error) {
            logger.error('Error setting client app cache: ' + error.message);
        }
    };

    get = async (key: string): Promise<CurrentClient | undefined> => {
        try {
            return this.cache.get(key);
        } catch (error) {
            logger.error('Error getting client application from cache: ' + error.message);
            return undefined;
        }
    };

    has = async (key: string): Promise<boolean> => {
        try {
            return this.cache.has(key);
        } catch (error) {
            logger.error('Error checking client application in cache: ' + error.message);
            return false;
        }
    };

    delete = async (key: string): Promise<boolean> => {
        try {
            return this.cache.delete(key);
        } catch (error) {
            logger.error('Error deleting client application from cache: ' + error.message);
            return false;
        }
    };

    clear = async (): Promise<void> => {
        try {
            this.cache.clear();
        } catch (error) {
            logger.error('Error clearing client application cache: ' + error.message);
        }

    };

    findAndClear = async (searchPattern: string): Promise<string[]> => {
        return this.cache.findAndClear(searchPattern);
    };

    size = async (): Promise<number> => {
        try {
            return this.cache.size();
        } catch (error) {
            logger.error('Error getting size of client application cache: ' + error.message);
            return 0;
        }
    };

}
///////////////////////////////////////////////////////////////////////////////////////

export const clientAppCache = new ClientAppCache();

///////////////////////////////////////////////////////////////////////////////////////

