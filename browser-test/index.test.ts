/*********************************************************************
 * Test src/Bundler/plugins/virtualTreePlugin2.ts
 * 
 * NOTE: テストのために変更したvirtualTreePlugin2.tsをテストしており、本来のファイルvirtualTreePlugin.tsとは異なる
 *
 * バンドルされたコードをテストする方法の参考
 * https://github.com/markwylde/esbuild-plugin-resolve/blob/master/test/index.js
 * 
 * TODO: resolve関数とload関数をspyできるか試す
 * 
 * https://github.com/vitest-dev/vitest/issues/2771#issuecomment-1408489296
 * *******************************************************************/
import 'mocha/mocha';
import * as chai from 'chai';
import * as esbuild from 'esbuild-wasm';
import { getLasComponentFromPath } from '../src/utils/getLasComponentFromPath';
import { generateTreeForBundler } from '../src/utils/generateTreeForBundler';
import { virtualTreePlugin, resolveAllPath, resolveRelativePaths, loadAllFiles, loadSrcFiles, loadCSSFile } from '../src/Bundle/plugins/virtualTreePlugin2';
import type { iFile } from '../src/data/types';

const dbName = 'dummy-db-for-test';
const storeName = 'dummy-store-for-test';

/**
 * react, react-domを依存関係に持つファイル群
 */
const dummyFilesWithDependencies: iFile[] = [
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

const dummyFilesWitRelativePaths = [
  {
    path: 'src/double.ts',
    language: 'typescript',
    selected: false,
    opening: false,
    tabIndex: null,
    value: `// double.ts
export const double = (n: number) => {
  return n * n;
}
     `,
    isFolder: false,
  },
  {
    path: 'src/doubleSquare.ts',
    language: 'typescript',
    selected: false,
    opening: false,
    tabIndex: null,
    value: `// doubleSquare.ts
import { double } from './double';

export const doubleSquare = (n: number) => {
  const d = double(n);
  return d * d;
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
import { doubleSquare } from './doubleSquare';
import './styles.css';

console.log(doubleSquare(2));
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

//
mocha.setup({
  ui: 'tdd',
  rootHooks: {
    async beforeAll() {
      if (!isInitialized) {
        await esbuild.initialize(initializeOptions);
        isInitialized = true;
        console.log('initialized');
      }
    },
  },
  timeout: 30000,
});
mocha.checkLeaks();

const initializeOptions: esbuild.InitializeOptions = {
  // wasmURL:  '/esbuild.wasm',
  worker: true,
  wasmURL: 'http://unpkg.com/esbuild-wasm@0.18.20/esbuild.wasm',
};

let isInitialized = false;

(async () => {
  suite('Resolve all files imported via relative path', () => {
    let bundledCode: string;
    test('Bundled code should contain all files imported via relative path.', async () => {
      try {
        const result = await esbuild.build({
          entryPoints: [getLasComponentFromPath('src/index.ts')],
          bundle: true,
          write: false,
          plugins: [
            virtualTreePlugin(
              generateTreeForBundler(dummyFilesWitRelativePaths)
            ),
          ],
        });
        chai.assert.isDefined(result);
        bundledCode = result.outputFiles[0].text;
        chai.expect(bundledCode.length).to.be.greaterThan(0);
        chai.assert.isTrue(
          bundledCode.includes('// virtual-file:src/index.ts')
        );
        chai.assert.isTrue(
          bundledCode.includes('// virtual-file:src/double.ts')
        );
        chai.assert.isTrue(
          bundledCode.includes('// virtual-file:src/doubleSquare.ts')
        );
        chai.assert.isTrue(
          bundledCode.includes('// virtual-file:src/styles.css')
        );
      } catch (e) {
        console.error(e);
        chai.assert.fail('something went wrong. Build has been failed.');
      }
    }, 10000);

    test('Bundled code should contain css file converted to JavaScript code.', async () => {
      try {
        const f = dummyFilesWitRelativePaths.find(
          (d) => d.path === 'src/styles.css'
        );
        if (f === undefined) {
          throw new Error(`src/styles.css was not found`);
        }
        const isIncludingLine1 = bundledCode.includes(
          'var style = document.createElement("style");'
        );
        // virtulTreePllugin.tsでは`\n`だけエスケープしているのでその通りにする
        const isIncludingLine2 = bundledCode.includes(
          'style.innerText = "' + f.value.replace(/[\n]+/g, '') + '";'
        );
        const isIncludingLine3 = bundledCode.includes(
          'document.head.appendChild(style);'
        );
        chai.assert.strictEqual(
          isIncludingLine1 && isIncludingLine2 && isIncludingLine3,
          true
        );
      } catch (e) {
        console.error(e);
        chai.assert.fail('something went wrong. Build has been failed.');
      }
    }, 10000);
  });

  suite('Resolve dependencies', () => {
    test('Bundled code should include dependencies: react, react-dom, react-dom/client', async () => {
      try {
        const result = await esbuild.build({
          entryPoints: [getLasComponentFromPath('src/index.tsx')],
          bundle: true,
          write: false,
          plugins: [
            virtualTreePlugin(
              generateTreeForBundler(dummyFilesWithDependencies)
            ),
          ],
        });
        chai.assert.isDefined(result);
        chai.expect(result.outputFiles[0].text.length).to.be.greaterThan(0);
      } catch (e) {
        console.error(e);
        chai.assert.fail('something went wrong. Build has been failed.');
      }
    }, 10000);
  });

  mocha.run();
})();
