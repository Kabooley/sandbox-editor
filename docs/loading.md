# Loading 

## Summary

- [Chrome Dev Tools Performance](#Chrome-Dev-Tools-Performance)
- [Performanceの基準の参考](#Performanceの基準の参考)

## TODOs

- TODO: [初期マウント完了までの計測](#初期マウントの完了までの計測)
- TODO: [Profiler](#Profiler)

- TODO: buildしたアプリケーションを実行させるにはどうすればいいのか
- TODO: webpack5におけるProfiler用の設定とは？
- TODO: やっぱり初期レンダリング時にバンドルしていない（編集を開始しないとバンドルしないのかも）

## React lazy

https://react.dev/reference/react/lazy

```JavaScript
import React from "react";

// lazy(loadFunction)
const MarkDownPreview = React.lazy(() => import('./MarkDownPreview.js'));
```

loadFunction:

上記の例でいえば、`MarkDownPreview`を初めてレンダリングしようとするまで、`./MarkDownPreview.js`のローディングを保留する。

この`MarkDownPreview`をレンダリングしようという段階で`MarkDownPreview.js`のローディングを試みる。

loadFunctionはPromiseを返す関数でなくてはならない。

ローディングの際にresolveされるまで待機する。

rejectされたらもっとも近い場所のエラーバウンダリでエラーをキャッチする

通常の`import`文でモジュールをインポートする場合と異なるのは、

`import`文でインポートするときは、そのimport分を含んでいるモジュールが読み込まれたときであるのに対して、

`lazy + import()`でインポートする場合はその`import()`でインポートするモジュールを初めてレンダリングする段階で読み込む

という点である。

レンダリングされる段階で初めて読み込み開始されるとのことだけど、

レンダリング -> 読み込み（非同期）-> lazy()の解決 -> そのコンポーネントのレンダリング

という段階を踏むことになるけれど、「読み込み」「解決」の間はレンダリングプロセス中ということでいいのかしら？

しかし読み込みは非同期なので同期的な処理が一度は完了しているはずなので、

非同期読み込みが完了するまでの間動的コンポーネントをどう扱っているのか？nullなのか？

--> 単純に存在しないだけである。

#### 通常importで取得したコンポーネントと同時にレンダリングするならlazy読み取りする意味はないか？

### 参考

https://github.com/expo/snack/blob/15cac8943ef75066fd5d4d4cd5201465412c4537/website/src/client/components/EditorView.tsx#L36


## 初期マウントの完了までの計測

各コンポーネントが初期マウント完了するまでに何をトリガーとして何度呼び出されているのか調査する

一時的に調査のために調査用のフックを作成する

自作カスタムフック：`useLoadingSurvey.tsx` ただ副作用でconsole.logするだけ
Profiler：Reactの組み込みライブラリ

```TypeScript
```

## Profiler

https://react.dev/reference/react/Profiler

https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977

https://www.dhiwise.com/post/how-to-optimize-react-app-performance-with-webpack-5

- TODO: buildしたアプリケーションを実行させるにはどうすればいいのか
- TODO: webpack5におけるProfiler用の設定とは？

## [webpack] how to run build app built by webpack?

https://webpack.js.org/guides/production/

Production用のwebpack configを作りなさいと。

いまのところ変更するべきは以下の部分か。

```JavaScript
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  mode: "development",
  devServer: {
    static: "./dist",
    hot: true,
    port: 8080,
    // allowedHosts: 'auto',
    // codesandboxで動かす都合上以下のhostに設定する
    allowedHosts: "lpzft6-8080.csb.app",
    // DEBUG:
    // Only for development mode
    headers: {
      "Access-Control-Allow-Origin": "*", // unpkg.com
      // 'Access-Control-Allow-Origin': 'unpkg.com',		// unpkg.com
      "Access-Control-Allow-Headers": "*", // GET
      "Access-Control-Allow-Methods": "*",
    },
    client: {
      overlay: false,
    },
  },
    //   ...
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-typescript",
                "@babel/preset-react",
              ],
              plugins: [
                isDevelopment && require.resolve("react-refresh/babel"),
              ].filter(Boolean),
            },
          },
        ],
      },
    //   ...
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "src/index.html",
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
};
```

#### 環境変数の設定

https://stackoverflow.com/a/30061249/22007575

## 走り書き stephan course

userのハードドライブ上にアプリケーションの更新内容を保存する

...かわりに更新内容を一つのファイルにまとめて保存するという手段をとる

アプリケーションをローカル環境に影響できるようにする

ローカル環境にローカルExpressサーバを起動させて、ローカルからのアプリケーションの起動を可能にさせる

ローカルサーバ上にはLocal Node apiで動くアプリケーションが配備されており

ブラウザ上で動く本アプリケーションの更新内容を記録したりする


package.json

```JSON
{ 
  "scripts": {
    "serve": "node your-local-api.js"
  }
}
```



## 初期マウント log

```bash
20:33:26.804  [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
20:33:27.960  [HMR] Waiting for update signal from WDS...
20:33:30.946  [Modal] rendering. hide

# monaco-editorのmodelの変更
20:33:31.470  [MonacoEditor][_handleChangeModel] old model url: inmemory://model/1
20:33:31.470  [MonacoEditor][_handleChangeModel] new model url: file:///src/App.tsx
20:33:31.470  [MonacoEditor][_handleChangeModel] old model url: inmemory://model/1

# extra-libsの更新
20:33:31.470  [EditorContainer][_onDidChangeModel] old model path: 1
20:33:31.555  [EditorContainer] Add extra Library: package.json
20:33:31.556  [EditorContainer] Add extra Library: public/index.html
20:33:31.556  [EditorContainer] Add extra Library: soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt
20:33:31.556  [EditorContainer] Add extra Library: src/App.tsx
20:33:31.557  [EditorContainer] Add extra Library: src/index.tsx
20:33:31.557  [EditorContainer] Add extra Library: src/styles.css
20:33:31.557  [EditorContainer] Add extra Library: tsconfig.json

20:33:31.654  [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
20:33:31.657  [HMR] Waiting for update signal from WDS...
20:33:32.265  [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
20:33:32.267  [HMR] Waiting for update signal from WDS...
20:33:32.340  [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
20:33:32.342  [HMR] Waiting for update signal from WDS...
20:33:32.433  [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
20:33:32.435  [HMR] Waiting for update signal from WDS...
20:33:32.578  [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
20:33:32.580  [HMR] Waiting for update signal from WDS...
20:33:32.760  [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
20:33:32.763  [HMR] Waiting for update signal from WDS...
20:33:32.942  [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
20:33:32.946  [HMR] Waiting for update signal from WDS...

# ここからかしら
20:33:33.730  [rerendered] header-section
20:33:33.731  [rerendered by trigger] header-section

# scrollable-elementの更新
20:33:33.739  [ScrollableElement] --- onChildrenResizeEvent ---
20:33:33.739  state.scrollTop: 0
20:33:33.739  state.scrollLeft: 0
20:33:33.740  state.scrollheight: 0
20:33:33.740  state.scrollWidth: 0
20:33:33.740  props.height: 72.75
20:33:33.740  -------------------------------------------------
20:33:33.741  scrollHeight: 0
20:33:33.741  scrollWidth: 0
20:33:33.741  [ScrollableElement] update scrollHeight 0 --> 23
20:33:33.741  scrollTop: 0
20:33:33.741  [ScrollableElement] update scrollHeight 0 --> 240
20:33:33.742  scrollLeft: 0
20:33:33.743  [ScrollableElement] --- onChildrenResizeEvent ---
20:33:33.743  state.scrollTop: 0
20:33:33.743  state.scrollLeft: 0
20:33:33.743  state.scrollheight: 0
20:33:33.743  state.scrollWidth: 0
20:33:33.743  props.height: 330.75
20:33:33.743  -------------------------------------------------
20:33:33.743  scrollHeight: 0
20:33:33.743  scrollWidth: 0
20:33:33.743  [ScrollableElement] update scrollHeight 0 --> 110
20:33:33.743  scrollTop: 0
20:33:33.743  [ScrollableElement] update scrollHeight 0 --> 240
20:33:33.743  scrollLeft: 0
20:33:33.744  [ScrollableElement] --- onChildrenResizeEvent ---
20:33:33.744  state.scrollTop: 0
20:33:33.744  state.scrollLeft: 0
20:33:33.744  state.scrollheight: 0
20:33:33.744  state.scrollWidth: 0
20:33:33.745  props.height: 72.75
20:33:33.745  -------------------------------------------------
20:33:33.745  scrollHeight: 0
20:33:33.745  scrollWidth: 0
20:33:33.745  [ScrollableElement] update scrollHeight 0 --> 60
20:33:33.745  scrollTop: 0
20:33:33.746  [ScrollableElement] update scrollHeight 0 --> 240
20:33:33.746  scrollLeft: 0
20:33:33.747  [rerendered] pane-section
20:33:33.747  [rerendered by trigger] pane-section
20:33:33.747  [ScrollableElement] --- onChildrenResizeEvent ---
20:33:33.747  state.scrollTop: 0
20:33:33.747  state.scrollLeft: 0
20:33:33.748  state.scrollheight: 0
20:33:33.748  state.scrollWidth: 0
20:33:33.748  props.height: 28
20:33:33.748  -------------------------------------------------
20:33:33.748  scrollHeight: 0
20:33:33.748  scrollWidth: 0
20:33:33.748  [ScrollableElement] update scrollHeight 0 --> 29
20:33:33.748  scrollTop: 0
20:33:33.748  [ScrollableElement] update scrollHeight 0 --> 121
20:33:33.748  scrollLeft: 0

# editor-section, preview-section, typinglibs-context, files-context, main
20:33:33.749  [rerendered] editor-section
20:33:33.749  [rerendered by trigger] editor-section
20:33:33.751  [rerendered] preview-section
20:33:33.751  [rerendered by trigger] preview-section
20:33:33.752  [TypingLibsContext] Updated packageJson
20:33:33.753  [rerendered] typing-libs-context
20:33:33.753  [rerendered by trigger] typing-libs-context
20:33:33.753  [rerendered] bundle-context
20:33:33.753  [rerendered by trigger] bundle-context
20:33:33.753  [rerendered] files-context
20:33:33.754  [rerendered by trigger] files-context
20:33:33.754  [rerendered] split-pane
20:33:33.754  [rerendered by trigger] split-pane
20:33:33.754  [rerendered] main-container
20:33:33.755  [rerendered by trigger] main-container
20:33:33.755  [rerendered] footer-section
20:33:33.756  [rerendered by trigger] footer-section
20:33:33.756  [rerendered] layout-index.tsx
20:33:33.758  [rerendered by trigger] layout-index.tsx

20:33:33.811  [ScrollableElement] --- onChildrenResizeEvent ---
20:33:33.811  state.scrollTop: 0
20:33:33.811  state.scrollLeft: 0
20:33:33.811  state.scrollheight: 110
20:33:33.811  state.scrollWidth: 240
20:33:33.811  props.height: 330.75000000000006
20:33:33.811  -------------------------------------------------
20:33:33.812  scrollHeight: 110
20:33:33.812  scrollWidth: 240

# 
# Reloads webpack dev server so many times
# 

# package.json updates according to data file package.json dependencies
# それに伴いものすごい回数typingLibsContextが呼び出される
20:33:38.794  [getDiffOfTwoShallowObjects]
20:33:38.794  Object
20:33:38.794  Object
20:33:38.794  [getDiffOfTwoShallowObjects]
20:33:38.795  Object
20:33:38.795  Object
20:33:38.889  [rerendered] typing-libs-context
20:33:38.889  [fetchLibs.worker][onmessage] Got request: loader-utils@3.2.1
20:33:38.889  [rerendered by trigger] typing-libs-context
20:33:38.891  [fetchLibs.worker][onmessage] Got request: react@18.2.0
20:33:38.891  [rerendered] typing-libs-context
20:33:38.891  [rerendered by trigger] typing-libs-context
20:33:38.894  [fetchLibs.worker][onmessage] Got request: react-dom@18.2.0
20:33:38.894  [rerendered] typing-libs-context
20:33:38.894  [rerendered by trigger] typing-libs-context
20:33:38.897  [fetchLibs.worker][onmessage] Got request: react-scripts@5.0.1
20:33:38.897  [rerendered] typing-libs-context
20:33:38.897  [rerendered by trigger] typing-libs-context
20:33:38.900  [fetchLibs.worker][onmessage] Got request: @types/react@18.0.25
20:33:38.901  [rerendered] typing-libs-context
20:33:38.901  [rerendered by trigger] typing-libs-context
20:33:38.904  [fetchLibs.worker][onmessage] Got request: @types/react-dom@18.0.9
20:33:38.905  [rerendered] typing-libs-context
20:33:38.905  [rerendered by trigger] typing-libs-context
20:33:38.907  [fetchLibs.worker][onmessage] Got request: typescript@4.4.2
20:33:38.907  [rerendered] typing-libs-context
20:33:38.908  [rerendered by trigger] typing-libs-context
20:33:38.911  [rerendered] typing-libs-context
20:33:38.911  [rerendered by trigger] typing-libs-context
20:33:39.320  [rerendered] typing-libs-context
20:33:39.320  [rerendered by trigger] typing-libs-context
20:33:39.454  [FilesContext] CHANGE_FILE: package.json
20:33:39.454  Array(7)
20:33:39.455  [rerendered] typing-libs-context
20:33:39.456  [rerendered by trigger] typing-libs-context
20:33:39.623  [EditorContainer] did update
20:33:39.623 EditorContainer.tsx:132 Object
20:33:39.623 EditorContainer.tsx:133 Array(7)
20:33:39.623 EditorContainer.tsx:134 Array(7)
20:33:39.624 TypingLibsContext.tsx:146 [TypingLibsContext] Updated packageJson
20:33:39.624 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:39.624 useLoadingSurvey.tsx:23 [rerendered] files-context
20:33:39.625 useLoadingSurvey.tsx:31 [rerendered by trigger] files-context
20:33:41.779 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:41.781 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:41.915 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:41.915 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:41.919 FilesContext.tsx:145 [FilesContext] CHANGE_FILE: package.json
20:33:41.919 FilesContext.tsx:162 Array(7)
20:33:41.920 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:41.920 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:41.957 EditorContainer.tsx:125 [EditorContainer] did update
20:33:41.958 EditorContainer.tsx:132 Object
20:33:41.958 EditorContainer.tsx:133 Array(7)
20:33:41.958 EditorContainer.tsx:134 Array(7)
20:33:41.958 TypingLibsContext.tsx:146 [TypingLibsContext] Updated packageJson
20:33:41.959 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:41.959 useLoadingSurvey.tsx:23 [rerendered] files-context
20:33:41.959 useLoadingSurvey.tsx:31 [rerendered by trigger] files-context
20:33:41.968 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:41.968 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.105 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.105 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.107 FilesContext.tsx:145 [FilesContext] CHANGE_FILE: package.json
20:33:42.107 FilesContext.tsx:162 Array(7)
20:33:42.108 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.108 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.123 EditorContainer.tsx:125 [EditorContainer] did update
20:33:42.123 EditorContainer.tsx:132 Object
20:33:42.123 EditorContainer.tsx:133 Array(7)
20:33:42.123 EditorContainer.tsx:134 Array(7)
20:33:42.124 TypingLibsContext.tsx:146 [TypingLibsContext] Updated packageJson
20:33:42.124 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.124 useLoadingSurvey.tsx:23 [rerendered] files-context
20:33:42.124 useLoadingSurvey.tsx:31 [rerendered by trigger] files-context
20:33:42.336 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.336 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.339 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.339 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.343 FilesContext.tsx:145 [FilesContext] CHANGE_FILE: package.json
20:33:42.343 FilesContext.tsx:162 Array(7)
20:33:42.343 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.343 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.419 EditorContainer.tsx:125 [EditorContainer] did update
20:33:42.419 EditorContainer.tsx:132 Object
20:33:42.419 EditorContainer.tsx:133 Array(7)
20:33:42.419 EditorContainer.tsx:134 Array(7)
20:33:42.419 TypingLibsContext.tsx:146 [TypingLibsContext] Updated packageJson
20:33:42.420 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.420 useLoadingSurvey.tsx:23 [rerendered] files-context
20:33:42.420 useLoadingSurvey.tsx:31 [rerendered by trigger] files-context
20:33:42.457 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.458 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.462 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.462 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.478 FilesContext.tsx:145 [FilesContext] CHANGE_FILE: package.json
20:33:42.478 FilesContext.tsx:162 Array(7)
20:33:42.478 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.478 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.522 EditorContainer.tsx:125 [EditorContainer] did update
20:33:42.523 EditorContainer.tsx:132 Object
20:33:42.523 EditorContainer.tsx:133 Array(7)
20:33:42.523 EditorContainer.tsx:134 Array(7)
20:33:42.523 TypingLibsContext.tsx:146 [TypingLibsContext] Updated packageJson
20:33:42.523 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.523 useLoadingSurvey.tsx:23 [rerendered] files-context
20:33:42.523 useLoadingSurvey.tsx:31 [rerendered by trigger] files-context
20:33:42.544 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.544 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.547 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.548 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.552 FilesContext.tsx:145 [FilesContext] CHANGE_FILE: package.json
20:33:42.552 FilesContext.tsx:162 Array(7)
20:33:42.571 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.572 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:42.605 EditorContainer.tsx:125 [EditorContainer] did update
20:33:42.605 EditorContainer.tsx:132 Object
20:33:42.605 EditorContainer.tsx:133 Array(7)
20:33:42.605 EditorContainer.tsx:134 Array(7)
20:33:42.605 TypingLibsContext.tsx:146 [TypingLibsContext] Updated packageJson
20:33:42.606 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.606 useLoadingSurvey.tsx:23 [rerendered] files-context
20:33:42.606 useLoadingSurvey.tsx:31 [rerendered by trigger] files-context
20:33:42.627 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:42.628 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:44.101 fetchLibs.worker.ts:409 Error: Something went wrong among fetching https://data.jsdelivr.com/v1/package/npm/@types/loader-utils@3.2.1/flat Please make sure module name or version is correct.
_callee3$ @ fetchLibs.worker.ts:409
20:33:44.104 fetchLibs.worker.ts:637 Error: Error: Something went wrong among fetching https://data.jsdelivr.com/v1/package/npm/@types/loader-utils@3.2.1/flat
    at eval (fetcher.ts:134:14)
eval @ fetchLibs.worker.ts:637
20:33:44.132 FilesContext.tsx:145 [FilesContext] CHANGE_FILE: package.json
20:33:44.133 FilesContext.tsx:162 Array(7)
20:33:44.133 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:44.133 useLoadingSurvey.tsx:31 [rerendered by trigger] typing-libs-context
20:33:44.221 EditorContainer.tsx:125 [EditorContainer] did update
20:33:44.222 EditorContainer.tsx:132 Object
20:33:44.222 EditorContainer.tsx:133 Array(7)
20:33:44.222 EditorContainer.tsx:134 Array(7)
20:33:44.223 useLoadingSurvey.tsx:23 [rerendered] typing-libs-context
20:33:44.223 useLoadingSurvey.tsx:23 [rerendered] files-context
20:33:44.223 useLoadingSurvey.tsx:31 [rerendered by trigger] files-context
20:33:54.429 getDiffOfTwoShallowObjects.ts:24 [getDiffOfTwoShallowObjects]
20:33:54.430 getDiffOfTwoShallowObjects.ts:25 {@types/react: '18.0.25', @types/react-dom: '18.0.9', react: '18.2.0', react-dom: '18.2.0', react-scripts: '5.0.1', …}
20:33:54.434 getDiffOfTwoShallowObjects.ts:26 {@types/react: '18.0.25', @types/react-dom: '18.0.9', react: '18.2.0', react-dom: '18.2.0', react-scripts: '5.0.1'}
20:33:54.434 getDiffOfTwoShallowObjects.ts:24 [getDiffOfTwoShallowObjects]
20:33:54.434 getDiffOfTwoShallowObjects.ts:25 {}
20:33:54.435 getDiffOfTwoShallowObjects.ts:26 {}
```

マウント時

初期：monaco-editorの内部処理、extra-libsの更新、scrollable-elementの更新

その後、各コンポーネントのレンダリング

typinglibsでpackage.jsonのdependenciesの反映開始

package.jsonの反映完了をもって初期マウントは完了といったところでしょうか


どうやら重たい処理が、

## TypingLibsContext.tsxのサブスクライバの再レンダリング状況



## Chrome Dev Tools Performance

https://developer.chrome.com/docs/devtools/performance/reference

https://zenn.dev/koki_tech/articles/9deb70d0a9befb

https://qiita.com/teradonburi/items/5b8f79d26e1b319ac44f

https://calibreapp.com/blog/react-performance-profiling-optimization


「ボトルネックは推測するな計測せよ」

#### ローディング完了までの計測内容

DOMContentLoadedまで：17988ms
LoadEvent: 12988ms
Summaryより: Scriptingが全体の約60%で約10000msかかっている
Bottom-Upより：`Self Time`を降順にすると、`CompileCode`が一番大きく、monaco-editorのts.workerの次にfetchLibs.worker.tsの時間がもっともかかっている

その内容はほぼ依存関係のSemverの処理時間みたい




## Performanceの基準の参考

https://web.dev/articles/rail?hl=ja

目標はユーザの満足度を向上させることで、処理速度の向上ではない。

#### Chrome dev tools

- CPU をスロットリングして、性能の低いデバイスをシミュレートします。

- ネットワークをスロットリングして、低速の接続をシミュレートします。

- メインスレッドのアクティビティを表示して、記録中にメインスレッドで発生したすべてのイベントを確認します。

- テーブルにメインスレッド アクティビティを表示して、最も時間を要したアクティビティに基づいてアクティビティを並べ替える。

- フレーム/秒（FPS）を分析し、アニメーションが本当にスムーズに実行されるかどうかを測定します。

- パフォーマンス モニターを使用すると、リアルタイムで CPU 使用率、JS ヒープサイズ、DOM ノード、1 秒あたりのレイアウトなどをモニタリングできます。

- [ネットワーク] セクションで、記録中に発生したネットワーク リクエストを可視化できます。

- 録画中にスクリーンショットをキャプチャすることで、ページの読み込み中やアニメーション表示などでページの表示状態を正確に再現できます。

- インタラクションを表示して、ユーザーがページを操作した後にページで何が起きたかを簡単に特定できます。

- 問題がある可能性のあるリスナーが起動されるたびにページをハイライト表示することで、スクロールのパフォーマンスの問題をリアルタイムで検出できます。

- ペイント イベントをリアルタイムで表示して、アニメーションのパフォーマンスを低下させている可能性がある、コストのかかるペイント イベントを特定します。


