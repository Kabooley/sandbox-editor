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


## 実装：依存関係管理

#### codesandbox-client 依存関係の処理方法の分析

- SearchDependencies/index.tsx要約

    onConfirmまたはactions.workspace.getDependencies()から依存関係を反映させる

```JavaScript
    // 予測候補を出すための処理を行うので無視
    onChange() {}

    // 実際に依存関係を追加する処理はonConfirmで行う
    // 依存関係の名称とバージョン番号を送信する
    onConfirm(name, version);
```

```TypeScript
export const SearchDependencies = ({ onConfirm }) => {
    const actions = useActions();
    const { workspace, editor } = useAppState();
    const list = useRef();
  
    const [isPrivateDependency, setIsPrivateDependency] = React.useState<boolean>(
      false
    );
  
    const handleSelect = async (hit: DependencyType) => {
      let version = workspace.hitToVersionMap[hit.objectID];
  
      if (!version && hit.tags) {
        version = hit.tags.latest;
      }
  
      await onConfirm(hit.name, version);
    };
  
    const handleManualSelect = (hitName: string) => {
      if (!hitName) {
        return;
      }
  
      const isScoped = hitName.startsWith('@');
      let version = 'latest';
  
      const splittedName = hitName.split('@');
  
      if (splittedName.length > (isScoped ? 2 : 1)) {
        version = splittedName.pop();
      }
  
      const depName = splittedName.join('@');
  
      onConfirm(depName, version);
    };
  
    const onSelectDependencies = () => {
      Object.values(workspace.selectedDependencies)
        .filter(a => a)
        .map(handleSelect);
    };
  
    const onChange = (value?: string) => {
      let searchValue = value;
      if (searchValue.includes('@') && !searchValue.startsWith('@')) {
        searchValue = value.split('@')[0];
      }
  
      if (searchValue.startsWith('@')) {
        // if it starts with one and has a version
        if (searchValue.split('@').length === 3) {
          const part = searchValue.split('@');
          searchValue = `@${part[0]}${part[1]}`;
        }
      }
  
      actions.workspace.getDependencies(searchValue);
  
      setIsPrivateDependency(
        editor.currentSandbox &&
          isPrivateScope(editor.currentSandbox, searchValue)
      );
    };
  
    useEffect(() => {
      actions.workspace.clearSelectedDependencies();
      // Why did we call this? The action just returns when undefined
      // actions.workspace.getDependencies();
  
      return () => {
        actions.workspace.changeDependencySearch('');
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    return (
      <div
        className="search-dependencies"
        css={css({
          backgroundColor: 'sideBar.background',
          height: '70vh',
          position: 'relative',
        })}
      >
        <SearchBox
          onChange={onChange}
          handleManualSelect={handleManualSelect}
          listRef={list}
        />
        <DependencyList isPrivateDependency={isPrivateDependency} list={list} />
        <AddDependencyModalFooter onClick={onSelectDependencies} />
      </div>
    );
  };
```

- `actions.workspace.getDependencies`

```TypeScript
export const getDependencies = async (
  { state, effects }: Context,
  value: string
) => {
  state.workspace.loadingDependencySearch = true;
  const searchResults = await effects.algoliaSearch.searchDependencies(value);

  state.workspace.loadingDependencySearch = false;
    // stateを更新した
  state.workspace.dependencies = searchResults;
};

```

- onConfirm

書いてある通り。

```TypeScript
import React, { FunctionComponent } from 'react';
import { useActions } from 'app/overmind';
import { SearchDependencies } from 'app/pages/Sandbox/SearchDependencies';

export const SearchDependenciesModal: FunctionComponent = () => {
  const { addNpmDependency } = useActions().editor;

  return (
    <SearchDependencies
      onConfirm={(name: string, version: string) =>
        addNpmDependency({ name, version })
      }
    />
  );
};
```

- `addNpmDependency`

https://github.com/codesandbox/codesandbox-client/blob/7886537619345681fed4bd2ee6168273ac32ad04/packages/app/src/app/overmind/namespaces/editor/actions.ts#L128

1. package.jsonの`dependencies`か`devDependencies`か判定する
2. 引数versionが指定されなかったら`latest`にする
3. nameと更新したversion変数から依存関係をfetchし、一致するもしくは近いバージョンの依存関係を取得する
4. package.jsonへ追加する

```TypeScript

export const addNpmDependency = withOwnedSandbox(
  async (
    { actions, effects, state }: Context,
    {
      name,
      version,
      isDev,
    }: {
      name: string;
      version?: string;
      isDev?: boolean;
    }
  ) => {
    const currentSandbox = state.editor.currentSandbox;
    const isPrivatePackage =
      currentSandbox && isPrivateScope(currentSandbox, name);

    effects.analytics.track('Add NPM Dependency', {
      private: isPrivatePackage,
    });
    state.currentModal = null;
    let newVersion = version || 'latest';

    if (!isAbsoluteVersion(newVersion)) {
      if (isPrivatePackage && currentSandbox) {
        try {
          const manifest = await effects.api.getDependencyManifest(
            currentSandbox.id,
            name
          );
          const distTags = manifest['dist-tags'];
          const absoluteVersion = distTags ? distTags[newVersion] : null;

          if (absoluteVersion) {
            newVersion = absoluteVersion;
          }
        } catch (e) {
            // 省略
      } else {
        // apitとやらで依存関係をネットから拾ってきて、
        // おそらく依存関係の名前とバージョン情報を含むオブジェクトが返される
        const dependency = await effects.api.getDependency(name, newVersion);
        newVersion = dependency.version;
      }
    }

    // 結果をpackage.jsonへ反映させる 
    await actions.editor.internal.addNpmDependencyToPackageJson({
      name,
      version: newVersion,
      isDev: Boolean(isDev),
    });

    actions.workspace.changeDependencySearch('');
    actions.workspace.clearExplorerDependencies();

    effects.preview.executeCodeImmediately();
  }
);
```

