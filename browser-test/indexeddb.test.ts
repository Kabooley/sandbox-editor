/**
 * IndexedDB APIの基本操作を理解するためのテスト
 *
 * - DBの作成、確認
 * - storeの作成、確認
 * - データの追加、変更、削除
 * -
 *
 * 参考：
 * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 */
/**
 * めも：
 *
 * たとえばidb-keyvalで`createStore("mydb", "mystore")`して、
 * そのご`window.indexedDB.open("mydb")`した場合、
 * 新規またはバージョン違いの"mydb"をリクエストしたということで
 * "onupgradeneeded"が発火し"mystore"storeにはそのリクエスト以降アクセスできなくなるのかも...
 *
 *
 * */
import 'mocha/mocha';
import * as chai from 'chai';

const dbName = '__mydb__';
const storeName = '__mystore__';

mocha.setup({
  rootHooks: {
    beforeEach() {
      console.log('before each');
    },
    afterAll() {
      console.log('after all');
      // const deleteRequest = indexedDB.deleteDatabase(dbName);
      // deleteRequest.onerror = (e) => console.error(e);
      // deleteRequest.onsuccess = () =>
      //   console.log(`db ${dbName} has been deleted successfully`);
    },
  },
  ui: 'tdd',
});
mocha.checkLeaks();

(async () => {
  // TODO: test前にテスト対象のDBが存在するなら削除しておく

  // browserがIndexed APIをサポートしているか
  suite('make sure IndexedDB support on this browser', () => {
    test('should support IndexedDB on this browser', () => {
      chai.assert.isOk('indexedDB' in window);
    });
  });

  suite('basic', () => {
    let db: IDBDatabase;
    /**
     * わかったこと：
     *
     * - `indexedDB.open()`は直ちに指定のデータベースを開くのではなくリクエスト結果を含んだオブジェクトを返す
     * - 存在しないデータベースにopenリクエストを出してもエラーにはならない
     * - 存在しないデータベースにopenリクエストを出した場合、`onupgradeneeded`イベントが発火し、そのデータベースが新規に作成される
     * - 既存のdatabase名かつ現バージョンに対してopen()リクエストした場合upgradeneededは発火しない
     * - 既存のdatabase名かつ現バージョンに対してopen()リクエストした場合upgradeneededは発火しないため既存のstoreも変更はなく、引き続き既存のstoreは維持される
     * - 既存のdatabase名で現バージョンより上のバージョンを指定してopen()すると、そのdatabaseのstoreは消える
     * - `indexedDB.open()`の第二引数はデータベースのバージョンの指定である
     * - TODO: indexとは
     */
    test('Should open non exist database', async () => {
      const request: IDBOpenDBRequest = indexedDB.open(dbName, 1);
      request.onerror = (e) => {
        console.error(e);
        chai.assert.fail();
      };
      request.onupgradeneeded = (e) => {
        console.log('upgrade needed');
        const _db = (e.target as IDBOpenDBRequest).result;
        // Create an objectStore for this database
        const objectStore = _db.createObjectStore(storeName, {
          keyPath: 'taskTitle',
        });

        // define what data items the objectStore will contain
        objectStore.createIndex('hours', 'hours', { unique: false });
        objectStore.createIndex('minutes', 'minutes', { unique: false });
        objectStore.createIndex('day', 'day', { unique: false });
        objectStore.createIndex('month', 'month', { unique: false });
        objectStore.createIndex('year', 'year', { unique: false });

        // finished before adding data into it.
        objectStore.transaction.oncomplete = (event) => {
          console.log('complete objectStore creation.');
        };
      };
      // request.resultを扱うならここ
      // request.resultもe.target.resultも同じ模様
      request.onsuccess = (e) => {
        console.log('open success');
        // console.log(request.result);
        // console.log(e.target.result);
        db = request.result;
        chai.assert.isDefined(db);
      };
    });
    /**
     * わかったこと：
     *
     * - すでに開いているDBを再度openさせても特にエラーにはならない
     * onupgradeneededも発火しない。
     * - 上記の理由でstoreもそのままであることも確認した
     */
    test('Should open already opening database', async () => {
      const request: IDBOpenDBRequest = indexedDB.open(dbName, 1);
      request.onerror = (e) => {
        console.error(e);
        chai.assert.fail();
      };
      request.onupgradeneeded = () => {
        console.log('upgrade needed');
      };
      request.onsuccess = (e) => {
        console.log('open success');
        console.log(e);
        // TODO: 上のtestで作成したstoreが存在することを確認すること
      };
    });

    // /**
    //  * わかったこと：
    //  *
    //  * - `open()`リクエストで新規のDBをリクエストした場合`onupgradeneeded`が発火する
    //  * - `open()`リクエストのバージョン指定が現在のバージョンより高い場合も`onupgradeneeded`が発火する
    //  *
    //  * つまりバージョンごとにstoreを設けなくてはならない
    //  *
    //  * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#creating_or_updating_the_version_of_the_database
    //  */
    // test('Should fire `onupgradeneeded` when db version get higher( 1 -> 2 )', () => {
    //   const request: IDBOpenDBRequest = indexedDB.open(dbName, 2);
    //   request.onerror = (e) => {
    //     console.error(e);
    //     chai.assert.fail();
    //   };
    //   request.onupgradeneeded = (e) => {
    //     console.log('upgrade needed');
    //     chai.assert.strictEqual(
    //       (e.target as IDBOpenDBRequest).result.version,
    //       2
    //     );
    //   };
    //   request.onsuccess = (e) => {
    //     console.log('open success');
    //     console.log(e);
    //   };
    // });
  });

  mocha.run();
})();
