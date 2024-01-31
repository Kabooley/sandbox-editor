export interface iFile {
    path: string;
    language: string;
    value: string;
    isFolder: boolean;
}

export const files: iFile[] = [
    {
        path: 'public',
        language: '',
        value: '',
        isFolder: true,
    },
    {
        path: 'public/index.html',
        language: 'html',
        value: `<!DOCTYPE html>\r\n<html>\r\n<head>\r\n<meta charset="utf-8" />\r\n<title>React TypeScript</title>\r\n</head>\r\n<body>\r\n<div id="root"></div>\r\n</body>\r\n</html>`,
        isFolder: false,
    },
    {
        path: 'src',
        language: '',
        value: '',
        isFolder: true,
    },
    {
        path: 'src/App.ts',
        language: 'typescript',
        value: `import React from 'react';
      import "./styles.css";
      import axios from 'axios';

      // React.JSX.Element annotation is necessary so that compiler know this is jsx.
      export default function App(): React.JSX.Element {
        return (
          <div className="App">
            <h1>Hello CodeSandbox</h1>
            <h2>Start editing to see some magic happen!</h2>
          </div>
        );
      }
      `,
        isFolder: false,
    },
    {
        path: 'src/index.tsx',
        language: 'typescript',
        value: `import React from "react";
      import ReactDOM from "react-dom/client";
      import App from "./App";
      
      const rootElement = document.getElementById("root")!;
      const root = ReactDOM.createRoot(rootElement);
      
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );`,
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
];
