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
-   TODO: [](#)
-   TODO: [](#)

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


#### Reactで`_.debounce`

```TypeScript

```