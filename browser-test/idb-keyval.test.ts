/*********************************************************************
 * Test idb-keyval
 *
 * *******************************************************************/
import 'mocha/mocha';
import * as chai from 'chai';
import * as Comlink from 'comlink';
import { createStore } from 'idb-keyval';

const dbName = 'dummy-db-for-test';
const storeName = 'dummy-store-for-test';

// TODO: test初めと終わりにcacheDBを削除すること
mocha.setup({
  ui: 'tdd',
});
mocha.checkLeaks();

(async () => {
  let customStore: import('idb-keyval').UseStore | undefined;
  beforeAll(async function () {
    customStore = createStore(dbName, storeName);
  });
  afterAll(async function () {
    // TODO: dbを削除すること
  });
  suite('test idb-keyval', () => {
    test('should get "woof" after stored {woof: "woof" }', async function () {});
  });

  mocha.run();
})();
