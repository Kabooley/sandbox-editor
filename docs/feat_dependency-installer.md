# Implement dependency installer

現状`@typescript/ATA`を使って依存関係を自動的に取得している。

非常に便利で問題はないのだが、ATA はバージョンを指定できないのが欠点。

ではマニュアルで操作できるようにしたとして、結局ＡＴＡの利点が失われるので

ユーザに責任を求める手動インストール機能を設定することにする。

codesandbox のあれを参考にする。

## 参考

https://github.com/codesandbox/codesandbox-client/tree/9a75ddff1312faaf9fcd3f7f8a019de0f464ab47/packages/app/src/app/pages/Sandbox/SearchDependencies

https://github.com/codesandbox/codesandbox-client/blob/df8844a3cb183fa4f5d42f86ea55a55eca5a3f00/packages/app/src/app/overmind/namespaces/editor/actions.ts#L128

https://github.com/codesandbox/codesandbox-client/blob/df8844a3cb183fa4f5d42f86ea55a55eca5a3f00/packages/app/src/app/overmind/namespaces/editor/internalActions.ts#L328

## Summary

-   [](#)
-   [](#)
-   [](#)
-   [](#)
-   [](#)

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

## 参考サイトの分析
