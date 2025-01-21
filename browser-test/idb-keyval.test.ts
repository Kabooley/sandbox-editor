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
  suite('test idb-keyval', () => {
    const dummyDB = createStore(dbName, storeName);
    chai.assert.fail();
  });

  mocha.run();
})();
