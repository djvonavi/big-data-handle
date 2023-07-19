/**
 * Класс-коннектор для абстракции обращения к INDEXED DB
 */

import type { MeteoDataType } from "../types";
import {
  ALLOWED_STORE_NAMES_LIST,
  DATA_BASE_NAME,
  DATA_BASE_VERSION,
} from "../consts";

/**
 * Инициализация воркера для записи в БД
 */
const dbWorker = new Worker("/workers/dbWorker.js");

export class IndexedDbService {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase;
  private storeNames: Readonly<MeteoDataType[]>

  constructor(
    dbName: string,
    dbVersion: number = 1,
    storeNames: Readonly<MeteoDataType[]> = []
  ) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeNames = storeNames;
  }

  /**
   * Инит БД
   */
  public async initDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(this.dbName, this.dbVersion);

      openRequest.onerror = (event) => {
        reject("Ошибка при открытии базы данных: " + event);
      };

      openRequest.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;

        for (let storeName of this.storeNames) {
          if (!this.db.objectStoreNames.contains(storeName)) {
            this.db.createObjectStore(storeName);
          }
        }
      };

      openRequest.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
    });
  }

  /**
   * Метод добавления в БД
   * Добавление вынесено в webworker чтобы не блокировать основной поток
   */

  public async addData<T>(storeName: MeteoDataType, data: T[]): Promise<void> {
    if (!this.db) {
      await this.initDb();
    }
    return new Promise((resolve, reject) => {
      dbWorker.onmessage = (event) => {
        if (event.data.status === "done") {
          resolve();
        } else if (event.data.status === "error") {
          reject("Произошла ошибка в веб-воркере: " + event.data.message);
        }
      };

      dbWorker.postMessage({
        operation: "addData",
        dbName: DATA_BASE_NAME,
        dbVersion: DATA_BASE_VERSION,
        storeName: storeName,
        data,
      });
    });
  }

  /**
   * Метод получения данных по диапазону
   */

  public async getDataByRange<T>(
    storeName: MeteoDataType,
    from: string,
    to: string
  ): Promise<T[]> {
    if (!this.db) {
      await this.initDb();
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const range = IDBKeyRange.bound(from, to);
      const cursorRequest = store.openCursor(range);
      const outData: T[] = [];
      
      cursorRequest.onsuccess = (event) => {
        const result = (event.target as IDBRequest<any>).result;
        const dataItem = (event.target as IDBRequest<any>).result?.value as
          | T
          | undefined;
        if (dataItem) {
          outData.push(dataItem);
          result.continue();
        } else {
          resolve(outData);
        }
      };

      cursorRequest.onerror = (event) => {
        reject("Ошибка при чтении данных: " + event);
      };
    });
  }
}

const DB = new IndexedDbService(
  DATA_BASE_NAME,
  DATA_BASE_VERSION,
  ALLOWED_STORE_NAMES_LIST
);

export default DB
