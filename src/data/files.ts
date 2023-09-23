import type { iFile } from './types';
import { getFileLanguage } from '../utils';

export const files: iFile[] = [
    // {
    //     path: 'public',
    //     language: '',
    //     value: '',
    //     isFolder: true,
    // },
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
    },
    // {
    //     path: 'src',
    //     language: '',
    //     value: '',
    //     isFolder: true,
    // },
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
    },
    {
        path: 'package.json',
        language: 'json',
        value: `{
      "name": "react-typescript",
      "version": "1.0.0",
      "description": "React and TypeScript example starter project",
      "keywords": [
        "typescript",
        "react",
        "starter"
      ],
      "main": "src/index.tsx",
      "dependencies": {
        "loader-utils": "3.2.1",
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "react-scripts": "5.0.1"
      },
      "devDependencies": {
        "@types/react": "18.0.25",
        "@types/react-dom": "18.0.9",
        "typescript": "4.4.2"
      },
      "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test --env=jsdom",
        "eject": "react-scripts eject"
      },
      "browserslist": [
        ">0.2%",
        "not dead",
        "not ie <= 11",
        "not op_mini all"
      ]
    }`,
        isFolder: false,
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
    },
    // to fix disappearing tree column functions when column width is shorter than file name.
    {
        path: 'soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt',
        language: 'txt',
        value: `so much text might be here...`,
        isFolder: false,
    },
];

/*********************************************
 * File
 *
 * @constructor
 * @param {string} _path - files path.
 * @param {string} _value - file value.
 * @param {string} _language - Code language using in file.
 * @param {string} _isFolder - Type of this file. file or folder.
 * @param {string} _selected - Opening on Editor.
 * @param {string} _opening - This file is One of the opening tab if true. NOT means on Editor.
 *
 *
 * @param {number | null} _tabIndex - Order number of tab
 *
 * TODO: Doesn't need to bind methods?
 * ******************************************/

export class File {
    constructor(
        private _path: string,
        private _value: string,
        private _language: string,
        private _isFolder: boolean,
        private _selected: boolean = false,
        private _opening: boolean = false,
        private _tabIndex: number | null = null
    ) {}

    _isPathValid(path: string): boolean {
        // TODO: make sure path is valid
        return true;
    }

    setPath(path: string) {
        // TODO: make sure path is not include non exist folder
        // if(isFilenameValid(path)){
        if (this._isPathValid(path)) {
            this._path = path;
            const language = getFileLanguage(path);
            this._language = language !== undefined ? language : '';
        }
    }

    setValue(value: string) {
        this._value = value;
    }

    getPath(): string {
        return this._path;
    }

    getValue(): string {
        return this._value;
    }

    isFolder(): boolean {
        return this._isFolder;
    }

    // temporary
    getLanguage(): string {
        return this._language;
    }

    setSelected(): void {
        this._selected = true;
    }

    unSelected(): void {
        this._selected = false;
    }

    isSelected(): boolean {
        return this._selected;
    }

    isOpening(): boolean {
        return this._opening;
    }

    setOpening(flag: boolean): void {
        this._opening = flag;
    }

    getTabIndex(): number | null {
        return this._tabIndex;
    }

    setTabIndex(i: number | null): void {
        this._tabIndex = i;
    }
}
