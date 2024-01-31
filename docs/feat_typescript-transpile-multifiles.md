# Note: TypeScript Transpile Multilple Files

## Summary

-   [How TypeScript Playground transpiles TypeScript code](#How-TypeScript-Playground-transpiles-TypeScript-code)
-   [How to transpile multiple files](#How-to-transpile-multiple-files)
-   [Display Errors](#Display-Errors)
- [esbuild content-type TypeScript](#esbuild-content-type-TypeScript)
- [ファイル全体の型情報を基にコンパイルさせる](#ファイル全体の型情報を基にコンパイルさせる)

## TODOs

-   TODO: type check は monaco-editor がやってくれているという認識でいいのだろうか？
    [type check は monaco-editor がやっている？](#type-checkはmonaco-editorがやっている？)

## How TypeScript Playground transpiles TypeScript code

playground はエディタに monaco-editor を使っている。

monaco-editor が自身で生成するワーカがトランスパイルしてくれる。

TypeScript-Website:

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

## How to transpile multiple files

ひとつひとつのファイルをトランスパイルしてくれるけど、アプリケーションは複数のファイルから成立するのであって、

別のファイルで定義されている型情報を前提とする部分だらけである。

そうした型チェックはしてくれるのか？

ひとまずエラーを表示するようにしてから...かな

## Display Errors

-   TODO: エディタ編集中のエラーの取得

#### エディタ編集中のエラー：

https://github.com/microsoft/TypeScript-Website/blob/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/playground/src/sidebar/showErrors.ts#L6

playground の sidebar の`Errors`へ表示される。

`monaco.editor.getModelMarkers({ resource: model.uri })`でエラー内容を取得しているみたい

#### 実装：エディタ編集中のエラー

```TypeScript
// onDidChangeModelContentの時に呼出してみると...
    const handleMarkers = () => {
        const model = editor.current?.getModel();
        if(model) {
            const marker = monaco.editor.getModelMarkers({ resource: model.uri });
            if(!marker.length) { console.log('No errors'); }
            console.log("marker:");
            console.log(marker);
        }
    };
```

次の結果が得られた。

```JavaScript
[
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "2792",
        "severity": 8,
        "message": "Cannot find module 'react-dom/client'. Did you mean to set the 'moduleResolution' option to 'node', or to add aliases to the 'paths' option?",
        "startLineNumber": 1,
        "startColumn": 28,
        "endLineNumber": 1,
        "endColumn": 46,
        "relatedInformation": [],
        "tags": []
    },
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "2792",
        "severity": 8,
        "message": "Cannot find module 'react'. Did you mean to set the 'moduleResolution' option to 'node', or to add aliases to the 'paths' option?",
        "startLineNumber": 2,
        "startColumn": 19,
        "endLineNumber": 2,
        "endColumn": 26,
        "relatedInformation": [],
        "tags": []
    },
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "2503",
        "severity": 8,
        "message": "Cannot find namespace 'JSX'.",
        "startLineNumber": 5,
        "startColumn": 17,
        "endLineNumber": 5,
        "endColumn": 20,
        "relatedInformation": [],
        "tags": []
    },
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "17004",
        "severity": 8,
        "message": "Cannot use JSX unless the '--jsx' flag is provided.",
        "startLineNumber": 7,
        "startColumn": 9,
        "endLineNumber": 7,
        "endColumn": 36,
        "relatedInformation": [],
        "tags": []
    },
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "17004",
        "severity": 8,
        "message": "Cannot use JSX unless the '--jsx' flag is provided.",
        "startLineNumber": 8,
        "startColumn": 11,
        "endLineNumber": 8,
        "endColumn": 17,
        "relatedInformation": [],
        "tags": []
    },
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "17004",
        "severity": 8,
        "message": "Cannot use JSX unless the '--jsx' flag is provided.",
        "startLineNumber": 14,
        "startColumn": 13,
        "endLineNumber": 14,
        "endColumn": 20,
        "relatedInformation": [],
        "tags": []
    }
]
```

siverity: https://microsoft.github.io/monaco-editor/docs.html#enums/MarkerSeverity.html

マーカーの種類っぽい。




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

## type check は monaco-editor がやっている？

いま、

files --> files をすべて typescript worker でコンパイル --> コンパイル結果を esbuild でバンドル --> 結果取得 --> iframe で実行

という流れを想定しているけれど、

*files をすべて typescript worker でコンパイル*しているのは型チェックをできるからかも？と期待しているからであり、

実際できるのかどうかはまだわからないので

もしかしたら無駄な作業かもしれない。

monaco-editor が既に編集中に型チェックしてくれている、ということなら、

丸っと*files をすべて typescript worker でコンパイル*の部分はいらないかもしれない...

ということでバンドル時またはコンパイル時でもなんでも、

型チェックができるようにしたいわけ。

そのうえで処理チャートをどうするか考える。

## 参考

monaco-editor の TypeScript カスタムワーカについて。

https://github.com/microsoft/monaco-typescript/pull/65

typescript worker のラッパーとかなんとか。

https://github.com/microsoft/TypeScript-Website/tree/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/playground-worker

カスタムワーカの型情報 tsWorker.ts

https://github.com/microsoft/TypeScript-Website/blob/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/sandbox/src/tsWorker.ts#L4

カスタムワーカを生成するにはワーカファクトリを使わないといけない？

https://github.com/microsoft/monaco-typescript/pull/65#issuecomment-683926707

とにかく上記の情報をまとめること。


## esbuild content-type TypeScript

https://esbuild.github.io/content-types/#typescript

#### まとめ

- esbuildではTypeScriptの型チェックを行わないので、esbuildの外で型チェックを行わなくてはならない。

- esbuildは複数のTypeScriptで書かれたモジュールがあったとしても、それらを各々独立してコンパイルするためimportされた内容が型情報なのか値なのか判断できない。

つまり、ファイル間型参照はesbuildにとって無意味である。

esbuildでTypeScriptはトランスパイル・バンドルできるけれど、型情報は無視してそれぞれのファイルは独立してトランスパイルするからTypeScriptの意味がなくなるのである。

結局実行時にエラーが出る。

なので、

esbuildへ渡す前に、

全体の型情報を元にトランスパイルさせて、

それからesbuildへ渡してバンドルしてもらう

という流れが正解になるはず...

「全体の型情報」はどうやってtranspilerへわからせればいいんだ？




#### 概要

> このローダーは、.ts、.tsx、.mts、および .cts ファイルに対してデフォルトで有効になっています。つまり、esbuild には TypeScript 構文の解析と型注釈の破棄のサポートが組み込まれています。ただし、esbuild は型チェックを行わないため、型をチェックするには esbuild と並行して tsc -noEmit を実行する必要があります。これは esbuild 自体が行うものではありません。 次のような TypeScript の型宣言は解析されて無視されます (すべてを網羅したものではありません)。

Caveats:

#### ファイルは各々独立してコンパイルされる

> 単一のモジュールをトランスパイルする場合でも、TypeScript コンパイラーは実際にはインポートされたファイルを解析するため、インポートされた名前が型であるか値であるかを判断できます。

> ただし、esbuild や Babel (および TypeScript コンパイラーの transpileModule API) などのツールは、各ファイルを個別にコンパイルするため、インポートされた名前が型であるか値であるかを判断できません。 このため、esbuild で TypeScript を使用する場合は、isolateModules TypeScript 構成オプションを有効にする必要があります。このオプションを使用すると、各ファイルがファイル間の型参照を追跡せずに個別にコンパイルされる esbuild のような環境で、コンパイルミスを引き起こす可能性のある機能を使用できなくなります。たとえば、export {T} from './types' を使用して、別のモジュールから型を再エクスポートできなくなります (代わりに、export type {T} from './types' を使用する必要があります)。 #

tsconfig: `isolateModules`

https://www.typescriptlang.org/tsconfig#isolatedModules

