# TEST `@typescript/vfs` and `@typescript/ata`

## このブランチについて

全ての依存関係を解決して全てのファイルを前提にコンパイルできるのか検証する。

-   本来の src: `src_temporary-forbidden`
-   monaco-editor の typescript.worker を使ってコードをコンパイルする手段の検証：`typescript-worker-compiler`
-   今回のテストのための src: `src`

## わかったこと

-   `@typescript/ata`は読み取らせたコードから自動で依存関係を検知して npm パッケージモジュールをインポートしてくれるけれど、ローカルファイル（`import moduleA from './moduleA';`とか)は無視してくれる。

-   monaco-editor にローカルファイルを認識させるには、それらローカルファイルのモデルを作成する、かつ`addExtraLib`にローカルファイルを追加するの 2 つの条件が必要である。

-   monaco-editor の設定として以下が必要である。

```TypeScript
/**
 * Sync all the models to the worker eagerly.
 * This enables intelliSense for all files without needing an `addExtraLib` call.
 */
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

/**
 * Configure the typescript compiler to detect JSX and load type definitions
 */
const compilerOptions: monaco.languages.typescript.CompilerOptions = {
    allowJs: true,
    allowSyntheticDefaultImports: true,
    alwaysStrict: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    isolatedModules: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    // noEmit: true,
    resolveJsonModule: true,
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions
);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
);
```

-   monaco-editor は typescript コンパイルを自動で行ってくれるっぽいので、tsconfig 土曜コンパイル設定`monaco.languages.typescript.CompilerOptions`を必要に応じて適切に設定する必要がある。

-   monaco-editor の typescript コンパイルは単一のファイルを独立してコンパイルするので複数のファイルにまたがるようなモジュールの型チェックは行わないかも

-   [別件] typescript.worker からコンパイル済コードを取得する場合、`monaco.languages.typescript.CompilerOptions`の`noEmit: true`にするとコードを取得できないので注意。

## TODOs

