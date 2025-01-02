/***
 * Utils
 *
 */

/**
 * 指定バージョンの指定データベースに指定のstore objectが存在するか調べて
 * その結果を返す
 *
 * NOTE: 現バージョン以外を指定するとIndexedDBは新規にDBを作成し`onupgradeneeded`イベントが発火し、結果テストは失敗する。
 */
export const isIndexedDBAndStoreGenerated = (
  dbName: string,
  dbVersion: number,
  storeName: string
) => {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = window.indexedDB.open(dbName, dbVersion);

    // 起動失敗
    request.onerror = () => {
      console.error(
        '[checkDBAndStoreGenerated] Error while requesting indexeddb'
      );
      reject(`Error while requesting open indexeddb ${dbName}@${dbVersion}`);
    };

    // そんなdbは存在しない
    // または現バージョン以外を指定した
    request.onupgradeneeded = (e) => {
      console.error(
        `[checkDBAndStoreGenerated] Error: ${dbName}@${dbVersion} is not exist`
      );
      reject(`Error: ${dbName}@${dbVersion} is not exist`);
    };

    // 起動成功
    request.onsuccess = (e) => {
      const db: IDBDatabase = (e.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(storeName)) {
        console.log(`[checkDBAndStoreGenerated] the store is generated`);
        resolve(true);
      } else {
        console.error(
          '[checkDBAndStoreGenerated] Error: store is not exist in db'
        );
        reject('Error: store is not exist in db');
      }
    };
  });
};

/**
 * 指定db + versionの指定object storeへkeyを指定しそのkeyに対応する値を取得する関数
 *
 * NOTE: 現バージョン以外を指定するとIndexedDBは新規にDBを作成し`onupgradeneeded`イベントが発火し、結果テストは失敗する。
 */
export const getDataByKeyFromIndexedDBStore = (
  dbName: string,
  dbVersion: number,
  store: string,
  key: string
) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, dbVersion);

    // 起動失敗
    request.onerror = (e) => {
      console.error(
        '[checkDBAndStoreGenerated] Error while requesting indexeddb'
      );
      reject(`Error while requesting open indexeddb ${dbName}@${dbVersion}`);
    };

    // そんなdbは存在しない
    // または現バージョン以外を指定した
    request.onupgradeneeded = (e) => {
      console.error(
        `[checkDBAndStoreGenerated] Error: ${dbName}@${dbVersion} is not exist`
      );
      reject(`Error: ${dbName}@${dbVersion} is not exist`);
    };

    /***
     * IDBDatabase -> IDBTransaction -> IDBObjectStore
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
     * */
    request.onsuccess = (e) => {
      const db: IDBDatabase = (e.target as IDBOpenDBRequest).result;
      const trans: IDBTransaction = db.transaction(store, 'readonly');
      const _store: IDBObjectStore = trans.objectStore(store);
      const count: IDBRequest<number> = _store.count();
      const dataRequest = _store.get(key);
      dataRequest.onsuccess = (_e) => {
        const data: string = (_e.target as IDBRequest).result;
        resolve(data);
      };
      dataRequest.onerror = (_e) => {
        console.error(
          '[getDataByKeyFromDBStore]  Error: Failed to get data from store: ',
          store
        );
        reject('Error: Failed to get data from store: ' + store);
      };
    };
  });
};

/**
 * 指定db + versionの指定object storeへkeyを指定しそのkeyに対応する値が存在するか否かの結果を返す関数
 *
 * NOTE: 現バージョン以外を指定するとIndexedDBは新規にDBを作成し`onupgradeneeded`イベントが発火し、結果テストは失敗する。
 */
export const isDataExistsInIndexedDBStoreByKey = (
  dbName: string,
  dbVersion: number,
  store: string,
  key: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, dbVersion);

    // 起動失敗
    request.onerror = (e) => {
      console.error(
        '[checkDBAndStoreGenerated] Error while requesting indexeddb'
      );
      reject(`Error while requesting open indexeddb ${dbName}@${dbVersion}`);
    };

    // そんなdbは存在しない
    // または現バージョン以外を指定した
    request.onupgradeneeded = (e) => {
      console.error(
        `[checkDBAndStoreGenerated] Error: ${dbName}@${dbVersion} is not exist`
      );
      reject(`Error: ${dbName}@${dbVersion} is not exist`);
    };

    /***
     * IDBDatabase -> IDBTransaction -> IDBObjectStore
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
     * */
    request.onsuccess = (e) => {
      const db: IDBDatabase = (e.target as IDBOpenDBRequest).result;
      const trans: IDBTransaction = db.transaction(store, 'readonly');
      const _store: IDBObjectStore = trans.objectStore(store);
      const dataRequest = _store.get(key);
      dataRequest.onsuccess = (_e) => {
        if (dataRequest.result !== undefined) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      dataRequest.onerror = (_e) => {
        console.error(
          '[checkDataExistByKeyFromDBStore]  Error: Failed to get data from store: ',
          store
        );
        reject('Error: Failed to get data from store: ' + store);
      };
    };
  });
};

/***
 * 指定のindexedDBを削除する
 */
export const deleteIndexedDB = (dbName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase(dbName);
    request.onerror = (e) => {
      console.error(`[deleteDB] Error: Faield to delete db: ${dbName}`);
      reject(`Error: Faield to delete db: ${dbName}`);
    };
    request.onsuccess = (e) => {
      resolve();
    };
  });
};
