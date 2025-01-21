/*********************************************************************
 * Test src/Bundler/plugins/virtualTreePlugin.ts
 *
 * *******************************************************************/
import 'mocha/mocha';
import * as chai from 'chai';
import * as esbuild from 'esbuild-wasm';

import { getLasComponentFromPath } from '../src/utils/getLasComponentFromPath';
import { generateTreeForBundler } from '../src/utils/generateTreeForBundler';
import { virtualTreePlugin } from '../src/Bundle/plugins/virtualTreePlugin';
import type { iFile } from '../src/data/types';

const dbName = 'dummy-db-for-test';
const storeName = 'dummy-store-for-test';

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
});
mocha.checkLeaks();

const initializeOptions: esbuild.InitializeOptions = {
  // wasmURL:  '/esbuild.wasm',
  worker: true,
  wasmURL: 'http://unpkg.com/esbuild-wasm@0.18.20/esbuild.wasm',
};

let isInitialized = false;

(async () => {
  suite('TEST virtualTreePlugin.ts', () => {
    test('Bundle simple files without dependencies', async () => {
      const result = await esbuild.build({
        entryPoints: [getLasComponentFromPath('src/index.ts')],
        bundle: true,
        write: false,
        plugins: [virtualTreePlugin(generateTreeForBundler(dummyFiles1))],
      });
      chai.assert.isDefined(result);
      chai.expect(result.outputFiles[0].text.length).to.be.greaterThan(0);
    });
  });

  mocha.run();
})();
