/*********************************************************************
 * Test src/worker/bundle.worker.ts on browser.
 *
 * *******************************************************************/
import 'mocha/mocha';
import * as chai from 'chai';
import * as Comlink from 'comlink';
import { files } from '../src/data/files';
import type { iFile } from '../src/data/types';
import { generateTreeForBundler } from '../src/utils/generateTreeForBundler';
import { getLasComponentFromPath } from '../src/utils/getLasComponentFromPath';
import type { iBundlerApi } from '../src/worker/bundle.worker';

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

      console.log(db);
      console.log(storeName);

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

    // // そんなdbは存在しない
    // request.onupgradeneeded = (e) => {
    //   console.error('[checkDBAndStoreGenerated] Error: db is not exist');
    //   reject('Error: db is not exist');
    // };
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

/***
 * tree case 1: TypeScriptとcssだけのファイル群
 * */
const dummyFiles1: iFile[] = [
  {
    path: 'src/App.tsx',
    language: 'typescript',
    selected: false,
    opening: false,
    tabIndex: null,
    value: `
 import React from 'react';
 import "./styles.css";
 
 export default function App(): React.JSX.Element {
 return (
   <div className="App">
     <h1>Hello CodeSandbox</h1>
     <h2>Start editing to see some magic happen!</h2>
   </div>
 );
 };
     `,
    isFolder: false,
  },
  {
    path: 'src/index.tsx',
    language: 'typescript',
    selected: false,
    opening: false,
    tabIndex: null,
    value: `
 import React from "react";
 import ReactDOM from "react-dom/client";
 import App from "./App";
 
 const rootElement = document.getElementById("root");
 if(rootElement) {
 const root = ReactDOM.createRoot(rootElement);
 
 root.render(
   <React.StrictMode>
     <App />
   </React.StrictMode>
 );   
 }`,
    isFolder: false,
  },
  {
    path: 'src/styles.css',
    language: 'css',
    selected: false,
    opening: false,
    tabIndex: null,
    value: `.App {
       font-family: sans-serif;
       text-align: center;
     }
     `,
    isFolder: false,
  },
];

const dummyFiles2 = [
  {
    path: 'src/Calculator.ts',
    language: 'typescript',
    selected: false,
    opening: false,
    tabIndex: null,
    value: `// Calculator.ts
 
 export class Calculator {
     // Adds two numbers
     add(a: number, b: number): number {
         return a + b;
     }
 
     // Subtracts the second number from the first
     subtract(a: number, b: number): number {
         return a - b;
     }
 
     // Multiplies two numbers
     multiply(a: number, b: number): number {
         return a * b;
     }
 
     // Divides the first number by the second
     divide(a: number, b: number): number {
         if (b === 0) {
             throw new Error("Division by zero is not allowed.");
         }
         return a / b;
     }
 }
 
     `,
    isFolder: false,
  },
  {
    path: 'src/index.ts',
    language: 'typescript',
    selected: false,
    opening: false,
    tabIndex: null,
    value: `
 import { Calculator } from './Calculator';
 import './styles.css';
 
 const calculator: Calculator = new Calculator();
 
 console.log("Addition:", calculator.add(5, 3));         // Output: 8
 console.log("Subtraction:", calculator.subtract(5, 3)); // Output: 2
 console.log("Multiplication:", calculator.multiply(5, 3)); // Output: 15
 console.log("Division:", calculator.divide(5, 2));       // Output: 2.5
 
 // Uncommenting the next line will throw an error
 // console.log("Division by zero:", calculator.divide(5, 0));
 
 const heading = document.createElement('h1');
 heading.innerText = calculator.add(10, 10) + "";
 document.body.appendChild(heading);
 `,
    isFolder: false,
  },
  {
    path: 'src/styles.css',
    language: 'css',
    selected: false,
    opening: false,
    tabIndex: null,
    value: `.App {
   font-family: sans-serif;
   text-align: center;
     }`,
    isFolder: false,
  },
];

// helper
const containsString = (source: string, search: string): boolean => {
  // Normalize line breaks to '\n'
  const normalizedSource = source
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n/, '');
  const normalizedSearch = search
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n/, '');

  console.log(normalizedSource);
  console.log(normalizedSearch);

  return normalizedSource.includes(normalizedSearch);
};

mocha.setup('tdd');
mocha.checkLeaks();

