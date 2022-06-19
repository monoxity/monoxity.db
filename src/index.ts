import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { RowData, MonoxityDBOpts } from "./interfaces";

export class MonoxityDB {
  private database: Database;
  private table: string;
  private fileName: string;
  private initialized: boolean = false;

  /**
   * @param opts MonoxityDBOpts
   */
  public constructor(opts: MonoxityDBOpts) {
    this.table = opts?.table || "monoxity";
    this.fileName = opts?.fileName || "monoxity";
  }

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
  public async connect(): Promise<boolean> {
    this.database = await open({
      filename: `./${this.fileName}.db`,
      driver: sqlite3.Database,
    }).catch(() => null);

    if (this.database) {
      const success = await this.database.run(
        `CREATE TABLE IF NOT EXISTS '${this.table}' (key TEXT PRIMARY KEY, value TEXT)`
      );

      this.initialized = success ? true : false;
    }

    return this.initialized;
  }

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
  public async set(
    key: string | number,
    value: any
  ): Promise<{ key: string | number; value: any } | false> {
    this.isReady();
    const success = await this.database
      .run(
        `INSERT OR REPLACE INTO '${this.table}' (key, value) VALUES (?, ?);`,
        key,
        JSON.stringify(value)
      )
      .catch(() => null);

    return success ? { key, value } : false;
  }

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
  public async push(
    key: string | number,
    value: any,
    destroyDuplicates?: boolean
  ): Promise<{ key: string | number; value: any } | false> {
    this.isReady();
    let currentData = await this.get(key, []);
    if (!Array.isArray(currentData)) {
      throw new Error("[MonoxityDB] Provided key does not return an array");
    }

    currentData.push(value);

    if (destroyDuplicates) {
      currentData = [...new Set(currentData)];
    }

    const success = await this.database.run(
      `INSERT OR REPLACE INTO '${this.table}' (key, value) VALUES (?, ?);`,
      key,
      JSON.stringify(currentData)
    );

    return success ? { key, value } : false;
  }

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
  public async pull(
    key: string | number,
    value: any
  ): Promise<{ key: string | number; value: any } | false> {
    this.isReady();
    let currentData = await this.get(key, []);
    if (!Array.isArray(currentData)) {
      throw new Error("[MonoxityDB] Provided key does not return an array");
    }

    currentData.splice(currentData.indexOf(value), 1);

    const success = await this.database.run(
      `INSERT OR REPLACE INTO '${this.table}' (key, value) VALUES (?, ?);`,
      key,
      JSON.stringify(currentData)
    );

    return success ? { key, value } : false;
  }

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
  public async get<T>(key: string | number, defaultValue?: any): Promise<T> {
    this.isReady();
    const data = await this.database.get(
      `SELECT * FROM '${this.table}' WHERE key = ?`,
      key
    );
    return data ? JSON.parse(data["value"]) : defaultValue;
  }

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
  public async getAll(key?: string | number): Promise<RowData[]> {
    this.isReady();
    const q = key
      ? `SELECT * FROM '${this.table}' WHERE key LIKE '%${key}%';`
      : `SELECT * FROM '${this.table}'`;
    const data = await this.database.all(q);
    return data.map((data: any) => ({
      key: data["key"],
      value: JSON.parse(data["value"]),
    }));
  }

  /**
   * Returns an array of the first amount of values from the database
   *
   * @param limit
   * @param key
   * @returns Promise<any[]>
   * @example
   * const data = await database.getFirst(10, "key");
   */
  public async getFirst(
    limit: number,
    key?: string | number
  ): Promise<RowData[]> {
    this.isReady();
    const q = key
      ? `SELECT * FROM '${this.table}' WHERE key LIKE '%${key}%' LIMIT ${
          limit || 5
        };`
      : `SELECT * FROM '${this.table}' LIMIT ${limit || 5};`;
    const data = await this.database.all(q);
    return data.map((data: any) => ({
      key: data["key"],
      value: JSON.parse(data["value"]),
    }));
  }

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
  public async delete(key: string | number): Promise<boolean> {
    this.isReady();
    const success = await this.database
      .run(`DELETE FROM '${this.table}' WHERE key = ?`, key)
      .catch(() => null);
    return success ? true : false;
  }

  /**
   * Delete all data from the database table
   *
   * @returns Promise<boolean>
   *
   * @example
   * await database.destroy();
   */
  public async destroy(): Promise<boolean> {
    this.isReady();
    const success = await this.database
      .run(`DELETE FROM '${this.table}'`)
      .catch(() => null);
    return success ? true : false;
  }

  /**
   * Return a number of rows in the database
   *
   * @returns Promise<number>
   *
   * @example
   * const rows = await database.rowCount();
   */
  public async rowCount(): Promise<number> {
    this.isReady();
    const data = await this.database.get(
      `SELECT count(*) FROM '${this.table}'`
    );
    return data["count(*)"];
  }

  private isReady() {
    if (!this.initialized) {
      throw new Error("[MonoxityDB] SQLite has not been initialized");
    }
  }
}
