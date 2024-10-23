/*********************************************************************
 * Test src/worker/fetchLibs.worker.ts on browser.
 *
 * *******************************************************************/
import 'mocha/mocha';
import * as chai from 'chai';
import * as Comlink from 'comlink';
import { get as getItem, set as setItem, createStore } from 'idb-keyval';
import type { iFetchLibsApi } from '../src/worker/fetchLibs.worker';

// 指定のdbNameであるdbとそのdbにあるストアstoreNameが存在するか否かを返す関数
const checkDBAndStoreGenerated = (dbName: string, storeName: string) => {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = window.indexedDB.open(dbName);

    // 起動に失敗
    request.onerror = () => {
      console.error(
        '[checkDBAndStoreGenerated] Error while requesting indexeddb'
      );
      reject('Error while requesting indexeddb');
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

    // そんなdbは存在しない
    request.onupgradeneeded = (e) => {
      console.error('[checkDBAndStoreGenerated] Error: db is not exist');
      reject('Error: db is not exist');
    };
  });
};

// 指定のdbのstoreからkeyを指定することでそのkeyに対応する値を取得する関数
const getDataByKeyFromDBStore = (
  dbName: string,
  store: string,
  key: string
) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName);

    // そんなdbNameのdbがないとき
    request.onupgradeneeded = (e) => {
      console.error(
        '[getDataByKeyFromDBStore] Error: Not exist such a db:',
        dbName
      );
      reject('Error: Not exist such a db');
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

    // dbNameに該当するdbの起動失敗
    request.onerror = (e) => {
      console.error(
        '[getDataByKeyFromDBStore] Error: Failed to open db:',
        dbName
      );
      reject('Error: Failed to open db');
    };
  });
};

// 指定のdbのstoreからkeyを指定することでそのkeyと値が削除されているか確認する
// true: keyは存在する、 false: keyは存在しない
const checkDataExistByKeyFromDBStore = (
  dbName: string,
  store: string,
  key: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName);

    // そんなdbNameのdbがないとき
    request.onupgradeneeded = (e) => {
      console.error(
        '[checkDataExistByKeyFromDBStore] Error: Not exist such a db:',
        dbName
      );
      reject('Error: Not exist such a db');
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

    // dbNameに該当するdbの起動失敗
    request.onerror = (e) => {
      console.error(
        '[checkDataExistByKeyFromDBStore] Error: Failed to open db:',
        dbName
      );
      reject('Error: Failed to open db');
    };
  });
};

mocha.setup('tdd');
mocha.checkLeaks();

/***
 * TODO: テストがすべて終了したらworkerインスタンスとComlinkの生成物をそれぞれterminate
 *
 * */
