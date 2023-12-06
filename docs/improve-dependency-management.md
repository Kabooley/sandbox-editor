# 依存関係管理の改善

このブランチは`feat_footer`から派生した。

`src/worker/fetchLibs.worker.ts`の機能を`@typescript/ata`の機能のように改善して、

`react-dom/client`の型情報ファイルが取得できない問題を解決する。

対象ファイル:

- `src/worker/fetchLibs.worker.ts`,
- `src/context/TypingLibsContext.tsx`

## summary

- [機能](#機能)

-   [直面した問題](#直面した問題)
-   [解決に至った方法](#解決に至った方法)
- [cache機能](#cache機能)
- [debug](#debug)
- [変更内容](#変更内容)

## 機能

- `fetchLibs.worker.ts`: 依存関係typesファイルの取得
- `TypingLibsContext.tsx`: `fetchLibs.worker.ts`のインスタンスと通信して依存関係を管理するコンテキスト
- `requestFetchTyings`: コンテキストが子コンポーネントに提供する関数で、呼び出し側が依存関係をワーカーにリクエストできる関数
- `dependencies`: 現在取得している依存関係のリストで、`TypingLibsContext.tsx`がstate管理している。コンテキストとして子コンポーネントに提供している


## 依存関係を削除する機能

`DependencyList`からユーザ操作によって依存関係一覧から依存関係を削除できるようにして、削除された依存関係をmonacoの登録ライブラリ他から削除できるようにする

問題：

`react`を削除するとした場合に、あとから`react`の依存関係全てを捜索することが可能なのか？

`react@17.2.0`をリクエストしたら...

```bash
Add extra Library: /node_modules/@types/react/package.json
Add extra Library: /node_modules/@types/react/experimental.d.ts
Add extra Library: /node_modules/@types/react/global.d.ts
Add extra Library: /node_modules/@types/react/index.d.ts
Add extra Library: /node_modules/@types/react/jsx-dev-runtime.d.ts
Add extra Library: /node_modules/@types/react/jsx-runtime.d.ts
Add extra Library: /node_modules/@types/react/next.d.ts
Add extra Library: /node_modules/@types/react/ts5.0/experimental.d.ts
Add extra Library: /node_modules/@types/react/ts5.0/global.d.ts
Add extra Library: /node_modules/@types/react/ts5.0/index.d.ts
Add extra Library: /node_modules/@types/react/ts5.0/jsx-dev-runtime.d.ts
Add extra Library: /node_modules/@types/react/ts5.0/jsx-runtime.d.ts
Add extra Library: /node_modules/@types/react/ts5.0/next.d.ts
Add extra Library: /node_modules/csstype/package.json
Add extra Library: /node_modules/csstype/index.d.ts
Add extra Library: /node_modules/@types/prop-types/package.json
Add extra Library: /node_modules/@types/prop-types/index.d.ts
Add extra Library: /node_modules/@types/scheduler/package.json
Add extra Library: /node_modules/@types/scheduler/index.d.ts
Add extra Library: /node_modules/@types/scheduler/tracing.d.ts
```


以上のような依存関係が取得できる。

`@types/react`がついている奴はわかりやすいからいいけれど、`csstype`とか`react`関連ライブラリであるということはあとから知ることができない。


## 直面した問題

以下、エラーコードを見てみたところ、どういうわけか`fetchLibs.worker.ts`は依存関係にmonaco-editorのライブラリの`browser.js`なるものを取りこんでおり、

こいつが（おそらく）グローバル変数として`window`を要求していることが原因であるようだ。

問題はworker環境はグローバル変数が`DedicatedWorkerGlobalScope`であって`window`ではないことであるのと、

なんでそんなimportしていないライブラリをこのワーカーは参照しているのかという点。

#### エラーコード

```bash
browser.js:131 Uncaught (in promise) ReferenceError: window is not defined
    at eval (browser.js:131:1)
    at ./node_modules/monaco-editor/esm/vs/base/browser/browser.js (vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_idb-keyval_dist_-7d7b36.bundle.js:928:1)
    at options.factory (src_worker_fetchLibs_worker_ts.bundle.js:790:31)
    at __webpack_require__ (src_worker_fetchLibs_worker_ts.bundle.js:208:33)
    at fn (src_worker_fetchLibs_worker_ts.bundle.js:429:21)
    at eval (fontMeasurements.js:6:82)
    at ./node_modules/monaco-editor/esm/vs/editor/browser/config/fontMeasurements.js (vendors-node_modules_monaco-editor_esm_vs_editor_editor_main_js-node_modules_idb-keyval_dist_-7d7b36.bundle.js:3238:1)
    at options.factory (src_worker_fetchLibs_worker_ts.bundle.js:790:31)
    at __webpack_require__ (src_worker_fetchLibs_worker_ts.bundle.js:208:33)
    at fn (src_worker_fetchLibs_worker_ts.bundle.js:429:21)
```

#### workerコード

```TypeScript
// fetchLibs.worker.ts
import { valid } from 'semver';
import {
    getFileTreeForModuleByVersion,
    getFileForModuleByFilePath,
    getNPMVersionForModuleByReference,
    getNPMVersionsForModule,
} from './fetcher';
import { mapModuleNameToModule } from './edgeCases';
import { createStore, set as setItem, get as getItem } from 'idb-keyval';
import {
    iTreeMeta,
    iConfig,
    iRequestFetchLibs,
    iResponseFetchLibs,
} from './types';

// DEBUG:
import { logArrayData } from '../utils';


// TODO: typescriptをimportするのはここであるべきか？
// import ts from 'typescript';
import { preProcessFile } from 'typescript';

// なんかtypescriptを直接インポートするとwindowってなに？ってエラーが出る
// そのためネットから取得する
// (同じ理由でtypeof import("typescript")もできない？)
// declare const ts: any;
// if (typeof self.importScripts === 'function') {
//     self.importScripts(
//         'https://cdn.jsdelivr.net/npm/typescript@5.2.2/lib/typescript.min.js'
//     );
//     console.log('[fetchLibs.worker] typescript Downloaded');
// } else {
//     console.log(
//         `[fetchLibs.worker] IDK why but self is not apprapriate global`
//     );
//     console.log(self);
// }


// ...以下省略
```

## 解決に至った方法

依存関係にmonacoライブラリを含んでいる原因は、

```TypeScript
// worker/fetchLibs.worker.ts
import { logArrayData } from '../utils';
```

こいつでした。コメントアウトしてみたら正常に動いた。

つまり、

上記のimportしようとしているメソッドは`src/utils/index.ts`からインポートしており、

この`index.ts`の中には、monaco-editorをimportしているメソッドを含んでいた。

```TypeScript

// こいつ。`getModelByPath`はmonacoをインポートしている。
export { getModelByPath } from './getModelByPath';
export { getFileLanguage } from './getFileLanguage';
export { getFilenameFromPath } from './getFilenameFromPath';
export { isFolderNameValid } from './isFolderNameValid';
export { isFilenameValid } from './isFilenameValid';
export { removeFirstSlash } from './removeFirstSlash';
export { isJsonString } from './isJsonString';
export { isJsonValid } from './isJsonValid';
export { sortObjectByKeys } from './sortObjectByKeys';
export { generateTreeForBundler } from './generateTreeForBundler';
export { findMax } from './findMax';
export { moveInArray } from './moveInArray';
// `fetchLibs.worker`が取り込もうとしていた対象
export { logArrayData } from "./logArrayData";
```

そのため

**webpackはその仕様から`fetchLibs.worker.ts`の全ての依存関係が動くように必要な依存関係をすべてワーカーにバンドルしようとして**

`utils`ディレクトリにあるすべてを取り込み、結果`window`を必要とするモジュールにたどり着いてしまった

というのがことの顛末。

## Tips

#### ワーカーが変な依存関係をしていたら調べるといい場所

Chromeのデベロッパーツールの`source`より。

左側のペインの`page`内容が...

```explorer
top
    localhost:8080
    React DevelopperTool
    ....
your-worker-awesome-name....ts
fetchLibs_worker_ts_....ts
```

みたいに並んでいる。

調べたいworkerが`fetchLibs_worker_ts...`だとしたらそいつをクリックして

```explorer

fetchLibs_worker_ts_....ts
    localhost:8080
    your-app-project-name
        node_modules
        src/worker
```

みたいにひらく。

ここの内容が`fetchLIbs_worker_ts..`の依存関係である。

依存関係がおかしいと思ったらここの内容を調べてみよう。


## cache機能

TypingLibsContext3.tsx



3か所くらい設けることになるか？

- TypingLibsContextのstate.dependencies: DependencyListからリクエストされたらstate.dependenciesをまず捜索してインストール済でないか確認する。fetch後はworkerから帰ってきたmoduleNameとversionの組み合わせでsetDependeciesされる


#### 前提

TODO: `fetchLibs.worker.ts`へリクエストしたときのversionと実際にダウンロードすることになるversionの違いが発生するかもしれなくて、workerのレスポンスは実際にダウンロードすることになるversionを返したい。リクエストの時にlatestがアリとしているならだけど


## debug

#### 2か所でmonacoのaddExtraLibsを動かすと両者の取得したライブラリはそれぞれ独立してしまうか？

結論：どこで取得しても共通である。

EditorContainer.tsxとTypingLibsContext.tsxの両方のdidUpdateComponentのタイミングで`getExtraLibs`を実行したところそれぞれが取得したライブラリが両方で取得できていることが分かった。


#### TypingLibsContext3.tsxを稼働させるためにMonacoContainer.tsxはaddExtraLibsを独自に行う必要がある件

TypingLibsContextは現状2つの値を提供するだけ。

`requstFetchTypings`と`dependencies`である。

これ以上コンテキストをやたらと増やしたくないという事情を優先するとしたら、次の通りaddExtraLibsは2か所で活動することになる。

- TypingLiibsContextではライブラリを登録する
- MonacoContainerでは仮想ファイルを登録する

monacoのaddExtraLibsは別々に稼働させても問題ないのか確認すること

参考: https://microsoft.github.io/monaco-editor/typedoc/interfaces/languages.typescript.LanguageServiceDefaults.html#getExtraLibs

## 変更内容

- `monaco.languages.[type|java]script.[type|java]scriptDefault.addExtraLibs`はTypingLibsContext.tsxだけで呼出し、その呼出す関数を`addTypings`というコンテキスト経由で取得できる関数を提供することで好きな場所で呼出可能としていたが、これをやめて2か所で呼び出すことにした。

    `TypingLibsContext.tsx`: jsdelvr経由でnpm パッケージモジュールを取得する
    `EditorContainer.tsx`: 仮想ファイルの内容を登録する

    両モジュールはそれぞれ独立して`addExtraLIbs`を呼び出すが、内部的にはそのスコープは共通みたいなので問題なし
    ([2か所でmonacoのaddExtraLibsを動かすと両者の取得したライブラリはそれぞれ独立してしまうか？](#2か所でmonacoのaddExtraLibsを動かすと両者の取得したライブラリはそれぞれ独立してしまうか？))