# 依存関係管理の改善

このブランチは`feat_footer`から派生した。

`src/worker/fetchLibs.worker.ts`の機能を`@typescript/ata`の機能のように改善して、

`react-dom/client`の型情報ファイルが取得できない問題を解決する。

対象ファイル:

<<<<<<< HEAD
-   `src/worker/fetchLibs.worker.ts`,
-   `src/context/TypingLibsContext.tsx`

## summary

-   [機能](#機能)
-   [view](#view)

-   [直面した問題](#直面した問題)
-   [解決に至った方法](#解決に至った方法)
-   [cache 機能](#cache機能)
-   [debug](#debug)
-   [変更内容](#変更内容)
-   [React Context API: Avoid extra rerendering](#react-context-api-avoid-extra-rerendering)

## 機能

-   `fetchLibs.worker.ts`: 依存関係 types ファイルの取得
-   `TypingLibsContext.tsx`: `fetchLibs.worker.ts`のインスタンスと通信して依存関係を管理するコンテキスト
-   `requestFetchTyings`: コンテキストが子コンポーネントに提供する関数で、呼び出し側が依存関係をワーカーにリクエストできる関数
-   `dependencies`: 現在取得している依存関係のリストで、`TypingLibsContext.tsx`が state 管理している。コンテキストとして子コンポーネントに提供している

## 依存関係を削除する機能

`DependencyList`からユーザ操作によって依存関係一覧から依存関係を削除できるようにして、削除された依存関係を monaco の登録ライブラリ他から削除できるようにする

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

なので取得した時点で`react`関連であるというタグをくっつけることにする。

worker から取得される値

depsMap: {key: addExtraLibs の path として登録される path, value: code }
moduleName:
version:

dependencies で管理する場合

```TypeScript

[
    { moduleName: "react", version: "18.2.0", state: "loaded", libs: [
        "/node_modules/@types/react/package.json",
        "/node_modules/@types/react/experimental.d.ts",
        "/node_modules/@types/react/global.d.ts",
        "/node_modules/@types/react/index.d.ts",
        "/node_modules/@types/react/jsx-dev-runtime.d.ts",
        "/node_modules/@types/react/jsx-runtime.d.ts",
        "/node_modules/@types/react/next.d.ts",
        "/node_modules/@types/react/ts5.0/experimental.d.ts",
        "/node_modules/@types/react/ts5.0/global.d.ts",
        "/node_modules/@types/react/ts5.0/index.d.ts",
        "/node_modules/@types/react/ts5.0/jsx-dev-runtime.d.ts",
        "/node_modules/@types/react/ts5.0/jsx-runtime.d.ts",
        "/node_modules/@types/react/ts5.0/next.d.ts",
        "/node_modules/csstype/package.json",
        "/node_modules/csstype/index.d.ts",
        "/node_modules/@types/prop-types/package.json",
        "/node_modules/@types/prop-types/index.d.ts",
        "/node_modules/@types/scheduler/package.json",
        "/node_modules/@types/scheduler/index.d.ts",
        "/node_modules/@types/scheduler/tracing.d.ts"
    ]},
]
```

問題はこいつを state 管理するのかどうかである

この関連一覧は特に変更に対して再レンダリングを引き起こす必要がない。

なので ref で圧且つことにする

```TypeScript
const relativeLibs = useRef<Map<string, string[]>>(new Map());
```

## cache 機能

TypingLibsContext3.tsx

3 か所くらい設けることになるか？

-   TypingLibsContext の state.dependencies: DependencyList からリクエストされたら state.dependencies をまず捜索してインストール済でないか確認する。fetch 後は worker から帰ってきた moduleName と version の組み合わせで setDependecies される

#### 前提

TODO: `fetchLibs.worker.ts`へリクエストしたときの version と実際にダウンロードすることになる version の違いが発生するかもしれなくて、worker のレスポンスは実際にダウンロードすることになる version を返したい。リクエストの時に latest がアリとしているならだけど

## view

## dependency list

削除ボタン
コラムをホバーしたら削除ボタンを表示する
モジュール名とバージョン番号を sapce between で表示する

codesandbox(新しくなった奴)の依存関係リストのリスト要素

```HTML
<!-- モジュール名、モジュールバージョン、npm.comへジャンプするボタン、リロードボタン、削除ボタン -->
<div class="c-PJLV c-PJLV-iiFPpql-css c-fMziTL prism-stack">
    <div class="c-PJLV c-PJLV-ifbirqb-css prism-stack">
        <!-- モジュール名 -->
        <span class="c-cglwLR c-cglwLR-kdIEvy-truncate-true">react</span>
        <!-- モジュールバージョン -->
        <pre class="c-cglwLR">18.2.0</pre>
    </div>
    <div class="c-PJLV c-PJLV-ilowYHd-css dependency_button prism-stack">
        <a aria-disabled="false" href="https://www.npmjs.com/package/react" target="_blank" data-state="closed" class="c-iJeJAt c-iJeJAt-lhTikF-variant-ghost c-iJeJAt-gZdXgW-cv c-iJeJAt-iefCiES-css">
            <div class="c-PJLV c-PJLV-iexKxpF-css prism-stack">
                <span class="c-cONGSC">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="c-jTwhQQ c-jTwhQQ-iivbtLv-css"><path></path></svg>
                </span>
            </div>
        </a>
        <button aria-disabled="false" data-state="closed" class="c-iJeJAt c-iJeJAt-lhTikF-variant-ghost c-iJeJAt-gZdXgW-cv c-iJeJAt-iefCiES-css">
            <div class="c-PJLV c-PJLV-iexKxpF-css prism-stack">
                <span class="c-cONGSC">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="c-jTwhQQ c-jTwhQQ-iivbtLv-css"><path></path></svg>
                </span>
            </div>
        </button>
        <button aria-disabled="false" data-state="closed" class="c-iJeJAt c-iJeJAt-lhTikF-variant-ghost c-iJeJAt-gZdXgW-cv c-iJeJAt-iefCiES-css">
            <div class="c-PJLV c-PJLV-iexKxpF-css prism-stack">
                <span class="c-cONGSC">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="c-jTwhQQ c-jTwhQQ-idWBbnv-css"><path></path></svg>
                </span>
            </div>
        </button>
    </div>
</div>
```

モジュール名とバージョンの要素を囲っている要素とホバーしたら現れるカラムファンクションズ要素群は同列に並んでいる

```CSS
/* リスト要素の一番外側 */
.c-PJLV.c-PJLV-iiFPpql-css.c-fMziTL.prism-stack {
    margin-block-end: var(--space-1);
    margin-bottom: var(--space-1);
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    min-height: 28px;
    position: relative;
}

/* リスト要素の二番外側 */
.c-PJLV.c-PJLV-ifbirqb-css.prism-stack {
    margin-inline-end: var(--space-2);
    margin-right: var(--space-2);
    min-width: 0px;
    display: flex;
    align-items: center;
    flex-direction: row;
}

/* モジュールタイトル */ {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: currentcolor;
    margin: 0px;
    font-weight: var(--fontWeights-regular);
}

/* モジュールバージョン */ {
    margin: 0px;
    font-weight: var(--fontWeights-regular);
    display: block;
    font-family: monospace;
    white-space: pre;
    margin: 1em 0px;
}

/* カラム・ファンクションズの一番外側 */
.c-PJLV.c-PJLV-ilowYHd-css.dependency_button.prism-stack {
    position: absolute;
    right: 0px;
    top: 0px;
    opacity: 0;
    display: flex;
    align-items: center;
    flex-direction: row;
}

/* なんかホバーの設定は色が変わっているくらいな感じだった */
/* カラム・ファンクション要素 */ {
    /* 多分ホバーしている最中は見えなくしている設定 */
    background-color: transparent;
    border-color: transparent;
    color: var(--colors-neutral-fg-subtle);
    padding-left: var(--space-2);
    padding-right: var(--space-2);

    /* 通常の設定 */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    padding-left: var(--space-6);
    padding-right: var(--space-6);
    padding-top: var(--space-1);
    padding-bottom: var(--space-1);
    font-size: var(--fontSizes-base);
    font-family: var(--fonts-base);
    font-weight: var(--fontWeights-medium);
    letter-spacing: var(--letterSpacings-base);
    line-height: 16px;
    text-decoration: none;
    border: 1px solid transparent;
    height: var(--sizes-7);
    min-width: var(--sizes-7);
    max-width: 100%;
    outline: none;
    border-radius: var(--radii-2);
    transition: var(--transitions-background), box-shadow var(--transitions-fast), border-color var(--transitions-fast), color var(--transitions-fast);
}
```

今 DependencyList の出力しているコード

```HTML

<section className="pane-section">
    <div className="context-title" style={styleOfContext}>
        <span>{sectionTitle.toUpperCase()}</span>
    </div>
    <Form send={sendRequest} />
    <!-- ここからリスト -->
    <div className="dependency-list" style={styleOfDependencyList}>
        <!-- treeColumn from -->
        <div className="treeColumn" key={key} onClick={handleClick}>
            <div className="TreeItem" style={styleOfTreeItem}>
                <div
                    style={{
                        maxWidth: '70%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        width: '30%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span>{version}</span>
                </div>
                <div className="TreeItem--function">
                    <div onClick={() => onDelete(title, version)}>
                        <img src={closeButton} alt="delete folder" />
                    </div>
                </div>
            </div>
        </div>
        <!-- treeColumn to -->
    </div>
</section>
```

```CSS
.TreeItem--function__ {
    position: absolute;
    right: 0px;
    top: 0px;
    opacity: 0;
    display: flex;
    align-items: center;
    flex-direction: row;
}

```

## Navigationbar の削除と sidebar の一本化

TODO: navigationbar をやめる。explorer と dependencylist を一体化させる（今の codesandbox のレイアウトみたいに完全に VSCode ライクに）

```HTML
<section class="file-explorer">
    <div class="treeColumn sectionTitle">
        <div class="TreeItem">
            <div class="treeColumn-icon-name">
                <img src="http://localhost:8080/2879771264c2be7b224e.svg" alt="open section">
                <span class="treeColumn-icon-name--name">ROOT</span>
            </div>
            <div class="TreeItem--function">
                <div>
                    <img src="http://localhost:8080/7ce07b1787b2360c571a.svg" alt="add folder">
                </div>
                <div>
                    <img src="http://localhost:8080/426fedab82f60cb5ec28.svg" alt="add file"></div><div><img src="http://localhost:8080/426fedab82f60cb5ec28.svg" alt="collapse all folders"></div></div></div></div>
    <div class="collapsible vertical-edge-spaces">
        <!-- 以下のようなHTMLの塊が 1 Column -->
        <div draggable="true">
            <!-- TreeColumn.tsx -->
            <div class="treeColumn" style="padding-left: 0rem;">
                <div class="TreeItem">
                    <div class="treeColumn-icon-name">
                        <img src="http://localhost:8080/e0f3a36959b4d028e266.svg" alt="folder icon">
                        <span class="treeColumn-icon-name--name">package.json</span>
                    </div>
                    <div class="TreeItem--function">
                        <div>
                            <img src="http://localhost:8080/3c19f80fe71a37c4007e.svg" alt="delete folder">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div><div draggable="true"><div class="treeColumn" style="padding-left: 0rem;"><div class="TreeItem"><div class="treeColumn-icon-name"><img src="http://localhost:8080/46a89504d589a4e200d9.svg" alt="folder icon"><span class="treeColumn-icon-name--name">public</span></div><div class="TreeItem--function"><div><img src="http://localhost:8080/7ce07b1787b2360c571a.svg" alt="add folder"></div><div><img src="http://localhost:8080/426fedab82f60cb5ec28.svg" alt="add file"></div><div><img src="http://localhost:8080/3c19f80fe71a37c4007e.svg" alt="delete folder"></div></div></div></div></div><div style="display: none;"><div draggable="true"><div class="treeColumn" style="padding-left: 2.4rem;"><div class="TreeItem"><div class="treeColumn-icon-name"><img src="http://localhost:8080/e0f3a36959b4d028e266.svg" alt="folder icon"><span class="treeColumn-icon-name--name">index.html</span></div><div class="TreeItem--function"><div><img src="http://localhost:8080/3c19f80fe71a37c4007e.svg" alt="delete folder"></div></div></div></div></div></div></div>

        <div><div draggable="true"><div class="treeColumn" style="padding-left: 0rem;"><div class="TreeItem"><div class="treeColumn-icon-name"><img src="http://localhost:8080/46a89504d589a4e200d9.svg" alt="folder icon"><span class="treeColumn-icon-name--name">soMuchLongDirectoryName</span></div><div class="TreeItem--function"><div><img src="http://localhost:8080/7ce07b1787b2360c571a.svg" alt="add folder"></div><div><img src="http://localhost:8080/426fedab82f60cb5ec28.svg" alt="add file"></div><div><img src="http://localhost:8080/3c19f80fe71a37c4007e.svg" alt="delete folder"></div></div></div></div></div><div style="display: none;"><div draggable="true"><div class="treeColumn" style="padding-left: 2.4rem;"><div class="TreeItem"><div class="treeColumn-icon-name"><img src="http://localhost:8080/e0f3a36959b4d028e266.svg" alt="folder icon"><span class="treeColumn-icon-name--name">superUltraHyperTooLongBaddaaasssssFile.txt</span></div><div class="TreeItem--function"><div><img src="http://localhost:8080/3c19f80fe71a37c4007e.svg" alt="delete folder"></div></div></div></div></div></div></div>

    </div>
</section>


```

## debug

#### 2 か所で monaco の addExtraLibs を動かすと両者の取得したライブラリはそれぞれ独立してしまうか？

結論：どこで取得しても共通である。

EditorContainer.tsx と TypingLibsContext.tsx の両方の didUpdateComponent のタイミングで`getExtraLibs`を実行したところそれぞれが取得したライブラリが両方で取得できていることが分かった。

#### TypingLibsContext3.tsx を稼働させるために MonacoContainer.tsx は addExtraLibs を独自に行う必要がある件

TypingLibsContext は現状 2 つの値を提供するだけ。

`requstFetchTypings`と`dependencies`である。

これ以上コンテキストをやたらと増やしたくないという事情を優先するとしたら、次の通り addExtraLibs は 2 か所で活動することになる。

-   TypingLiibsContext ではライブラリを登録する
-   MonacoContainer では仮想ファイルを登録する

monaco の addExtraLibs は別々に稼働させても問題ないのか確認すること

参考: https://microsoft.github.io/monaco-editor/typedoc/interfaces/languages.typescript.LanguageServiceDefaults.html#getExtraLibs

## 変更内容

-   `monaco.languages.[type|java]script.[type|java]scriptDefault.addExtraLibs`は TypingLibsContext.tsx だけで呼出し、その呼出す関数を`addTypings`というコンテキスト経由で取得できる関数を提供することで好きな場所で呼出可能としていたが、これをやめて 2 か所で呼び出すことにした。

    `TypingLibsContext.tsx`: jsdelvr 経由で npm パッケージモジュールを取得する
    `EditorContainer.tsx`: 仮想ファイルの内容を登録する

    両モジュールはそれぞれ独立して`addExtraLIbs`を呼び出すが、内部的にはそのスコープは共通みたいなので問題なし
    ([2 か所で monaco の addExtraLibs を動かすと両者の取得したライブラリはそれぞれ独立してしまうか？](#2か所でmonacoのaddExtraLibsを動かすと両者の取得したライブラリはそれぞれ独立してしまうか？))

## React Context API: Avoid extra rerendering

https://legacy.reactjs.org/docs/context.html#caveats

## 既存依存関係の別バージョン取得・取得失敗時に既存依存関係に戻す処理

state の更新の反映タイミングがちぐはぐなせいでちょっと挙動がおかしい。

```sequence
' TypingLibsContext.tsx

dependencies: [
    { moduleName: "react", version: "18.2.0", state: 'loaded' }
];
requestingDependencies: [];

/' 存在しないバージョンなどリクエストされたとする '/
-> requestFetchTypings: 'react', '30.0.0'

dependencies: [
    { moduleName: "react", version: "18.2.0", state: 'loaded' }
];
requestingDependencies: [
    { moduleName: "react", version: "30.0.0", state: 'loading', existVersion: '18.2.0' }
];

requestFetchTypings -> worker.postMessage: { moduleName: 'react', version: '30.0.0' }

/' Errorインスタンスと空のMapオブジェクトが返される '/
woreker.postMessage -> handleWorkerMessge: { payload: { moduleName: 'react', version: '30.0.0', vfsMap: Map(0) }, error: ErrorInstance }

handleWorkerMessage -> setRequestingDependencies:

/' reqestingDependenciesからversion: 30.0.0のreactが削除されて... '/
dependencies: [
    { moduleName: "react", version: "18.2.0", state: 'loaded' }
];
requestingDependencies: [];

handleWorkerMessage -> requestFetchTypings: { moduleName: 'react', version: '18.2.0' }

/' 既存依存関係のreactのバージョンを追加する.. '/
dependencies: [
    { moduleName: "react", version: "18.2.0", state: 'loaded' }
];
requestingDependencies: [
    { moduleName: "react", version: "18.2.0", state: 'loading' }
];

requestFetchTypings -> worker.postMessage: { moduleName: 'react', version: '18.2.0' }


woreker.postMessage -> handleWorkerMessge: { payload: { moduleName: 'react', version: '18.2.0', vfsMap: Map(6) }, error: undefined }

/' 既存依存関係がdependenciesにあっても再取得後は上書きする '/
dependencies: [
    { moduleName: "react", version: "18.2.0", state: 'loaded' }
];
requestingDependencies: [];

handlwWorkerMessage -> reflectToPackageJson: dependencies
handlwWorkerMessage -> addExtraLibs: vfsMap
handlwWorkerMessage -> setOfDependency.set: { 'react@18.2.0', vfsMap }

```

実際

```bash
# package.jsonが更新されてreactバージョンが18.2.0から30.2.0に変更された
# -- 更新 --
# この時点のdependencies:
[{ moduleName: "react", version: "18.2.0", state: "loaded" }]
# この時点のdevDependencies:
[]

# useEffect(,[packageJson]) -> requestFetchTypings('react', '30.2.0')
# requestFetchTypings('react', '30.2.0') -> worker.postMessages('react', '30.2.0')
# -- 更新 --
# この時点のdependencies:
[{ moduleName: "react", version: "18.2.0", state: "loaded" }]
# この時点のdevDependencies:
[{ moduleName: "react", version: "30.2.0", state: "loading", existVersion: "18.2.0" }]

# In worker `react` removed from 'storeModuleNameVersion`...

# handleWorkerMessageがレスポンスを取得
# requestFetchTypings('react', '18.2.0', forced: true)
# -- 更新 --
# この時点のdependencies:
[{ moduleName: "react", version: "18.2.0", state: "loaded" }]
# この時点のdevDependencies:
[]

# どのタイミングなのかわからん
# -- 更新 --
# この時点のdependencies:
[{ moduleName: "react", version: "18.2.0", state: "loaded" }]
# この時点のdevDependencies:
[
    { moduleName: "react", version: "30.2.0", state: "loading", existVersion: "18.2.0" },
    { moduleName: "react", version: "18.2.0", state: "loading", existVersion: undefined }
]
# NOTE: いきなり2つに増えているのでいずれかの関数が古いstateを参照し続けているみたい

```

わかったこと：

-   既存依存関係の別バージョン取得失敗しても、既存依存関係は dependencies, ExtraLisb, setOfDependency に残ったまま変更も削除もされていない

なので単純に取得失敗ならば何もしなくていい（requestingDependencies は更新する必要があるかもだけど、単純にこの state が不要の可能性もある）

となると問題は、取得失敗時に worker の方の storeOfModuleNameVersion の方でリクエストしたモジュールが削除されてしまうことである。
=======
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
>>>>>>> origin/development