(async () => {
  let worker: Worker | undefined;
  let api: Comlink.Remote<iFetchLibsApi>;
  const db1 = 'sandbox-editor--modulename-n-version--cache-v1-db';
  const store1 = 'sandbox-editor--modulename-n-version--cache-v1-store';
  const db2 = 'sandbox-editor--set-of-dependency--cachde-v1-db';
  const store2 = 'sandbox-editor--set-of-dependency--cachde-v1-store';

  const generateWorkerAndApi = () => {
    try {
      worker = new Worker(
        new URL('../src/worker/fetchLibs.worker.ts', import.meta.url),
        { type: 'module' }
      );
      api = Comlink.wrap<iFetchLibsApi>(worker);
      worker.onerror = (e) => {
        console.error(e);
        console.error(e.message);
        throw e;
      };
    } catch (e) {
      console.error('Error during generating worker or api');
      throw e;
    }
  };

  suite('Environment should support WebWorker', () => {
    test('Environment should support WebWorker', () => {
      chai.expect(window.Worker).to.not.be.undefined;
      chai.expect(window.Worker).to.not.be.null;
    });
  });

  /***
   * Worker(): SecurityError, NetworkError, SyntaxError
   *
   *
   * */
  suite('Worker thread should be generated correctly', () => {
    test('generated successfully', () => {
      try {
        chai.expect(generateWorkerAndApi).to.not.throw();
      } catch (e) {
        console.error('Anyway worker or api failed to be generated.');
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error(e);
        }
        chai.assert.fail();
      }
    });
  });

  suite('Indexed db and store should be generated as expected', () => {
    test('basic idb-keyval', async () => {
      try {
        const _s = createStore('test-db-fdjfskds', 'test-store-fjgfdsdjsl');
        await setItem('foo', 'FOO', _s);
        const item = await getItem('foo', _s);
        const isGen: boolean = (await checkDBAndStoreGenerated(
          'test-db-fdjfskds',
          'test-store-fjgfdsdjsl'
        )) as boolean;
        chai.assert.strictEqual(isGen, true);
        chai.assert.strictEqual(item, 'FOO');
      } catch (e) {
        console.log(e);
        chai.assert.fail();
      }
    });
  });

  suite('IndexedDB db and store should be generated', () => {
    test('', async () => {
      try {
        chai.expect(() => checkDBAndStoreGenerated(db1, store1)).to.not.throw();
        chai.expect(() => checkDBAndStoreGenerated(db2, store2)).to.not.throw();
        const result1 = await checkDBAndStoreGenerated(db1, store1);
        const result2 = await checkDBAndStoreGenerated(db2, store2);
        chai.assert.strictEqual(result1, true);
        chai.assert.strictEqual(result2, true);
      } catch (e) {
        console.error(e);
        chai.assert.fail();
      }
    });
  });

  suite('api.fetchLibs()', () => {
    test('should get axios@1.7.7', async () => {
      const { moduleName, version, vfs } = await api.fetchLibs(
        'axios',
        '1.7.7'
      );

      chai.assert.strictEqual(moduleName, 'axios');
      chai.assert.strictEqual(version, '1.7.7');

      chai.expect(vfs).to.be.a('map');
      chai.expect(vfs.size).to.be.greaterThan(0);
    });

    test('axios@1.7.7 should be saved in IndexedDB', async () => {
      try {
        const value = await getDataByKeyFromDBStore(db1, store1, 'axios@1.7.7');
        chai.assert.strictEqual(value, 'axios@1.7.7');
      } catch (e) {
        console.error(e);
        chai.assert.fail();
      }
    });
  });

  suite('api.isAlreadyExist()', () => {
    test('should exist `axios@1.7.7` already', async () => {
      const result = await api.isAlreadyExist('axios', '1.7.7');
      chai.assert.strictEqual(result, true);
    });

    test('Should be false if passed non-exist module', async () => {
      const result = await api.isAlreadyExist('react', '17.0.2');
      chai.assert.strictEqual(result, false);
    });
  });

  /**
   * removeLibs() returns array of deleted module's dependencies path.
   * removeLibs() returns promise but has no catch block.
   *
   * - should return deleted module's dependencies path
   * - should have no `axios@1.7.7' key and value in store1 and store2
   * - 存在しないモジュールを指定した場合どうなるか確認
   * */
  suite('api.removeLibs():', () => {
    test('Should remove axios@1.7.7 from IndexedDB', async () => {
      try {
        const deletionPaths = await api.removeLibs('axios', '1.7.7');
        chai.expect(deletionPaths.length).to.be.greaterThan(0);
        const isExistInStore1: boolean = await checkDataExistByKeyFromDBStore(
          db1,
          store1,
          'axios@1.7.7'
        );
        const isExistInStore2: boolean = await checkDataExistByKeyFromDBStore(
          db2,
          store2,
          'axios@1.7.7'
        );
        chai.assert.strictEqual(isExistInStore1, false);
        chai.assert.strictEqual(isExistInStore2, false);
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
          chai.assert.fail();
        } else {
          console.error(e);
          chai.assert.fail();
        }
      }
    });

    test('Should get empty array if non exist dependencies has passed', async () => {
      const emptyArr: string[] = await api.removeLibs('react', '17.0.2');
      chai.expect(emptyArr.length).to.be.equal(0);
    });
  });

  /***
   * IndexedDB db set of dependencyから指定の依存関係を返す関数
   * 指定の依存関係がない場合、vfsはundefinedになり、notCachedはfalseになるはず
   * */
  suite('api.getCachedModule(): ', () => {
    test('Should get "axios@1.7.7" vfs', async () => {
      await api.fetchLibs('axios', '1.7.7');
      const { moduleName, version, vfs, notCached } = await api.getCachedModule(
        'axios',
        '1.7.7'
      );
      chai.assert.strictEqual(notCached, false);
      chai.assert.isDefined(vfs);
      chai.expect(vfs.size).to.be.greaterThan(0);
      chai.assert.strictEqual(moduleName, 'axios');
      chai.assert.strictEqual(version, '1.7.7');
    });
    test('Should get empty vfs if passed non exist dependency', async () => {
      const { vfs, notCached } = await api.getCachedModule('react', '17.0.2');
      chai.assert.strictEqual(notCached, true);
      chai.assert.isUndefined(vfs);
    });
  });

  suite('api.getModuleDependenciesPath(): ', () => {
    test('Should return paths of axios@1.7.7 typed files', async () => {
      const paths = await api.getModuleDependenciesPath('axios', '1.7.7');
      chai.expect(paths.length).to.be.greaterThan(0);
      paths.forEach((p) => {
        chai.assert.isTrue(
          p.startsWith('/node_modules/axios'),
          'String does not start with "/node_modules/axios"'
        );
      });
    });
  });

  // // mocha/mochaだとafterが呼び出せないため
  // suite('[Not test] Clean up', () => {
  //   test('Terminate worker instance and Comlink proxy', () => {
  //     worker && worker.terminate();
  //     api && api[Comlink.releaseProxy]();
  //   });
  //   // TODO: IndexedDBもドロップして
  // });

  mocha.run();
})();
