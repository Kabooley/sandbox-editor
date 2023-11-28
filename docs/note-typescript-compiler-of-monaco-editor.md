# monaco-editor の TypeScript コンパイラ機能の利用について

NOTE: 使う方法は分かったけど今のところ使う予定がない。

TODO: 何を実現しているのか初めて見る人にわかるようにまとめること

TODO: ノートの転記。必要な情報なのか検証していないので要検証

## TypeScript compile

どっかにまとめたノートを転記すること。

このリポジトリの`sample`だと、TypeScript worker が渡したコードをコンパイルして渡してくれる。

一応設定などを記録しておく。

#### webpack.config.js

```TypeScript
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: 'development',
    entry: {
        index: './src/index.tsx',

        'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
        'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
        'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
        'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
        'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
    },
    devServer: {
        static: './dist',
        hot: true,
        port: 8080,
        allowedHosts: 'auto',
        // DEBUG:
        // Only for development mode
        headers: {
            'Access-Control-Allow-Origin': '*', // unpkg.com
            // 'Access-Control-Allow-Origin': 'unpkg.com',		// unpkg.com
            'Access-Control-Allow-Headers': '*', // GET
            'Access-Control-Allow-Methods': '*',
        },
    },
    resolve: {
        extensions: ['.*', '.js', '.jsx', '.tsx', '.ts'],
    },
    output: {
        globalObject: 'self',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-typescript',
                                '@babel/preset-react',
                            ],
                            plugins: [
                                isDevelopment &&
                                    require.resolve('react-refresh/babel'),
                            ].filter(Boolean),
                        },
                    },
                ],
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.ttf$/,
                use: ['file-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: 'src/index.html',
        }),
        isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
};

```

しいて言えば`devServer`の設定の違いかしら。

#### tsconfig.json

```JSON
{
    "compilerOptions": {
        "sourceMap": true,
        "module": "ES2020",
        "moduleResolution": "node",
        "strict": true,
        "target": "ES6",
        "outDir": "./dist",
        "lib": [
            "dom",
            "es5",
            "es6",
            "ES2016",
            "es2015.collection",
            "es2015.promise",
            "WebWorker"
        ],
        "types": [],
        "baseUrl": "./node_modules",
        "jsx": "preserve",
        "esModuleInterop": true,
        "typeRoots": ["node_modules/@types"]
    },
    "include": ["./src/**/*"],
    "exclude": ["node_modules"]
}
```

## TypeScript-Compiler

知りたいのは、

-   TypeScript のコンパイルエラーをどうやって取得して、どうやってわかりやすく表示しているのか。

-   複数ファイルを手動 tsc コンパイルできるのか。

#### How to detect errors and display them

#### エディタ編集中のエラー：

https://github.com/microsoft/TypeScript-Website/blob/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/playground/src/sidebar/showErrors.ts#L6

playground の sidebar の`Errors`へ表示される。

`monaco.editor.getModelMarkers({ resource: model.uri })`でエラー内容を取得しているみたい

#### コンパイル実行時のエラー：

playground の`Logs`へ表示される。

https://github.com/microsoft/TypeScript-Website/blob/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/playground/src/sidebar/runtime.ts#L113

```TypeScript
export const runWithCustomLogs = (closure: Promise<string>, i: Function) => {
  const noLogs = document.getElementById("empty-message-container")
  const logContainer = document.getElementById("log-container")!
  const logToolsContainer = document.getElementById("log-tools")!
  if (noLogs) {
    noLogs.style.display = "none"
    logContainer.style.display = "block"
    logToolsContainer.style.display = "flex"
  }

  // sidebarのLogへ内容を出力する
  rewireLoggingToElement(
    () => document.getElementById("log")!,
    () => document.getElementById("log-container")!,
    closure,
    true,
    i
  )
}

// Thanks SO: https://stackoverflow.com/questions/20256760/javascript-console-log-to-html/35449256#35449256

function rewireLoggingToElement(
  eleLocator: () => Element,
  eleOverflowLocator: () => Element,
  closure: Promise<string>,
  autoScroll: boolean,
  i: Function
) {
  // consoleとはconsole.logのconsole
  // https://developer.mozilla.org/ja/docs/Web/API/console
  const rawConsole = console

  closure.then(js => {
    const replace = {} as any
    bindLoggingFunc(replace, rawConsole, "log", "LOG")
    bindLoggingFunc(replace, rawConsole, "debug", "DBG")
    bindLoggingFunc(replace, rawConsole, "warn", "WRN")
    bindLoggingFunc(replace, rawConsole, "error", "ERR")
    replace["clear"] = clearLogs
    const console = Object.assign({}, rawConsole, replace)
    try {

      const safeJS = sanitizeJS(js)
      //   evalで実行してみて
      eval(safeJS)
    } catch (error) {
      console.error(i("play_run_js_fail"))
      console.error(error)

      if (error instanceof SyntaxError && /\bexport\b/u.test(error.message)) {
        console.warn(
          'Tip: Change the Module setting to "CommonJS" in TS Config settings to allow top-level exports to work in the Playground'
        )
      }
    }
  })

  function bindLoggingFunc(obj: any, raw: any, name: string, id: string) {
    obj[name] = function (...objs: any[]) {
      const output = produceOutput(objs)
      const eleLog = eleLocator()
      const prefix = `[<span class="log-${name}">${id}</span>]: `
      const eleContainerLog = eleOverflowLocator()
      allLogs.push(`${prefix}${output}<br>`)
      eleLog.innerHTML = allLogs.join("<hr />")
      if (autoScroll && eleContainerLog) {
        eleContainerLog.scrollTop = eleContainerLog.scrollHeight
      }
      raw[name](...objs)
    }
  }


  function produceOutput(args: any[]) {
    let result: string = args.reduce((output: any, arg: any, index) => {
      const textRep = objectToText(arg)
      const showComma = index !== args.length - 1
      const comma = showComma ? "<span class='comma'>, </span>" : ""
      return output + textRep + comma + " "
    }, "")

    Object.keys(replacers).forEach(k => {
      result = result.replace(new RegExp((replacers as any)[k], "g"), k)
    })

    return result
  }

```