/***
 * test bundle.worker.ts
 *
 * - localforageはINDEXEDDB driverを選択している
 *
 * テスト：
 * - typescriptファイルはただしくトランスパイルされているか
 * - reactファイルはただしくトランスパイルされているか
 * - エントリーポイントからたどれるすべての相対パスのファイルは取り込まれているか
 * - 依存関係はすべて取得されているか
 * - cssファイルはstyle要素を埋め込むJavaScriptファイルに変換されているか
 * - imgファイルは
 * - svgファイルは
 * - workerが呼び出すlocalforageは指定のIndexedDBのdbとstoreを生成しているか
 *
 * 要修正：
 *
 * - TODO: localforageではなくidb-keyvalでいいのでは？
 * - TODO: src/Storage/index.tsの"jbook"表記をすべて修正
 * - TODO: 名称変更：src/utils/getLasComponentFromPath.ts -> src/utils/getLastPathnameComponent()
 * - TODO: "src/Bundle/plugins/virtualTreePlugin.ts"のunpkg取得はhttpsから取得するようにすること
 *
 * NOTE: not loadable pluginのエラーが出た場合、entryPointが正しいpathになっているか、esbuildwasmのバージョンが依存関係とバージョンが一致しているか確認すること
 * */
(async () => {
  let worker: Worker | undefined;
  let api: Comlink.Remote<iBundlerApi>;
  const dbName = 'sandbox-editor-cache-db';
  const storeName = 'keyvaluepairs';
  // const dummyTree = generateTreeForBundler(files);

  const generateWorkerAndApi = () => {
    try {
      worker = new Worker(
        new URL('../src/worker/bundle.worker.ts', import.meta.url),
        { type: 'module' }
      );
      api = Comlink.wrap<iBundlerApi>(worker);
      worker.onerror = (e) => {
        console.error(e);
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

  suite('Worker thread should be generated correctly', () => {
    test('generated successfully', () => {
      try {
        chai.expect(generateWorkerAndApi).to.not.throw();
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error(e);
        }
        chai.assert.fail();
      }
    });
  });

  // /**
  //  * Test if localforage generates db and store as specified.
  //  * */
  // suite('IndexedDB db and store should be generated', () => {
  //   test(`${dbName} db and ${storeName} store should be generated`, async () => {
  //     try {
  //       chai
  //         .expect(() => checkDBAndStoreGenerated(dbName, storeName))
  //         .to.not.throw();
  //       const result = await checkDBAndStoreGenerated(dbName, storeName);
  //       chai.assert.strictEqual(result, true);
  //     } catch (e) {
  //       console.error(e);
  //       chai.assert.fail();
  //     }
  //   });
  // });

  /***
   * `getLasComponentFromPath`と`generateTreeForBundle`が正しい前提
   *
   * - `*.css`ファイルは動的にstyle要素を生成して要素.innerText = ファイルの中身をするJavaScriptファイルになっていること
   * - 相対pathでimportされるファイルはすべてfilesから取得されていること
   * -
   *
   *
   ***/
  suite('bundler() should generate bundled file as expected.', () => {
    let bundledCode = '';

    test('bundle dummyFiles2 successfully:', async () => {
      try {
        const dummyTree = generateTreeForBundler(dummyFiles2);
        bundledCode = await api.bundler(
          getLasComponentFromPath('src/index.ts'),
          dummyTree
        );

        console.log(bundledCode);

        chai.expect(bundledCode.length).to.be.greaterThan(0);
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error(e);
        }
        chai.assert.fail();
      }
    }, 10000);

    test('Bundled code should includes src/index.ts', () => {
      const isIncluding = bundledCode.includes('// virtual-file:src/index.ts');
      chai.assert.strictEqual(isIncluding, true);
    });

    test('Bundled code should includes src/Calculator.ts', () => {
      const isIncluding = bundledCode.includes(
        '// virtual-file:src/Calculator.ts'
      );
      chai.assert.strictEqual(isIncluding, true);
    });

    test('Bundled code should includes JavaScript code converted from src/styles.css', () => {
      const f = dummyFiles2.find((d) => d.path === 'src/styles.css');
      if (f !== undefined) {
        const isIncludingLine1 = bundledCode.includes(
          '// virtual-file:src/styles.css'
        );
        const isIncludingLine2 = bundledCode.includes(
          'var style = document.createElement("style");'
        );
        // virtulTreePllugin.tsでは`\n`だけエスケープしているのでその通りにする
        const isIncludingLine3 = bundledCode.includes(
          'style.innerText = "' + f.value.replace(/[\n]+/g, '') + '";'
        );
        const isIncludingLine4 = bundledCode.includes(
          'document.head.appendChild(style);'
        );
        chai.assert.strictEqual(
          isIncludingLine1 &&
            isIncludingLine2 &&
            isIncludingLine3 &&
            isIncludingLine4,
          true
        );
      }
    });

    // .cssファイルが複数でも正しく取り込まれているのか確認
    // ECMAScriptファイルがCJSに変換されていることの確認
    // TypeScriptがただしくトランスパイルされていることの確認
    // 依存関係はすべて取り込まれているか確認
    //
    // suite()
  });

  mocha.run();
})();
