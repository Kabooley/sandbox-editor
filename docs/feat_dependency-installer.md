# Implement dependency installer

installer というか依存関係をどうやって管理・適用させるかの話。

## 参考

https://github.com/codesandbox/codesandbox-client/tree/9a75ddff1312faaf9fcd3f7f8a019de0f464ab47/packages/app/src/app/pages/Sandbox/SearchDependencies

https://github.com/codesandbox/codesandbox-client/blob/df8844a3cb183fa4f5d42f86ea55a55eca5a3f00/packages/app/src/app/overmind/namespaces/editor/actions.ts#L128

https://github.com/codesandbox/codesandbox-client/blob/df8844a3cb183fa4f5d42f86ea55a55eca5a3f00/packages/app/src/app/overmind/namespaces/editor/internalActions.ts#L328

## Summary

-   [TODOs](#TODOs)
-   [View of SearchDependency](#View-of-SearchDependency)
-   [Interface dependency data](#Interface-dependency-data)
-   [依存関係管理](#依存関係管理)
-   [TypeScript + React のテンプレートデータを作ってみる](#TypeScript-+-Reactのテンプレートデータを作ってみる)

## TODOs

TODO: ノートのまとめ。散らかった情報の集約。後から見て役に立つ情報という視点からまとめること。

-   TODO: [dependency-data](#dependency-data)
-   TODO: [Split Pane section](#Split-Pane-section)
-   TODO: [実装：overmind](#実装：overmind)
-   TODO: [TypeScript compile](#TypeScript-compile)

-   別件：意味のない git commit をなかったことにしたいときにどうすればいいのか

-   [別件] [esbuild でマルチファイルをバンドルする方法](#esbuildでマルチファイルをバンドルする方法)



## View of SearchDependency

#### view test

-   https://codesandbox.io/s/test-searchdependency-view-vqq823

#### split Pane section

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

## Interface dependency data

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
```

## TypeScript + React のテンプレートデータを作ってみる

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

## [esbuild] bundle multiple files

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

## 依存関係管理

#### codesandbox-client 依存関係の処理方法の分析

-   SearchDependencies/index.tsx 要約

    onConfirm または actions.workspace.getDependencies()から依存関係を反映させる

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

-   `actions.workspace.getDependencies`

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

-   onConfirm

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

-   `addNpmDependency`

https://github.com/codesandbox/codesandbox-client/blob/7886537619345681fed4bd2ee6168273ac32ad04/packages/app/src/app/overmind/namespaces/editor/actions.ts#L128

1. package.json の`dependencies`か`devDependencies`か判定する
2. 引数 version が指定されなかったら`latest`にする
3. name と更新した version 変数から依存関係を fetch し、一致するもしくは近いバージョンの依存関係を取得する
4. package.json へ追加する

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

-   `package.json`への反映

https://github.com/codesandbox/codesandbox-client/blob/7886537619345681fed4bd2ee6168273ac32ad04/packages/app/src/app/overmind/namespaces/editor/internalActions.ts#L328

package.json ファイルを JSON.parse で中身取得
新規の依存関係を追加
JSON.stringify で JSON へ再変換した内容を`actions.editor.setCode({ moduleShortid, code });`とやらでおそらく反映させている

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

-   [別件] codesandbox の内部的な変更をトリガーとするファイル変更の反映の仕方

1. shortId というのは condesandbox がエディタで扱っている仮想ファイルの id のことだと思う
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

-   ユーザが依存関係を追加する手段は、SearchDependency フォームからの追加、package.json ファイルで依存関係を追加するの 2 通りである（はず

-   依存関係の追加は、その追加するモジュールの名前とバージョンを package.json に追加することで「保存」される。

-   実際のモジュールをインストールするわけではない（はず）

-   既存の依存関係と比較をしないで、常に追加処理を行う。
    最終的に`packageJson[type][name] = version || 'latest';`という方法で追加されるので、既存があっても上書きすることになる。

    なので一方通行の処理である。考える方はらくちん。

となると、

-   package.json が更新されたら、それを検知して typings を取得するための機能が必要になる
    これがそのまま動的 typings 取得機能となる。

-

#### 実装

依存関係を取得するのは現状 EditorContainer で行っているが、

これを上位に移設して、EditorContainer 以下は依存関係のオブジェクトを読み取るだけになる。

上位は「追加」または「削除」のリクエストを受信して、

依存関係を追加・削除を行ってから、結果を介コンポーネントへ返す仕様とする。

-   dependencies の context を生成する

-   `Types.initializeDependencies`とかのアクションを追加して、依存関係を template.typescript.files.packagejson[dependencies|devDepenencies]から取得し、fetchLibs.worker で取得する

-   `getDependenciesFromPackageJson()`みたいな便利な関数を使えるようにしたい。

懸念：

-   TODO: 要確認）worker は context で利用できるのか？

#### 実装 `getDependenciesFromPackageJson`

こいつはどこにあればいいんだ？

アプリケーションで扱う File[]は、files.ts --> FilesContext::initializeFile:File[]

こいつを取得できるのが条件

カスタムフックで作成できるか試す

`hooks/usePackageJson.ts`

## esbuild でマルチファイルをバンドルする方法

codesandbox の draft

https://codesandbox.io/s/esbuild-wasm-bundle-multil-files

-   esbuild の基礎の復習
-   esbuild api の学習
-   仮想ファイルの内容をバンドルする方法の模索

```bash
false
initializing...
initialized
[unpkgPathPlugins] onResolve:`filter: /(^index.js$)/`
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "react-dom/client", importer: "index.js", namespace: "a", resolveDir: "", kind: "import-statement"…}
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "react", importer: "index.js", namespace: "a", resolveDir: "", kind: "import-statement"…}
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "bulma/css/bulma.css", importer: "index.js", namespace: "a", resolveDir: "", kind: "import-statement"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react-dom/client
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react
[unpkgPathPlugin] onLoad packages :https://unpkg.com/bulma/css/bulma.css
[unpkgPathPlugin] onResolve `filter: /^.+//`
{path: "./cjs/react.development.js", importer: "https://unpkg.com/react", namespace: "a", resolveDir: "/react@18.2.0", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react@18.2.0/cjs/react.development.js
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "react-dom", importer: "https://unpkg.com/react-dom/client", namespace: "a", resolveDir: "/react-dom@18.2.0", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react-dom
[unpkgPathPlugin] onResolve `filter: /^.+//`
{path: "./cjs/react-dom.development.js", importer: "https://unpkg.com/react-dom", namespace: "a", resolveDir: "/react-dom@18.2.0", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/react-dom@18.2.0/cjs/react-dom.development.js
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "react", importer: "https://unpkg.com/react-dom@18.2.0/cjs/react-dom.development.js", namespace: "a", resolveDir: "/react-dom@18.2.0/cjs", kind: "require-call"…}
[unpkgPathPlugin] onResolve `filter: /.*/`
{path: "scheduler", importer: "https://unpkg.com/react-dom@18.2.0/cjs/react-dom.development.js", namespace: "a", resolveDir: "/react-dom@18.2.0/cjs", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/scheduler
[unpkgPathPlugin] onResolve `filter: /^.+//`
{path: "./cjs/scheduler.development.js", importer: "https://unpkg.com/scheduler", namespace: "a", resolveDir: "/scheduler@0.23.0", kind: "require-call"…}
[unpkgPathPlugin] onLoad packages :https://unpkg.com/scheduler@0.23.0/cjs/scheduler.development.js
{errors: Array(0), warnings: Array(0), outputFiles: Array(1), metafile: undefined, mangleCache: undefined}
​
```

```TypeScript
import * as esbuild from "esbuild-wasm";

export const unpkgPathPlugin = (): esbuild.Plugin => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {

      // 例：
      build.onResolve(
        //
        // `index.js`というpathに出くわした場合...
        //
        { filter: /(^index\.js$)/ },
        (args: esbuild.OnResolveArgs) => {

          if (args.path === "index.js") {
            return { path: args.path, namespace: "a" };
          }
        }
      );

      // Solves related path
      build.onResolve({ filter: /^\.+\// }, (args: esbuild.OnResolveArgs) => {

        return {
          namespace: "a",
          path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
            .href
        };
      });

      // Solves other path
      build.onResolve({ filter: /.*/ }, (args: esbuild.OnResolveArgs) => {

        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`
        };
      });
    }
  };
};
```

```TypeScript
// ...

export const fetchPlugins = (inputCode: string): esbuild.Plugin => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // Fetches modules on entry point file
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: "jsx",
          contents: inputCode
        };
      });

      // Check cached module
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        // Anyway load cached data.
        const cachedResult = await cacheDB.getItem<esbuild.OnLoadResult>(
          args.path
        );
        if (!cachedResult) {
          return;
        }
        return cachedResult;
      });

      // CSS Modules will be embeded to HTML as style tag
      build.onLoad(
        { filter: /\S+\.css$/ },
        async (args: esbuild.OnLoadArgs) => {
          // DEBUG:
          console.log("[unpkgPathPlugin] onLoad packages :" + args.path);

          let result: esbuild.OnLoadResult = {};
          const { data, request } = await axios.get(args.path);

          const escaped = data
            .replace(/\n/g, "")
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'");
          const content = `
                    const style = document.createElement("style");
                    style.innerText = '${escaped}';
                    document.head.appendChild(style);
                `;

          result = {
            loader: "jsx",
            contents: content,
            resolveDir: new URL("./", request.responseURL).pathname
          };
          cacheDB.setItem<esbuild.OnLoadResult>(args.path, result);
          return result;
        }
      );

      // `/.*/`: すべての文字列に一致する
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        // DEBUG:
        console.log("[unpkgPathPlugin] onLoad packages :" + args.path);

        let result: esbuild.OnLoadResult = {};

        const { data, request } = await axios.get(args.path);

        result = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname
        };
        cacheDB.setItem<esbuild.OnLoadResult>(args.path, result);
        return result;
      });
    }
  };
};


```

-   esbuild が entry ポイントのファイルを走査し、`import/require`を見つける
-   import/require で指定されている path を解決するために onResolve へ送信する
-

onResolveArgs:

importer:

> これは、解決されるこのインポートを含むモジュールのパスです。このパスは、名前空間が file の場合にのみファイルシステムパスであることが保証されることに注意してください。インポーター モジュールを含むディレクトリに対する相対パスを解決したい場合は、仮想モジュールでも機能するため、代わりに solveDir を使用する必要があります。

resolveDir:

> これは、インポート パスをファイル システム上の実際のパスに解決するときに使用するファイル システム ディレクトリです。モジュールが`file` namespace 内のモジュールの場合、この値はデフォルトでモジュール パスのディレクトリ部分になります。仮想モジュールの場合、この値はデフォルトで空ですが、`onLoad Callback`はオプションで仮想モジュールに解決ディレクトリを与えることもできます。その場合、そのファイル内の未解決のパスのコールバックを解決するために提供されます。

onResolveResults:

-   path:

> インポートを特定のパスに解決するには、これを空ではない文字列に設定します。これが設定されている場合、このモジュールのこのインポート パスに対して onResolve callback は実行されなくなります。これが設定されていない場合、esbuild は現在のコールバックの後に登録された on-resolve コールバックを引き続き実行します。その後、パスがまだ解決されない場合、esbuild はデフォルトで、現在のモジュールの解決ディレクトリに相対的なパスを解決します。

-   external:

> このプロパティを true にするとそのモジュールはバンドルに含まれずに、代わりに実行時に import されることになる

-   namespace:

> 設定しないとデフォルトで`file`になる

つまり filesystem が前提になるので、ブラウザでは常にデフォルト以外を設定しないといけない

> ファイル システム パスではないパスに解決したい場合は、名前空間をファイルまたは空の文字列以外の値に設定する必要があります。これにより、パスがファイル システム上の何かを指すものとして扱われないように esbuild に指示されます。

-   errors and warnings

> path 解決中に発生したエラーをログに記録したいときに使う

#### esbuild.buildoptions

参考

https://github.com/evanw/esbuild/issues/1952

#### loader

https://esbuild.github.io/api/#loader

たとえば typescript + react なら、

`tsx`, `ts`, `js`, `jsx`, 他アセットの拡張子などを扱う。

予め扱うファイルの種類を想定できれば適切にバンドルできるけど、

想定外のファイルを扱うことにした場合、バンドル出来ないということかしら？

#### 予め仮想ファイルの tree オブジェクトを渡して解決しておくプラグイン検証

https://github.com/evanw/esbuild/issues/1952#issuecomment-1020006960

検証中。


## TypeScript compile

どっかにまとめたノートを転記すること。

このリポジトリの`sample`だと、TypeScript workerが渡したコードをコンパイルして渡してくれる。

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