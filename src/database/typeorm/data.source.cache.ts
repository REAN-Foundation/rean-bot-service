import { DataSource } from "typeorm";

export class DataSourceCache {

    public static readonly _cache = new Map<string, DataSource>();

    public static get(key: string): DataSource {
        return DataSourceCache._cache[key];
    }

    public static set(key: string, value: DataSource): void {
        DataSourceCache._cache[key] = value;
    }

    public static has(key: string): boolean {
        return !!DataSourceCache._cache[key];
    }

    public static remove(key: string): void {
        delete DataSourceCache._cache[key];
    }

}
