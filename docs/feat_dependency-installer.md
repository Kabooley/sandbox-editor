# Implement dependency installer

Like codesandbox.

To install dependency dynamically, it is hard to know what module user need and install appropriately version of them.

So I decide to implement manual dependency installer for user,

so they can install what version of them and what modules they want.

## 参考

https://github.com/codesandbox/codesandbox-client/tree/9a75ddff1312faaf9fcd3f7f8a019de0f464ab47/packages/app/src/app/pages/Sandbox/SearchDependencies

## TODOs

-   TODO: [dependency-data](#dependency-data)
-   TODO: [Split Pane section](#Split-Pane-section)
-   TODO: [Component](#Component)
-   TODO: [How to fetch dependency from SearchDependency component](#How-to-fetch-dependency-from-SearchDependency-component)
-   TODO: [実装：overmind](#実装：overmind)
-   TODO: [](#)

-   別件：意味のない git commit をなかったことにしたいときにどうすればいいのか

#### codesandbox

view test

-   https://codesandbox.io/s/test-searchdependency-view-vqq823

## dependency data

将来的にはテンプレートに応じて用意することになるかと。

ひとまず`React + TypeScript`をベースとする。

-   `fetchLibs.worker`から送信されるデータ例

```JavaScript
// {解決されたpath: typingファイルの中身}
{
    node_modules/react-dom/index.d.ts: "// Type definitions for React (react-dom) 18.2\n// Project: https://reactjs.org\n// Definitions by: Asana <https://asana.com>\n//                 AssureSign <http://www.assuresign.com>\n//                 Microsoft <https://microsoft.com>\n//                 MartynasZilinskas <https://github.com/MartynasZilinskas>\n//                 Josh Rutherford <https://github.com/theruther4d>\n//                 Jessica Franco <https://github.com/Jessidhia>\n//                 Sebastian Silbermann <https://github.com/eps1lon>\n// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped\n// TypeScript Version: 2.8\n\n// NOTE: Users of the `experimental` builds of React should add a reference\n// to 'react-dom/experimental' in their project. See experimental.d.ts's top comment\n// for reference and documentation on how exactly to do it.\n\nexport as namespace ReactDOM;\n\nimport {\n    ReactInstance, Component, ComponentState,\n    ReactElement, FunctionComponentElement, CElement,\n    DOMAttributes, DOMElement, ReactNode, ReactPortal\n} from 'react';\n\nexport function findDOMNode(instance: ReactInstance | null | undefined): Element | null | Text;\nexport function unmountComponentAtNode(container: Element | DocumentFragment): boolean;\n\nexport function createPortal(children: ReactNode, container: Element | DocumentFragment, key?: null | string): ReactPortal;\n\nexport const version: string;\nexport const render: Renderer;\nexport const hydrate: Renderer;\n\nexport function flushSync<R>(fn: () => R): R;\nexport function flushSync<A, R>(fn: (a: A) => R, a: A): R;\n\nexport function unstable_batchedUpdates<A, R>(callback: (a: A) => R, a: A): R;\nexport function unstable_batchedUpdates<R>(callback: () => R): R;\n\nexport function unstable_renderSubtreeIntoContainer<T extends Element>(\n    parentComponent: Component<any>,\n    element: DOMElement<DOMAttributes<T>, T>,\n    container: Element,\n    callback?: (element: T) => any): T;\nexport function unstable_renderSubtreeIntoContainer<P, T extends Component<P, ComponentState>>(\n    parentComponent: Component<any>,\n    element: CElement<P, T>,\n    container: Element,\n    callback?: (component: T) => any): T;\nexport function unstable_renderSubtreeIntoContainer<P>(\n    parentComponent: Component<any>,\n    element: ReactElement<P>,\n    container: Element,\n    callback?: (component?: Component<P, ComponentState> | Element) => any): Component<P, ComponentState> | Element | void;\n\nexport type Container = Element | Document | DocumentFragment;\n\nexport interface Renderer {\n    // Deprecated(render): The return value is deprecated.\n    // In future releases the render function's return type will be void.\n\n    <T extends Element>(\n        element: DOMElement<DOMAttributes<T>, T>,\n        container: Container| null,\n        callback?: () => void\n    ): T;\n\n    (\n        element: Array<DOMElement<DOMAttributes<any>, any>>,\n        container: Container| null,\n        callback?: () => void\n    ): Element;\n\n    (\n        element: FunctionComponentElement<any> | Array<FunctionComponentElement<any>>,\n        container: Container| null,\n        callback?: () => void\n    ): void;\n\n    <P, T extends Component<P, ComponentState>>(\n        element: CElement<P, T>,\n        container: Container| null,\n        callback?: () => void\n    ): T;\n\n    (\n        element: Array<CElement<any, Component<any, ComponentState>>>,\n        container: Container| null,\n        callback?: () => void\n    ): Component<any, ComponentState>;\n\n    <P>(\n        element: ReactElement<P>,\n        container: Container| null,\n        callback?: () => void\n    ): Component<P, ComponentState> | Element | void;\n\n    (\n        element: ReactElement[],\n        container: Container| null,\n        callback?: () => void\n    ): Component<any, ComponentState> | Element | void;\n}\n"
}
```

`dependency-templates.ts`

```TypeScript
/**
 * {
 *  react: "18.0.4",
 *  'react-dom': "18.0.4"
 * }
 *
 *
 * */
interface iDependency {
    [path: string]: string;
};

/**
 * TODO: 実際、何をあらかじめ用意しておくべでしょうか。
 *
 * */
export const dependencyTemplateOf_React_TypeScript: iDependency = {
    react: '18.0.4',
    'react-dom': '18.0.4',
};
```

## split Pane section

Pane セクションを縦に分割する。

```HTML
<!-- PaneSection/Pane以下のコンポーネント -->
<section class="Depencies">
    <!-- VSCodeのpaneのメニューカラム -->
    <!-- VSCodeの`OPEN EDITORS`と同じ -->
    <div class="menu-column"></div>
    <!-- 以下、メニューカラムが開いたときに表示されるコンテンツ -->
    <div class="Dependencies installer form">
        <div>
            <input type="text" />
        </div>
    </div>
    <div class="Dependencies installed-dependencies-list">
        <!-- install済のモジュールを一覧表示する -->
    </div>
</section>
```

## Component

-   (有効なパッケージ名であるかどうか検査する) いやいらないかな
-   入力内容に応じて一致する又は近しい npm モジュールとバージョンを予測で表示する。
-   有効なパッケージ名とバージョンであるならば、dependency-data へ追加し、直接 fetchLibs.worker を呼び出す？
-   install 済のモジュールは無効にさせる？

```TypeScript

```

## How to fetch dependency from SearchDependency component

TODO: アプリケーションで適用する選択可能な template を生成する

typescript 環境
javascript 環境
react 環境
typescript + react 環境

の４つ

TODO: template に dependency リストを含め、マウント時に typings をインストールするようにする

TODO: dependency は SearchDependency コンポーネントから追加・削除できるようにする

TODO: 動的削除または追加された depedency は context 経由で MonacoEditor コンポーネントへ渡されてそこでインストールされるという機能にする

TODO: SearchDependency ではインストール完了までローディングサークルとか表示しとく

なので loading を示す state が必要

TODO: ~上記全てを実現するために condesandbox でいうところの`overmind`を実装する必要がある。~

TODO: template の context 化

-   [実装：template](#実装：template)
-   [実装：Context for dependency state](#実装：Context-for-dependency-state)
-   [[esbuild] bundle multiple files](#[esbuild]-bundle-multiple-files)

## 実装：template

-   VanillaJS
-   TypeScript
-   React
-   TypeScript + React

---

-   パッケージ依存関係
-   ファイル
-   バンドリング設定？

---

実例を作ってからどう実装すべきか考えてみる

#### Template: TypeScript + React

-   tsconfig.json
-   file
-   dependency

```TypeScript
// Depdnency
const typescriptreactDependency = [
    "react@18.2.0",
    "react-dom@18.2.0",
    "react-scripts@18.2.0",
    // typescriptは必要なのか？
];
```

```TypeScript
const typescriptreactFiles = [
  {
    path: 'public',
    language: '',
    value: '',
    isFolder: true
  },
  {
    path: 'public/index.html',
    language: 'html',
    value: `<!DOCTYPE html>\r\n<html lang="en">\r\n\r\n<head>\r\n<meta charset="utf-8">\r\n<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\r\n<meta name="theme-color" content="#000000">\r\n\r\n<title>React App</title>\r\n</head>\r\n\r\n<body>\r\n<noscript>\r\nYou need to enable JavaScript to run this app.\r\n</noscript>\r\n<div id="root"></div>\r\n</html>`,
    isFolder: false
  },
  {
    path: 'src',
    language: '',
    value: '',
    isFolder: true
  },
  {
    path: 'src/index.tsx',
    language: 'typescript',
    value: '',
    isFolder: false
  },
  {
    path: 'src/App.tsx',
    language: 'typescript',
    value: '',
    isFolder: false
  },
  {
    path: 'src/styles.css',
    language: 'css',
    value: '',
    isFolder: false
  },
//
// NOTE: this package.json includes dependencies.
//
  {
    path: 'package.json',
    language: 'json',
    value: '',
    isFolder: false
  },
  {
    path: 'tsconfig.json',
    language: 'json',
    value: '',
    isFolder: false
  },
];
```

package.json:

```JSON
{
    "name": "typescript-react-template",
    "version": "1.0.0",
    "description": "blah blah blah",
    "main": "src/index.tsx",
    "dependencies": {
        // "loader-utils": "3.2.1",
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "react-scripts": "5.0.1"
    },
    "devDependencies": {
        "@types/react": "18.0.25",
        "@types/react-dom": "18.0.9",
        "typescript": "4.4.2"
    },
}
```

```JSON
{
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
}
```

-   どうやってすべてのファイルを一つにバンドリングするのか
    --> esbuild plugin 次第

-   どうやって package.json、tsconfig.json の設定がかかわってくるのか？そもそも自分のアプリケーションに必要なのか？

## 実装：Adding and Deleting dependencies

NOTE: 参考
https://github.com/codesandbox/codesandbox-client/blob/df8844a3cb183fa4f5d42f86ea55a55eca5a3f00/packages/app/src/app/overmind/namespaces/editor/actions.ts#L128

https://github.com/codesandbox/codesandbox-client/blob/df8844a3cb183fa4f5d42f86ea55a55eca5a3f00/packages/app/src/app/overmind/namespaces/editor/internalActions.ts#L328

codesandbox はどうなっているかというと、

-   package.json の編集 --> SearchDependency にも反映される
-   SearchDependency から入力する --> package.json にも反映される

#### [esbuild] bundle multiple files

https://github.com/evanw/esbuild/issues/1952

unpkg で拾ってくるモジュールの import 文と、ローカルから拾ってきたいモジュールの import 文の区別をつけられるのか？

-   bundle リクエストを送信したときに、その時点の最新のファイル情報を bundler へ渡す
-   ローカルパスを解決するプラグインを追加する

-   TODO: 現状のバンドリングプラグインのパスの解決の流れを復習
-   TODO: ローカルパスの解決をするプラグインの追加

## 実装：overmind

結論：実装しない。

https://github.com/codesandbox/codesandbox-client/tree/9a75ddff1312faaf9fcd3f7f8a019de0f464ab47/packages/app/src/app/overmind

どうやって「複数の値の state」を一つのコンテキストにまとめてアプリケーション全体に適用させるのか

結局サードパーティ製のライブラリを使っていただけだった。

`overmind-react`

https://overmindjs.org/views/react

## [JavaScript] `Debounced`

https://lodash.com/docs/4.17.15#debounce

https://css-tricks.com/debouncing-throttling-explained-examples/

https://www.freecodecamp.org/news/javascript-debounce-example/

What is `debounce` ?

例えばキーボードの`a`キーを押すとする。ユーザがキーを押してから離すまでの間に、実は「`a`キーが押されている」という信号が何度も送信される。この何度も信号を受け取る必要がないように、一度その信号が送信されたら他の同じ信号をあらかじめ決めた時間だけ無視するようにする機能のこと。

JavaScript の例でいえば、ユーザがフォームで入力したときに入力内容に応じて検索クエリを送信する仕組みがあるとして、ある程度の入力があってからクエリを送信するために入力中一定期間タイプ内容を無視するようにする機能とか？

今回の開発の例でいえば：

-   エディタの入力内容を捉えてバンドリングする場合、debounced することで入力内容がある程度時間をおいてからバンドリングリクエストを送信できるのでリクエストの数を節約できる

-   ウィンドウのリサイズの調整再計算機能を debounce すれば resize イベント全てに反応しないけれど一定間隔ごとに実行できる。

例：

```JavaScript
function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
function saveInput(){
  console.log('Saving data');
}
const processChange = debounce(() => saveInput());
```

```HTML
<!-- Debounced -->
<input type="text" onkeyup="processChange()" />

<!-- Not debounced -->
<input type="text" onkeyup="saveInput()" />
```

Debounced の例ならば 300 ミリ秒まってから saveInput()が呼び出されるが、

not debounced の例だと常にイベントが発生すると呼び出されるので

呼出の回数が異なる。

## [React] Too much ContextProvider

別に問題はないとのこと。

すっきりさせたいなら次の方法を試せばいいとのこと。

https://stackoverflow.com/questions/51504506/too-many-react-context-providers
