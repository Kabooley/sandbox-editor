/*********************************************************************
 * idb-keyvalの使い方を確認するためのテスト
 * 本プロジェクトには関係ないので用が済んだら削除
 * *******************************************************************/
import 'mocha/mocha';
import * as chai from 'chai';
import { createStore, set, get, del, promisifyRequest } from 'idb-keyval';
import { reportBrowserTest } from './utils/reportBrowserTest';

const dbName = 'dummy-db-for-test';
const storeName = 'dummy-store-for-test';
let customStore: import('idb-keyval').UseStore | undefined;


mocha.setup({
  ui: 'tdd',
  rootHooks: {
    beforeAll() {
      customStore = createStore(dbName, storeName);
    },
    async afterAll() {
      if (customStore !== undefined) {
        await promisifyRequest(indexedDB.deleteDatabase(dbName));
        customStore = undefined;
      }
    },
  },
  timeout: 5000
});
mocha.checkLeaks();

(async () => {
  suite('test idb-keyval', () => {
    test('should get "woof" after stored {woof: "woof" }', async function () {
      await set('woof', 'WOOF', customStore);
      chai.assert.strictEqual(await get('woof', customStore), 'WOOF');
    });

    test('del', async () => {
      await set('foo', 'bar', customStore);
      await del('foo', customStore);
      chai.assert.strictEqual(await get('foo', customStore), undefined);
    });
  });

  const runner = mocha.run();
  reportBrowserTest(runner);
})();
