import { RowData, MonoxityDBOpts } from "./interfaces";
export declare class MonoxityDB {
    private database;
    private table;
    private fileName;
    private initialized;
    /**
     * @param opts MonoxityDBOpts
     */
    constructor(opts: MonoxityDBOpts);
    /**
     * Connect to SQLite (initialize database)
     *
     * @returns Promise<boolean>
     *
     * @example
     * import { MonoxityDB } from "monoxity.db";
     * const database = new MonoxityDB({
     *    table: "monoxity",
     *    fileName: "monoxity"
     * });
     *
     * await database.connect();
     */
    connect(): Promise<boolean>;
    /**
     * Set a value of a key in the database
     *
     * @param key
     * @param value
     *
     * @returns Promise<{ key: string | number, value: any } | false>
     *
     * @example
     * await database.set("key", "newValue");
     */
    set(key: string | number, value: any): Promise<{
        key: string | number;
        value: any;
    } | false>;
    /**
     *
     * @param key
     * @param value
     * @param destroyDuplicates
     *
     * @returns Promise<{ key: string | number, value: any } | false>
     *
     * @example
     * await database.push("key", "value");
     */
    push(key: string | number, value: any, destroyDuplicates?: boolean): Promise<{
        key: string | number;
        value: any;
    } | false>;
    /**
     *
     * @param key
     * @param value
     *
     * @returns Promise<{ key: string | number; value: any } | false>
     *
     * @example
     * const data = await database.pull("key", "value");
     */
    pull(key: string | number, value: any): Promise<{
        key: string | number;
        value: any;
    } | false>;
    /**
     * Get a value from a key or optionally fallback to a default value
     *
     * @param key
     * @param defaultValue
     *
     * @returns Promise<any>
     *
     * @example
     * const data = await database.get("key", "defaultValue");
     */
    get<T>(key: string | number, defaultValue?: any): Promise<T>;
    /**
     * Return an array of all values from the database
     *
     * @param key
     *
     * @returns Promise<any[]>
     *
     * @example
     * const data = await database.getAll();
     */
    getAll(key?: string | number): Promise<RowData[]>;
    /**
     * Returns an array of the first amount of values from the database
     *
     * @param limit
     * @param key
     * @returns Promise<any[]>
     * @example
     * const data = await database.getFirst(10, "key");
     */
    getFirst(limit: number, key?: string | number): Promise<RowData[]>;
    /**
     * Delete a key from the database
     *
     * @param key
     *
     * @returns Promise<boolean>
     *
     * @example
     * await database.delete("key");
     */
    delete(key: string | number): Promise<boolean>;
    /**
     * Delete all data from the database table
     *
     * @returns Promise<boolean>
     *
     * @example
     * await database.destroy();
     */
    destroy(): Promise<boolean>;
    /**
     * Return a number of rows in the database
     *
     * @returns Promise<number>
     *
     * @example
     * const rows = await database.rowCount();
     */
    rowCount(): Promise<number>;
    private isReady;
}
