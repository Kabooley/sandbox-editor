import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTreeForBundler } from '../../src/utils/generateTreeForBundler';
import { files } from '../../src/data/files';
import type { iFile } from '../../src/data/types';
import { shallowCopyObject } from '../utils/copyObjectShallow';

const initializedTree: { [key: string]: string } = {
  public: '',
  'public/index.html':
    '\n' +
    '<!DOCTYPE html>\n' +
    '<html>\n' +
    '  <head>\n' +
    '    <meta charset="utf-8" />\n' +
    '    <title>React TypeScript</title>\n' +
    '  </head>\n' +
    '  <body>\n' +
    '    <div id="root"></div>\n' +
    '  </body>\n' +
    '</html>',
  src: '',
  'src/App.tsx':
    '\n' +
    "import React from 'react';\n" +
    'import "./styles.css";\n' +
    '\n' +
    'export default function App(): React.JSX.Element {\n' +
    '  return (\n' +
    '    <div className="App">\n' +
    '      <h1>Hello CodeSandbox</h1>\n' +
    '      <h2>Start editing to see some magic happen!</h2>\n' +
    '    </div>\n' +
    '  );\n' +
    '};\n' +
    '      ',
  'src/index.tsx':
    '\n' +
    'import React from "react";\n' +
    'import ReactDOM from "react-dom/client";\n' +
    'import App from "./App";\n' +
    '\n' +
    'const rootElement = document.getElementById("root");\n' +
    'if(rootElement) {\n' +
    '  const root = ReactDOM.createRoot(rootElement);\n' +
    '\n' +
    '  root.render(\n' +
    '    <React.StrictMode>\n' +
    '      <App />\n' +
    '    </React.StrictMode>\n' +
    '  );   \n' +
    '}',
  'src/styles.css':
    '.App {\n' +
    '        font-family: sans-serif;\n' +
    '        text-align: center;\n' +
    '      }\n' +
    '      ',
  'package.json':
    '{\n' +
    '      "name": "react-typescript",\n' +
    '      "version": "1.0.0",\n' +
    '      "description": "React and TypeScript example starter project",\n' +
    '      "keywords": [\n' +
    '        "typescript",\n' +
    '        "react",\n' +
    '        "starter"\n' +
    '      ],\n' +
    '      "main": "src/index.tsx",\n' +
    '      "dependencies": {\n' +
    '        "loader-utils": "3.2.1",\n' +
    '        "react": "18.2.0",\n' +
    '        "react-dom": "18.2.0",\n' +
    '        "react-scripts": "5.0.1"\n' +
    '      },\n' +
    '      "devDependencies": {\n' +
    '        "@types/react": "18.0.25",\n' +
    '        "@types/react-dom": "18.0.9",\n' +
    '        "typescript": "4.4.2"\n' +
    '      },\n' +
    '      "scripts": {\n' +
    '        "start": "react-scripts start",\n' +
    '        "build": "react-scripts build",\n' +
    '        "test": "react-scripts test --env=jsdom",\n' +
    '        "eject": "react-scripts eject"\n' +
    '      },\n' +
    '      "browserslist": [\n' +
    '        ">0.2%",\n' +
    '        "not dead",\n' +
    '        "not ie <= 11",\n' +
    '        "not op_mini all"\n' +
    '      ]\n' +
    '    }',
  'tsconfig.json':
    '{\n' +
    '      "include": [\n' +
    '          "./src/**/*"\n' +
    '      ],\n' +
    '      "compilerOptions": {\n' +
    '          "strict": true,\n' +
    '          "esModuleInterop": true,\n' +
    '          "lib": [\n' +
    '              "dom",\n' +
    '              "es2015"\n' +
    '          ],\n' +
    '          "jsx": "react-jsx"\n' +
    '      }\n' +
    '  }',
  soMuchLongDirectoryName: '',
  'soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt':
    'so much text might be here...',
};

describe('Test generateTreeForBundler', () => {
  let f: iFile[] = [];
  beforeEach(() => {
    f = files.map((f) => shallowCopyObject(f));
  });
  test("Should generate file's path and file' value pairs from file data.", () => {
    const tree = generateTreeForBundler(f);
    expect(tree).toEqual(initializedTree);
  });

  test('Should return empty object if passed empty array', () => {
    const o: { [key: string]: string } = {};
    expect(generateTreeForBundler([])).toEqual(o);
  });
});
