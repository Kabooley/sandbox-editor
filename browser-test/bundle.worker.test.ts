/*********************************************************************
 * Test src/worker/bundle.worker.ts on browser.
 *
 * TODO: virtualTreePlugin.tsを別でテストする
 * TODO: このテストではidb-keyvalやIndexedDBについてテストしない。バンドル結果が期待通りであるかのみテストすること
 *
 * NOTE: src/Bundle/plugins/virtualTreePlugin.tsはIndexedDBライブラリをlocalforageからidb-keyvalへ変更した
 * NOTE: not loadable pluginのエラーが出た場合、entryPointが正しいpathになっているか、esbuildwasmのバージョンが依存関係とバージョンが一致しているか確認すること
 *
 * TODO: localforageを使わなくなったのでsrc/Storage/を削除すること
 * TODO: unpkg.comはhttpsプロトコルでアクセスするようにすること
 *
 * TODO: idb-keyvalは内部に独自のIndexedDBを管理する仕組みがあるから、生IndexedDB apiでopen()リクエストを出すことがそもそも間違い化も。生IndexedDB apiを使うのをやめてidb-keyvalだけ使うようにする
 * *******************************************************************/
import 'mocha/mocha';
import * as chai from 'chai';
import * as Comlink from 'comlink';
import {
  isDataExistsInIndexedDBStoreByKey,
  // isIndexedDBAndStoreGenerated,
  // getDataByKeyFromIndexedDBStore,
  // deleteIndexedDB,
} from './utils';
import { generateTreeForBundler } from '../src/utils/generateTreeForBundler';
import { getLasComponentFromPath } from '../src/utils/getLasComponentFromPath';
import { reportBrowserTest } from './utils/reportBrowserTest';
import { files } from '../src/data/files';
import type { iFile } from '../src/data/types';
import type { iBundlerApi } from '../src/worker/bundle.worker';


const dbName = 'sandbox-editor-cache-db';
const storeName = 'keyvaluepairs';

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

const dummyFiles1Dependencies = ['react', 'react-dom', 'react-dom/client'];

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

  // TODO: test初めと終わりにcacheDBを削除すること
  mocha.setup({
    rootHooks: {
      beforeAll() {
        console.log('[bundle.worker.test] beforeAll');
      },
      beforeEach() {
        console.log('[bundle.worker.test] beforeEach');
      },
      afterEach() {
        console.log('[bundle.worker.test] afterEach');
      },
      async afterAll() {
        // await deleteIndexedDB(dbName);
        console.log('[bundle.worker.test] afterEach');
      },
    },
    ui: 'tdd',
    timeout: 30000,
  });

/**
 *
 * テスト：
 * - typescriptファイルはただしくトランスパイルされているか
 * - reactファイルはただしくトランスパイルされているか
 * - エントリーポイントからたどれるすべての相対パスのファイルは取り込まれているか
 * - 依存関係はすべて取得されているか
 * - cssファイルはstyle要素を埋め込むJavaScriptファイルに変換されているか
 * - imgファイルは
 * - svgファイルは
 *
 *
 */
(async () => {


  let worker: Worker | undefined;
  let api: Comlink.Remote<iBundlerApi>;
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
      // DEBUG:
      console.log('[bundle.worker.test] Environment should support WebWorker');

      chai.expect(window.Worker).to.not.be.undefined;
      chai.expect(window.Worker).to.not.be.null;
    });
  });

  suite('Worker thread should be generated correctly', () => {
    test('generated successfully', () => {
      // DEBUG:
      console.log('[bundle.worker.test] generated successfully');

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

  // suite('IndexedDB db and store should be existed', () => {
  //   test(`db: ${dbName}, object store: ${storeName} should be existed`, async () => {
  //     try {
  //       chai
  //         .expect(() => isIndexedDBAndStoreGenerated(dbName, 1, storeName))
  //         .to.not.throw();
  //       const result = await isIndexedDBAndStoreGenerated(dbName, 1, storeName);
  //       chai.assert.strictEqual(result, true);
  //     } catch (e) {
  //       console.error(e);
  //       chai.assert.fail();
  //     }
  //   });
  // });

  /**
   * dummyFiles2が期待通りバンドルされていることを確認する
   */
  suite('bundler() should generate bundled file as expected.', () => {
    let bundledCode = '';

    test('bundle dummyFiles2 successfully:', async () => {
      // DEBUG:
      console.log('[bundle.worker.test] bundle dummyFiles2 successfully');

      try {
        const dummyTree = generateTreeForBundler(dummyFiles2);
        bundledCode = await api.bundler(
          getLasComponentFromPath('src/index.ts'),
          dummyTree
        );

        chai.expect(bundledCode.length).to.be.greaterThan(0);
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error(e);
        }
        chai.assert.fail();
      }
    });

    test('Bundled code should includes src/index.ts', () => {
      // DEBUG:
      console.log(
        '[bundle.worker.test] Bundled code should includes src/index.ts'
      );

      const isIncluding = bundledCode.includes('// virtual-file:src/index.ts');
      chai.assert.strictEqual(isIncluding, true);
    });

    test('Bundled code should includes src/Calculator.ts', () => {
      // DEBUG:
      console.log(
        '[bundle.worker.test] Bundled code should includes src/Calculator.ts'
      );

      const isIncluding = bundledCode.includes(
        '// virtual-file:src/Calculator.ts'
      );
      chai.assert.strictEqual(isIncluding, true);
    });

    test('Bundled code should includes JavaScript code converted from src/styles.css', () => {
      // DEBUG:
      console.log(
        '[bundle.worker.test] Bundled code should includes JavaScript code converted from src/styles.css'
      );

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

    /**
     * dummyFiles1のコード中にimportしているnpm依存関係がすべて取得され、
     * IndexedDBへ保存されていることを確認
     *
     * 保存されるデータ例：
     * key: 'https://unpkg.com/react', value: reactのコード
     */
    suite('All dependencies should be stored in cacheDB', () => {
      test('react, react-dom, react-dom/client should be stored', async () => {
        // DEBUG:
        console.log(
          '[bundle.worker.test] react, react-dom, react-dom/client should be stored'
        );

        try {
          const dummyTree = generateTreeForBundler(dummyFiles1);
          bundledCode = await api.bundler(
            getLasComponentFromPath('src/index.tsx'),
            dummyTree
          );

          for (let i = 0; i < dummyFiles1Dependencies.length; i++) {
            chai.assert.strictEqual(
              await isDataExistsInIndexedDBStoreByKey(
                dbName,
                1,
                storeName,
                `https://unpkg.com/${dummyFiles1Dependencies[i]}`
              ),
              true
            );
          }
        } catch (e) {
          console.error(e);
          chai.assert.fail();
        }
      });
    });

    // .cssファイルが複数でも正しく取り込まれているのか確認
  });

  const runner = mocha.run();
  reportBrowserTest(runner);
})();