-   [webpack: `Compile with Problems`](#webpack:-`Compile-with-Problems`)

-   [addExtraLib へローカルファイルをリアルタイム追加更新していけば型チェックはできていると判断していいのか検証](#addExtraLibへローカルファイルをリアルタイム追加更新していけば型チェックはできていると判断していいのか検証)

## install dependency

```bash
$ yarn add @typescript/vfs
$ yarn add @typescript/ata
```

一応インストール前の package.json 記録

```json
{
    "name": "sandbox-editor",
    "scripts": {
        "start": "node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js",
        "build": "NODE_ENV='production' node ./node_modules/webpack/bin/webpack.js --progress"
    },
    "dependencies": {
        "@types/lodash": "^4.14.196",
        "@types/path-browserify": "^1.0.0",
        "axios": "^1.4.0",
        "esbuild-wasm": "^0.18.17",
        "idb-keyval": "^6.2.1",
        "localforage": "^1.10.0",
        "lodash": "^4.17.21",
        "path-browserify": "^1.0.1",
        "prettier": "2.8.8",
        "react-resizable": "^3.0.5",
        "semver": "^7.5.4"
    },
    "devDependencies": {
        "@babel/core": "^7.17.0",
        "@babel/preset-env": "^7.16.11",
        "@babel/preset-react": "^7.16.7",
        "@babel/preset-typescript": "^7.16.7",
        "@pmmmwh/react-refresh-webpack-plugin": "^0.5.4",
        "@types/prettier": "^2.7.3",
        "@types/react": "^17.0.39",
        "@types/react-dom": "^17.0.11",
        "@types/semver": "^7.5.0",
        "babel-loader": "^8.2.3",
        "css-loader": "^5.2.7",
        "file-loader": "^6.2.0",
        "glob": "^7.2.0",
        "html-webpack-plugin": "^5.5.0",
        "monaco-editor": "^0.32.1",
        "monaco-editor-webpack-plugin": "^7.0.1",
        "react": "^17.0.2",
        "react-dom": "^17.0.2",
        "react-refresh": "^0.11.0",
        "sass": "^1.64.1",
        "sass-loader": "^13.3.2",
        "style-loader": "^3.3.1",
        "terser-webpack-plugin": "^5.3.1",
        "ts-loader": "^9.2.6",
        "typescript": "^5.0.2",
        "webpack": "^5.76.0",
        "webpack-cli": "^4.9.2",
        "webpack-dev-server": "^4.7.4"
    }
}
```

## `@typescritp/ata`

#### 使用例

実例がない。本人(TypeScript-Website)しかない。そのコード。

https://github.com/microsoft/TypeScript-Website/blob/5a34236898134a43f4db55e013391e1d0724590b/packages/sandbox/src/index.ts#L13

```TypeScript
  const ata = setupTypeAcquisition({
    projectName: "TypeScript Playground",
    typescript: ts,
    logger: console,
    delegate: {
      receivedFile: addLibraryToRuntime,
      progress: (downloaded: number, total: number) => {
        // console.log({ dl, ttl })
      },
      started: () => {
        console.log("ATA start")
      },
      finished: f => {
        console.log("ATA done")
      },
    },
  })

  const textUpdated = () => {
    const code = editor.getModel()!.getValue()

    if (config.supportTwoslashCompilerOptions) {
      const configOpts = getTwoSlashCompilerOptions(code)
      updateCompilerSettings(configOpts)
    }

    if (config.acquireTypes) {
      ata(code)
    }
  }
```

#### .d.ts メモ

```TypeScript

export interface ATABootstrapConfig {
  /** A object you pass in to get callbacks */
  delegate: {
    /** The callback which gets called when ATA decides a file needs to be written to your VFS  */
    receivedFile?: (code: string, path: string) => void
    /** A way to display progress */
    progress?: (downloaded: number, estimatedTotal: number) => void
    /** Note: An error message does not mean ATA has stopped! */
    errorMessage?: (userFacingMessage: string, error: Error) => void
    /** A callback indicating that ATA actually has work to do */
    started?: () => void
    /** The callback when all ATA has finished */
    finished?: (files: Map<string, string>) => void
  }
  /** Passed to fetch as the user-agent */
  projectName: string
  /** Your local copy of typescript */
  typescript: typeof import("typescript")
  /** If you need a custom version of fetch */
  fetcher?: typeof fetch
  /** If you need a custom logger instead of the console global */
  logger?: Logger
}

interface Logger {
  log: (...args: any[]) => void
  error: (...args: any[]) => void
  groupCollapsed: (...args: any[]) => void
  groupEnd: (...args: any[]) => void
}

export const setupTypeAcquisition: (config: ATABootstrapConfig) => (initialSourceFile: string) => void

```

> 型取得を開始する関数は、アプリの初期ソースコードを渡す関数を返す。

> これは事実上メインのエクスポートであり、それ以外は基本的にテスト用にエクスポートされるもので、コンシューマーは実装の詳細と考えるべきである。

-   `setupTypeAcquisition`: ATA がファイルを VFS に書き込む必要があると判断したときに呼び出されるコールバックを返す。

-   `recievedFile`: なので ata が`recievedFile`の変更などを検知して必要に応じてコールバックを呼び出し、vfs へ書き込んだりするということかしら。

-   `started`: ATA が実際に仕事をすることを示すコールバック。
-   `finished`: ATA が仕事を終了したら呼び出されるコールバック。

#### 実践

```TypeScript
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import ts from 'typescript';
import * as ATA from '@typescript/ata';

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: any, label: string) {
        if (label === 'json') {
            return './json.worker.bundle.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './css.worker.bundle.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './html.worker.bundle.js';
        }
        if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.bundle.js';
        }
        return './editor.worker.bundle.js';
    },
};

/**
 * Sync all the models to the worker eagerly.
 * This enables intelliSense for all files without needing an `addExtraLib` call.
 */
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

/**
 * Configure the typescript compiler to detect JSX and load type definitions
 */
const compilerOptions: monaco.languages.typescript.CompilerOptions = {
    allowJs: true,
    allowSyntheticDefaultImports: true,
    alwaysStrict: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    isolatedModules: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    resolveJsonModule: true,
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions
);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
);

interface iProps {}

const isJSLang = false;

// https://microsoft.github.io/monaco-editor/docs.html#functions/languages.typescript.getTypeScriptWorker.html
// https://microsoft.github.io/monaco-editor/docs.html#interfaces/languages.typescript.TypeScriptWorker.html
//
// `getTypeScriptWorker` returns Promise<TypeScriptWorker>
// const getWorker = isJSLang
//     ? monaco.languages.typescript.getJavaScriptWorker
//     : monaco.languages.typescript.getTypeScriptWorker;


const defaultLanguage = 'typescript';   // DO NOT "TypeScript". Always lower case
const defaultCode = `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = (): JSX.Element => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`;
const defaultPath = 'src/index.tsx';

const extraLibs = new Map<
    string,
    { js: monaco.IDisposable; ts: monaco.IDisposable }
>();

const ataConfig: ATA.ATABootstrapConfig = {
    projectName: 'My ATA Project',
    typescript: ts,
    logger: console,
    delegate: {
        receivedFile: (code: string, path: string) => {
            // Add code to your runtime at the path...
            console.log('[ata][recievedFile] path:');
            console.log(path);
            console.log('[ata][recievedFile] code:');
            console.log(code);
        },
        started: () => {
            console.log('ATA start');
        },
        progress: (downloaded: number, total: number) => {
            console.log(`Got ${downloaded} out of ${total}`);
        },
        finished: (vfs) => {
            console.log('ATA done', vfs);
            for (const [key, value] of vfs.entries()) {
                const cachedLib = extraLibs.get(key);
                if (cachedLib) {
                    cachedLib.js.dispose();
                    cachedLib.ts.dispose();
                }
                // Monaco Uri parsing contains a bug which escapes characters unwantedly.
                // This causes package-names such as `@expo/vector-icons` to not work.
                // https://github.com/Microsoft/monaco-editor/issues/1375
                let uri = monaco.Uri.from({
                    scheme: 'file',
                    path: key,
                }).toString();
                if (key.includes('@')) {
                    uri = uri.replace('%40', '@');
                }

                const js =
                    monaco.languages.typescript.javascriptDefaults.addExtraLib(
                        value,
                        uri
                    );
                const ts =
                    monaco.languages.typescript.typescriptDefaults.addExtraLib(
                        value,
                        uri
                    );

                extraLibs.set(key, { js, ts });
            }
        },
    },
};

export const Editor: React.FC<iProps> = () => {
    const [compiled, setCompiled] = useState<string>(
        'Compiled code will be here!'
    );
    const divEl = useRef<HTMLDivElement>(null);
    const editor = useRef<monaco.editor.IStandaloneCodeEditor>();
    const model = useRef<monaco.editor.ITextModel>();
    const disposable = useRef<monaco.IDisposable[]>([]);
    const ata = useCallback(ATA.setupTypeAcquisition(ataConfig), []);

    useEffect(() => {
        console.log('on did mount');
        if (divEl.current) {
            editor.current = monaco.editor.create(divEl.current);
            model.current = monaco.editor.createModel(
                defaultCode,
                defaultLanguage,
                new monaco.Uri().with({ path: defaultPath })
            );
            editor.current.setModel(model.current);

            disposable.current.push(
                editor.current.onDidChangeModelContent(onDidChangeContent)
            );

            // ...
        }

        return () => {
            // DEBUG:
            console.log('on will unmount');

            model.current && model.current.dispose();
            editor.current && editor.current.dispose();
            disposable.current &&
            disposable.current.forEach((d) => d.dispose());
        };
    }, []);

    const onDidChangeContent = (e: monaco.editor.IModelContentChangedEvent) => {
        const model = editor.current?.getModel();
        if (model) {
            ata(model.getValue());
        }
    };

    return (
        <div>
            <div className="Editor" ref={divEl}></div>
            {compiled}
            <button onClick={onClick}>COMPILE</button>
        </div>
    );
};
```

#### 使ってみてわかったこと

-   `ata()`へ渡したコードが変更された、かつ依存関係に変更があった（import 文が追加されたとか）時にその依存関係を自動的に取得してくれる
-   取得した依存関係は`finished`の引数で取得できる
-   すでに実装済の typings.worker より、自動で依存関係の検知・追加などをしてくれる分こっちの方が優れている。（そして自作じゃないからボロがない!!）
-   便利、完全である。

## `@typescript/vfs`

https://github.com/microsoft/TypeScript-Website/tree/v2/packages/typescript-vfs

#### わかったこと

つかわなくていい。

`@typescript/vfs`は typescript アーキテクチャが生成する SourceFile などのオブジェクトにアクセスする手段を提供するものである。
要は typescript コンパイルに介入できるようになるというかそんなものであって、
仮想ファイルシステムとして扱うにはよくわからなすぎるし自作のでいいかもね。

#### 実例

あんまり役に立たないけど。

https://github.com/microsoft/TypeScript-Website/blob/5a34236898134a43f4db55e013391e1d0724590b/packages/ts-twoslasher/src/index.ts#L16

```TypeScript
import { createSystem, createVirtualTypeScriptEnvironment, createFSBackedSystem } from "@typescript/vfs"

  const defaultCompilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2016,
    allowJs: true,
    ...(options.defaultCompilerOptions ?? {}),
  }
  const compilerOptions = filterCompilerOptions(codeLines, defaultCompilerOptions, ts)

 // In a browser we want to DI everything, in node we can use local infra
  const useFS = !!options.fsMap
  const vfs = useFS && options.fsMap ? options.fsMap : new Map<string, string>()
  const system = useFS ? createSystem(vfs) : createFSBackedSystem(vfs, getRoot(), ts, options.tsLibDirectory)
  const fsRoot = useFS ? "/" : getRoot() + "/"

  const env = createVirtualTypeScriptEnvironment(system, [], ts, compilerOptions, options.customTransformers)
  const ls = env.languageService

  code = codeLines.join("\n")

  let partialQueries = [] as (PartialQueryResults | PartialCompletionResults)[]
  let queries = [] as TwoSlashReturn["queries"]
  let highlights = [] as TwoSlashReturn["highlights"]

  const nameContent = splitTwoslashCodeInfoFiles(code, defaultFileName, fsRoot)
  const sourceFiles = ["js", "jsx", "ts", "tsx"]

  /** All of the referenced files in the markup */
  const filenames = nameContent.map(nc => nc[0])

  for (const file of nameContent) {
    const [filename, codeLines] = file
    const filetype = filename.split(".").pop() || ""

    // Only run the LSP-y things on source files
    const allowJSON = compilerOptions.resolveJsonModule && filetype === "json"
    if (!sourceFiles.includes(filetype) && !allowJSON) {
      continue
    }

    // Create the file in the vfs
    const newFileCode = codeLines.join("\n")
    env.createFile(filename, newFileCode)

    const updates = filterHighlightLines(codeLines)
    highlights = highlights.concat(updates.highlights)
```

使用環境がブラウザであると想定すると...

```TypeScript
import ts from 'typescript';
import { createSystem, createVirtualTypeScriptEnvironment, createFSBackedSystem } from "@typescript/vfs"

// 型はimport("typescript").CompilerOptionsのようなのでtsconfigで定義しているのと同じかしら。
const compilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2016,
    allowJs: true
};

// type CustomTransformers = import("typescript").CustomTransformers;
// コンパイラ実行時の追加トランスパイラだそうです。
const customTransFormers = {/* わからんからから */}
// メモリに展開するファイルデータ
const vfs = new Map<string, string>();
// 多分メモリに展開する仮想ファイルシステム
// .d.ts見る限り、filesystemがない環境はこっちの模様
const system = createSystem(vfs);
// これで仮想TypeScript環境が生成されたのかしら？
const env = createVirtualTypeScriptEnvironment(system, [], ts, compilerOptions, customTransformers);


```

#### .d.ts 解析

```TypeScript
// @typescript/vfs index.d.ts
type System = import("typescript").System;
type CompilerOptions = import("typescript").CompilerOptions;
type CustomTransformers = import("typescript").CustomTransformers;
type LanguageServiceHost = import("typescript").LanguageServiceHost;
type CompilerHost = import("typescript").CompilerHost;
type SourceFile = import("typescript").SourceFile;
type TS = typeof import("typescript");
export interface VirtualTypeScriptEnvironment {
    sys: System;
    languageService: import("typescript").LanguageService;
    getSourceFile: (fileName: string) => import("typescript").SourceFile | undefined;
    createFile: (fileName: string, content: string) => void;
    updateFile: (fileName: string, content: string, replaceTextSpan?: import("typescript").TextSpan) => void;
}
```

-   System: TypeScript Program で使うことのできる in-memory の System
-   getSourceFile: typescritp overview で言っていた`SourceFile`のことかしら。
    だとしたら AST のことだな。
-   createFile: たぶん ts 環境へファイルを追加できるインターフェイスなので、つまり`createSourceFile`と同義かと。
-

まずはこいつを使うらしい。

#### `@typescript/vfs`がどう役に立つのか見出す

さっぱりわからんからとにかく使い倒す

-   `vfsenv.getSourceFile(getFilenameFromPath('index.tsx'))`

出力結果：

```TypeScript
ambientModuleNames: []
amdDependencies: []
bindDiagnostics: []
bindSuggestionDiagnostics: undefined
checkJsDirective: undefined
classifiableNames: Set(3) {'React', 'ReactDOM', 'App'}
commentDirectives: undefined
end: 332
endFlowNode: {flags: 512, antecedent: {…}, node: NodeObject}
endOfFileToken: TokenObject {pos: 332, end: 332, flags: 0, modifierFlagsCache: 0, transformFlags: 0, …}
externalModuleIndicator: NodeObject {pos: 0, end: 26, flags: 0, modifierFlagsCache: 0, transformFlags: 0, …}
fileName: "index.tsx"
flags: 0
hasNoDefaultLib: false
identifierCount: 17
identifiers: Map(13) {'React' => 'React', 'react' => 'react', 'ReactDOM' => 'ReactDOM', 'react-dom/client' => 'react-dom/client', 'App' => 'App', …}
impliedNodeFormat: undefined
imports: (4) [NodeObject, NodeObject, NodeObject, NodeObject]
isDeclarationFile: false
kind: 311
languageVariant: 1
languageVersion: 99
libReferenceDirectives: []
lineMap: undefined
locals: Map(5) {'React' => SymbolObject, 'ReactDOM' => SymbolObject, 'App' => SymbolObject, 'rootElement' => SymbolObject, 'root' => SymbolObject}
modifierFlagsCache: 0
moduleAugmentations: []
nextContainer: undefined
nodeCount: 53
originalFileName: "index.tsx"
packageJsonLocations: undefined
packageJsonScope: undefined
parent: undefined
parseDiagnostics: []
path: "/index.tsx"
pos: 0
pragmas: Map(0) {size: 0}
referencedFiles: []
resolvedModules: {get: ƒ, set: ƒ, delete: ƒ, has: ƒ, forEach: ƒ, …}
resolvedPath: "/index.tsx"
resolvedTypeReferenceDirectiveNames: undefined
scriptKind: 4
scriptSnapshot: StringScriptSnapshot {text: 'import React from "react";\n      import ReactDOM f…     <App />\n        </React.StrictMode>\n      );'}
setExternalModuleIndicator: (file) => {…}
statements: (6) [NodeObject, NodeObject, NodeObject, NodeObject, NodeObject, NodeObject, pos: 0, end: 332, hasTrailingComma: false, transformFlags: 4457475]
symbol: SymbolObject {id: 0, mergeId: 0, flags: 512, escapedName: '"index"', declarations: Array(1), …}
symbolCount: 8
text: "import React from \"react\";\n      import ReactDOM from \"react-dom/client\";\n      import App from \"./App\";\n      \n      const rootElement = document.getElementById(\"root\")!;\n      const root = ReactDOM.createRoot(rootElement);\n      \n      root.render(\n        <React.StrictMode>\n          <App />\n        </React.StrictMode>\n      );"
transformFlags: 4457475
typeReferenceDirectives: []
version: "3"
```

## test-TypingLibsContext

`../test-TypingLibsContext`

`@typescript/ata`と monaco-editor の`addExtraLibs`の機能をグローバルに提供できるようにしたかったので、

`../test-TypingLibsContext/context/TypingLibsContext.tsx`を作成して提供できるようにした。

`monaco`をどこで import しても、`monaco.languages.typescript.typescriptDefault.addExtraLib()`しても

アプリケーションの monaco 全体に適用されるのでライブラリの登録が簡便に済む。

```TypeScript
import * as monaco from 'monaco-editor';
import React, { createContext, useCallback, useEffect, useRef } from 'react';
import ts from 'typescript';
import * as ATA from '@typescript/ata';

type iTypingLibsContext = (code: string, path?: string) => void;

type iTypingLibs = Map<
    string,
    {
        js: monaco.IDisposable;
        ts: monaco.IDisposable;
    }
>;

interface iProps {
    // Setting `any` instead is `React.ReactChildren`
    // according to https://github.com/microsoft/TypeScript/issues/6471
    children: any;
}

export const TypingLibsContext = createContext<iTypingLibsContext>(() => null);

/***
 * Provider of method that resolves and loads dependencies and store them
 * using monaco.languages.[type|java]script.addExtraLibs.
 * You can pass file value then ATA parse them to find dependency to load.
 * Loaded typing file will be stored to monaco-editor library object.
 *
 * You can grab addTypings from every place under this provider.
 *
 * The method generated by useCallback not to occure rerender component.
 * */
export const TypingLibsProvider = ({ children }: iProps) => {
    /**
     * Map of typing Libraries
     *
     * */
    const typingLibs = useRef<iTypingLibs>(
        new Map<string, { js: monaco.IDisposable; ts: monaco.IDisposable }>()
    );

    const ata = useCallback(
        ATA.setupTypeAcquisition({
            projectName: 'My ATA Project',
            typescript: ts,
            logger: console,
            delegate: {
                receivedFile: (code: string, path: string) => {
                    addExtraLibs(code, path);
                },
                started: () => {
                    console.log('ATA start');
                },
                progress: (downloaded: number, total: number) => {
                    console.log(`Got ${downloaded} out of ${total}`);
                },
                finished: (vfs) => {
                    console.log('ata finished');
                    console.log(vfs);
                    debugPrintExtraLibs();
                },
            },
        }),
        []
    );

    /***
     *
     * @param {string} code - Code that you want ata to parse.
     * @param {string} path - Path of file that the code is belongs to.
     *
     * Not to re-render, generated by useCallback.
     * */
    const addTypings: iTypingLibsContext = useCallback(
        (code: string, path?: string): void => {
            if (path) {
                // save latest files value
                addExtraLibs(code, path);
            }
            ata(code);
        },
        []
    );

    const addExtraLibs = (code: string, path: string) => {
        console.log('ATA recievedFile:');
        const cachedLib = typingLibs.current.get(path);
        if (cachedLib) {
            cachedLib.js.dispose();
            cachedLib.ts.dispose();
        }
        // Monaco Uri parsing contains a bug which escapes characters unwantedly.
        // This causes package-names such as `@expo/vector-icons` to not work.
        // https://github.com/Microsoft/monaco-editor/issues/1375
        let uri = monaco.Uri.from({
            scheme: 'file',
            path: path,
        }).toString();
        if (path.includes('@')) {
            uri = uri.replace('%40', '@');
        }

        const js = monaco.languages.typescript.javascriptDefaults.addExtraLib(
            code,
            uri
        );
        const ts = monaco.languages.typescript.typescriptDefaults.addExtraLib(
            code,
            uri
        );
        typingLibs.current.set(path, { js, ts });
    };

    return (
        <TypingLibsContext.Provider value={addTypings}>
            {children}
        </TypingLibsContext.Provider>
    );
};
```

```TypeScript
// usage
import { Editor } from './Editor';
import { TypingLibsProvider } from '../context/TypingLibsContext';

const Container = () => {
    return (
        <div className="container">
            <TypingLibsProvider>
                <Editor />
            </TypingLibsProvider>
        </div>
    );
};

// ---

import { TypingLibsContext } from '../context/TypingLibsContext';


export const Editor: React.FC<iProps> = ({ files }) => {
    const addTypings = useContext(TypingLibsContext);

    useEffect(() => {
        // ...
        files.forEach((f) => {
            if (f.isFolder) return;
            addTypings(
                f.value,
                monaco.Uri.from({ scheme: 'file', path: f.path }).toString()
            );
        });
    }, []);

    const onDidChangeContent = (e: monaco.editor.IModelContentChangedEvent) => {
        const model = editor.current?.getModel();
        if (model) {
            addTypings(model.getValue(), model.uri.toString());
            handleMarkers();
        }
    };

    return (
        // ...
    );
};

```

## webpack: `Compile with Problems`

## addExtraLib へローカルファイルをリアルタイム追加更新していけば型チェックはできていると判断していいのか検証

つまり、

アプリケーションのバンドリングプロセスが...

-   user edit --> update model and addExtraLibs --> send code to tsworker --> get compiled code --> send codes bundler

という流れが、

-   user edit --> update model and addExtraLibs --> **default editor checks type** --> send codes bundler

という流れで済むのではないか？というのを検証したい。

#### リファクタリング

ata の導入の前にこんがらがってきているコードをリファクタリングする

`src/components/Monaco/Editor.tsx`: monaco-editor を React でラッピングしたものでありその主な機能を提供するもの。

#### @typescript/ata の導入

どうやって依存関係を管理していけばいいのか？

依存関係が追加・編集・削除される可能性のある部分：

-   template から必須依存関係を手動取得
-   コード上の import 文
-   package.json の dependencies または devDependencies の編集
-   (未定)依存関係手動取得手段での取得

1. コード上の import 文

monaco-editor の onDidChangeModelContent でカレントモデルの code 取得 --> `ata(editor.current.getModel()!.getValue());`

つまり、editor コードの変更がトリガーなので FilesContext の update アクションで呼出してもいいのかも。

editor --> onDidChangeModelContent --> ata(code) --> ata.finished()または ata.fileRecieved

2. template から必須依存関係を手動取得

この場合エディタ上のコードは関係ない。

そうなると Filescontext で ata 扱われると困る。

依存関係取得手段は FilesContext から独立していてほしい。

mounting editor --> read template dependencies --> send dependencies to ata --> fetch them -->

3. package.json の dependencies または devDependencies の編集

ユーザが package.json を編集していいかどうかによる。

できれば読み取り専用にしたいね。

#### 検証：ata を関数のまま context 経由で渡したい

```TypeScript
import React, { createContext, useCallback, useMemo, useContext } from 'react';

interface iATAContext {

}

const AtaProvider = createContext<>()

const ATAProvider = () => {
    // TODO: useMemoで管理するべきなのかどうか
    // extraLIbsはクロージャで囲ってしまうべきか？
    // refで保持するべきか？
    const extraLibs = useMemo(() => new Map<
        string,
        { js: monaco.IDisposable; ts: monaco.IDisposable }
    >());

    const ata = useCallback(ATA.setupTypeAcquisition(ataConfig), []);

    const ataConfig: ATA.ATABootstrapConfig = {
        projectName: 'My ATA Project',
        typescript: ts,
        logger: console,
        delegate: {
            receivedFile: (code: string, path: string) => {
                onAtaRecievedFile(code, path);
            },
            started: () => {
                console.log('ATA start');
            },
            progress: (downloaded: number, total: number) => {
                console.log(`Got ${downloaded} out of ${total}`);
            },
            finished: (vfs) => {
                console.log("ata finished");
                console.log(vfs);
            },
        },
    };

    const onAtaRecievedFile = (code: string, path: string) => {
        console.log('ATA done');
        // for (const [key, value] of vfs.entries()) {
        const cachedLib = extraLibs.get(path);
        if (cachedLib) {
            cachedLib.js.dispose();
            cachedLib.ts.dispose();
        }
        // Monaco Uri parsing contains a bug which escapes characters unwantedly.
        // This causes package-names such as `@expo/vector-icons` to not work.
        // https://github.com/Microsoft/monaco-editor/issues/1375
        let uri = monaco.Uri.from({
            scheme: 'file',
            path: path,
        }).toString();
        if (key.includes('@')) {
            uri = uri.replace('%40', '@');
        }

        const js =
            monaco.languages.typescript.javascriptDefaults.addExtraLib(
                code,
                uri
            );
        const ts =
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
                code,
                uri
            );
        extraLibs.set(key, { js, ts });
    }
}

```
