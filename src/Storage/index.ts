import localforage from 'localforage';

/***
 * NOTE: いかなるlocalforageのAPIを使うよりも前に呼び出さなくてはならない。
 *
 * https://github.com/localForage/localForage?tab=readme-ov-file#configuration
 * */
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'sandbox-editor',
  storeName: 'keyvaluepairs',
  version: 1.0,
  description: 'indexeddb for sandbox-editor',
});

export const createDBInstance = (configs: LocalForageOptions): LocalForage => {
  return localforage.createInstance(configs);
};
