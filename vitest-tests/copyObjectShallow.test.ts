/**
 * テストの都合上作ったモジュール
 * オブジェクトの浅いコピーを作成する（第一階層のみ参照ではないコピーを作る）
 * ただし深い階層は参照になる
 *
 * prototypeはコピーしない
 * propertyだけコピーする
 * */
import { describe, test, expect } from 'vitest';

export interface iFile {
  path: string;
  language: string;
  value: string;
  isFolder: boolean;
  selected: boolean;
  opening: boolean;
  tabIndex: number | null;
}

const files = [
  {
    path: 'public/index.html',
    language: 'html',
    value: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>React TypeScript</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
    isFolder: false,
    selected: false,
    opening: false,
    tabIndex: null,
  },
  {
    path: 'src/App.tsx',
    language: 'typescript',
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
    selected: false,
    opening: false,
    tabIndex: null,
  },
  {
    path: 'src/index.tsx',
    language: 'typescript',
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
    selected: false,
    opening: false,
    tabIndex: null,
  },
  {
    path: 'src/styles.css',
    language: 'css',
    value: `.App {
      font-family: sans-serif;
      text-align: center;
    }
    `,
    isFolder: false,
    selected: false,
    opening: false,
    tabIndex: null,
  },
  {
    path: 'package.json',
    language: 'json',
    value: `{
      name: 'stackblitz-starters-fsmfyz',
      version: '0.0.0',
      private: true,
      dependencies: {
        '@types/react': '18.2.52',
        '@types/react-dom': '18.2.18',
        react: '18.2.0',
        'react-dom': '18.2.0',
        typescript: '^5.3.3',
      },
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test --env=jsdom',
        eject: 'react-scripts eject',
      },
      devDependencies: {
        'react-scripts': 'latest',
      },
    }`,
    isFolder: false,
    selected: false,
    opening: false,
    tabIndex: null,
  },
  {
    path: 'tsconfig.json',
    language: 'json',
    value: `{
    "include": [
        "./src/**/*"
    ],
    "compilerOptions": {
        "strict": true,
        "esModuleInterop": true,
        "lib": [
            "dom",
            "es2015"
        ],
        "jsx": "react-jsx"
    }
}`,
    isFolder: false,
    selected: false,
    opening: false,
    tabIndex: null,
  },
];

export const shallowCopyObject = <T extends {}>(o: T) => {
  return Object.assign({} as T, o);
};

describe('Test shallowCopyObject', () => {
  const copiedFiles = files.map((f) => shallowCopyObject<iFile>(f));
  copiedFiles.forEach((cf) => (cf.path = cf.path + 'extra-path'));
  copiedFiles.forEach((cf, index) => {
    test('copied files should not have references to origin objects', () => {
      console.log(cf.path);
      console.log(files[index].path);
      expect(cf.path === files[index].path).toBe(false);
    });
  });
});
