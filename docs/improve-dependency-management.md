# 依存関係管理の改善

このブランチは`feat_footer`から派生した。

`src/worker/fetchLibs.worker.ts`の機能を`@typescript/ata`の機能のように改善して、

`react-dom/client`の型情報ファイルが取得できない問題を解決する。

対象ファイル:

- `src/worker/fetchLibs.worker.ts`,
- `src/context/TypingLibsContext.tsx`

## summary

-   [直面した問題](#直面した問題)
-   [解決に至った方法](#解決に至った方法)

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
