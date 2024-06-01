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
        selected: false,
        opening: false,
        tabIndex: null,
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
    {
        path: 'package.json',
        language: 'json',
        selected: false,
        opening: false,
        tabIndex: null,
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
        selected: false,
        opening: false,
        tabIndex: null,
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
        selected: false,
        opening: false,
        tabIndex: null,
        value: `so much text might be here...`,
        isFolder: false,
    },
];