- `package.json`への反映

https://github.com/codesandbox/codesandbox-client/blob/7886537619345681fed4bd2ee6168273ac32ad04/packages/app/src/app/overmind/namespaces/editor/internalActions.ts#L328

package.jsonファイルをJSON.parseで中身取得
新規の依存関係を追加
JSON.stringifyでJSONへ再変換した内容を`actions.editor.setCode({ moduleShortid, code });`とやらでおそらく反映させている

```TypeScript
export const addNpmDependencyToPackageJson = async (
  { state, actions }: Context,
  {
    name,
    isDev,
    version,
  }: {
    name: string;
    version?: string;
    isDev: boolean;
  }
) => {
  if (
    !state.editor.currentSandbox ||
    !state.editor.currentPackageJSONCode ||
    !state.editor.currentPackageJSON
  ) {
    return;
  }

  const packageJson = JSON.parse(state.editor.currentPackageJSONCode);

  const type = isDev ? 'devDependencies' : 'dependencies';

  packageJson[type] = packageJson[type] || {};
    // NOTE: ここで追加  
  packageJson[type][name] = version || 'latest';
  packageJson[type] = sortObjectByKeys(packageJson[type]);

  const code = JSON.stringify(packageJson, null, 2);
  const moduleShortid = state.editor.currentPackageJSON.shortid;

  const module = state.editor.currentSandbox.modules.find(
    m => m.shortid === moduleShortid
  );

  if (!module) {
    return;
  }

  actions.editor.setCode({ moduleShortid, code });

  await actions.editor.codeSaved({
    code,
    moduleShortid,
    cbID: null,
  });
};

```

- [別件] codesandboxの内部的な変更をトリガーとするファイル変更の反映の仕方

1. shortIdというのはcondesandboxがエディタで扱っている仮想ファイルのidのことだと思う
2. あとはコメントに書いてある通り

```TypeScript
/**
 * Set the code of the module and send it if live is turned on. Keep in mind that this overwrites the editor state,
 * which means that if the user was typing something else in the file, it will get overwritten(!).
 *
 * There is some extra logic to handle files that are opened and not opened. If the file is opened we will set the code
 * within VSCode and let the event that VSCode generates handle the rest, however, if the file is not opened in VSCode,
 * we'll just update it in the state and send a live message based on the diff.
 *
 * The difference between `setCode` and `codeChanged` is small but important to keep in mind. Calling this method will *always*
 * cause `codeChanged` to be called. But from different sources based on whether the file is currently open. I'd recommend to always
 * call this function if you're aiming to manually set code (like updating package.json), while editors shouild call codeChanged.
 *
 * The two cases:
 *
 * ### Already opened in VSCode
 *  1. set code in VSCode
 *  2. which generates an event
 *  3. which triggers codeChanged
 *
 * ### Not opened in VSCode
 *  1. codeChanged called directly
 */
export const setCode = (
  { effects, state, actions }: Context,
  {
    code,
    moduleShortid,
  }: {
    moduleShortid: string;
    code: string;
  }
) => {
  if (!state.editor.currentSandbox) {
    return;
  }

  const module = state.editor.currentSandbox.modules.find(
    m => m.shortid === moduleShortid
  );

  if (!module) {
    return;
  }

  // If the code is opened in VSCode, change the code in VSCode and let
  // other clients know via the event triggered by VSCode. Otherwise
  // send a manual event and just change the state.
  if (effects.vscode.isModuleOpened(module)) {
    effects.vscode.setModuleCode({ ...module, code }, true);
  } else {
    actions.editor.codeChanged({ moduleShortid, code });
  }
};
```

わかったこと：

- 既存の依存関係と比較をしないで、常に追加処理を行う。
  最終的に`packageJson[type][name] = version || 'latest';`という方法で追加されるので、既存があっても上書きすることになる。

  なので一方通行の処理である。考える方はらくちん。



#### 実装

依存関係を取得するのは現状EditorContainerで行っているが、

これを上位に移設して、EditorContainer以下は依存関係のオブジェクトを読み取るだけになる。

上位は「追加」または「削除」のリクエストを受信して、

依存関係を追加・削除を行ってから、結果を介コンポーネントへ返す仕様とする。

- dependenciesのcontextを生成する

- `Types.initializeDependencies`とかのアクションを追加して、依存関係をtemplate.typescript.files.packagejson[dependencies|devDepenencies]から取得し、fetchLibs.workerで取得する

- `getDependenciesFromPackageJson()`みたいな便利な関数を使えるようにしたい。


懸念：

- TODO: 要確認）workerはcontextで利用できるのか？


#### 実装 `getDependenciesFromPackageJson`

こいつはどこにあればいいんだ？

アプリケーションで扱うFile[]は、files.ts --> FilesContext::initializeFile:File[]

こいつを取得できるのが条件

カスタムフックで作成できるか試す

`hooks/usePackageJson.ts`


