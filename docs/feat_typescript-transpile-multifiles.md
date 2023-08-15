# Note: TypeScript Transpile Multilple Files

## Summary

-   [How TypeScript Playground transpiles TypeScript code](#How-TypeScript-Playground-transpiles-TypeScript-code)
-   [How to transpile multiple files](#How-to-transpile-multiple-files)
-   [Display Errors](#Display-Errors)

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