つまり、

-   typescript でコンパイルされたコードを取得する
-   console オブジェクトへの出力を読み取れるように console オブジェクトと読み取り関数を結びつける
-   コンパイルコードを（問題ないコードか検査してから）eval で実行してみる
-   try...catch で取得してエラーを console 出力。同時に結びつけられた関数が出力内容を読み取る

という感じらしい。

https://github.com/microsoft/TypeScript-Website/blob/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/playground/src/index.ts#L16

```TypeScript
// playgrondの`Run`ボタン
const runButton = document.getElementById("run-button")
  if (runButton) {
    runButton.onclick = () => {
      const run = sandbox.getRunnableJS()
      const runPlugin = plugins.find(p => p.id === "logs")!
      activatePlugin(runPlugin, getCurrentPlugin(), sandbox, tabBar, container)

        // runは実行結果（コンパイル結果のコード）かと
      runWithCustomLogs(run, i)

      const isJS = sandbox.config.filetype === "js"
      ui.flashInfo(i(isJS ? "play_run_js" : "play_run_ts"))
      return false
    }
  }

```

#### やらなきゃいかんこと

-   編集中のエラーと実行時のエラーはどこに出力するのか決める
-   console オブジェクトの扱い方
-   monaco.editor.getModelMarkers など marker 関連の扱い方
-   esbuild のバンドルとコンパイルをどうやって両立させるのか決める
-   なんだかコンパイルがうまくいかないので TypeSCript-website の復習
-

#### Regain about how TypeScript code compiler works in website

TypeScript-Website

https://github.com/microsoft/TypeScript-Website/blob/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/sandbox/src/index.ts#L301

```TypeScript
/** Gets the JS  of compiling your editor's code */
  const getRunnableJS = async () => {
    // This isn't quite _right_ in theory, we can downlevel JS -> JS
    // but a browser is basically always esnext-y and setting allowJs and
    // checkJs does not actually give the downlevel'd .js file in the output
    // later down the line.
    if (isJSLang) {
      return getText()
    }
    const result = await getEmitResult()
    const firstJS = result.outputFiles.find((o: any) => o.name.endsWith(".js") || o.name.endsWith(".jsx"))
    return (firstJS && firstJS.text) || ""
  }
```

```TypeScript
  const getWorker = isJSLang
    ? monaco.languages.typescript.getJavaScriptWorker
    : monaco.languages.typescript.getTypeScriptWorker

    // この`TypeScriptWorker`はmonaco-editorのtypescriptのworkerのことではなく
    // カスタムワーカの可能性。
  const getWorkerProcess = async (): Promise<TypeScriptWorker> => {
    const worker = await getWorker()
    // @ts-ignore
    return await worker(model.uri)
  }

  /** Gets the results of compiling your editor's code */
  const getEmitResult = async () => {
    const model = editor.getModel()!
    const client = await getWorkerProcess()
    return await client.getEmitOutput(model.uri.toString())
  }
```

まとめると、

```TypeScript
const client: monaco.languages.typescript.TypeScriptWorker = await monaco.language.typescript.getTypeScriptWorker;
const result: ts.EmitOutput = await client.getEmitOutput(model.uri.toString());
```

ただし今のところ undefined が返されると。

以前はなぜうまくいったのだろうか。以前の履歴を追う。

#### compile がうまくいかない件の原因追及

-   検証：compile 対象コードの`defaultCode`が原因である。
    否。単純コードにしても結果は変わらず。

-   検証：custome worker が実は必要である。
    [検証：customworker](#検証：customworker)

#### 検証：customworker

monaco-editor の TypeScript カスタムワーカについて。

https://github.com/microsoft/monaco-typescript/pull/65

typescript worker のラッパーとかなんとか。

https://github.com/microsoft/TypeScript-Website/tree/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/playground-worker

カスタムワーカの型情報 tsWorker.ts

https://github.com/microsoft/TypeScript-Website/blob/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/sandbox/src/tsWorker.ts#L4

カスタムワーカを生成するにはワーカファクトリを使わないといけない？

https://github.com/microsoft/monaco-typescript/pull/65#issuecomment-683926707

とにかく上記の情報をまとめること。
