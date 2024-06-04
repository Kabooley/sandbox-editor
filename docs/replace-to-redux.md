# React Reduxへの切り替え

https://react-redux.js.org/introduction/getting-started

https://github.com/reduxjs/react-redux/releases

https://github.com/reduxjs/redux-toolkit/releases?page=3

既にcontext + useReducerのproviderが４つある、かつ余計な再レンダリングを減らすためにReduxを導入する。

## TODOs

- TODO: files.tsx::filesにはフォルダを含めないとならないかも

## Summary

- [Redux](#Redux)
- [Redux導入](#Redux導入)

## Redux

調べたこと。

## [Redux] Do not put non-serializable values in state or actions

https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions

> **Avoid putting non-serializable values such as Promises, Symbols, Maps/Sets, functions, or class instances into the Redux store state or dispatched actions.**

Reduxのスタイルガイドのページで`ESSENTIAL`（必ず守らなくてはならない項目）としてマークされている。

ということで、ついにfilesがclass インスタンスではなくプレーンjsオブジェクトに変更になるときが来た。


- [Deprecate File class](#Deprecate-File-class)

## [Redux] Dispatch action from another reducer

https://stackoverflow.com/a/41260990/22007575

#### layoutSlice.tsx::state.modalDataSetの修正

callbackをやめる。


```TypeScript
// これをやめる
const callback = () => {
    // このdispatchはDialogActionButtonが送信する
    dispatch(
        filesActions.deleteMultipleFiles({
            requiredPaths: deletionTargetFiles.map((d) => d.path),
        })
    );
    // モーダル終了リクエストもDialogActionButtonが送信する
    dispatch(layoutActions.RemoveModal());
};
```
```TypeScript
// Invokes
dispatch(
    layoutActions.ShowModal({
        type: ModalTypes.DeleteAFile,
        payload: {
            deletionFilePath: targetFilePath,
            filename: getFilenameFromPath(targetFilePath)
        }
    })
);
// reducer
showModal(state, action);
        getModalDataSet(action.payload);
            layoutSlice.state.modalDataSet = {
                message: template.message,
                description: mustache(template.description, action.payload.payload.filename),
                actions: [{
                    label: 'delete',
                    requiredAction: action.payload,
                    style: 'danger'
                }]
            }
// Dialog/index
// 上記のlayoutSlice.state.modalDataSetを取得できる
```


#### [Redux] middleware

https://redux.js.org/tutorials/essentials/part-5-async-logic#thunks-and-async-logic

- アクションがディスパッチれたら追加のロジックを実行する（reducer）を渡す前に
- 追加のロジックは`dispatch`や`getState`にアクセスできる



## Redux導入

## Installation

```bash
yarn add react-redux @reduxjs/toolkit
```

## react-redux React17とのバージョン一致

インストールされたreact-reduxはv9である。

React17でreact-reduxを使っていたら`useSyncExternalStore`がないよとエラー。

どうやらReact18の機能のようで、バージョン合わせが必要になった。

https://github.com/reduxjs/react-redux/releases/tag/v9.0.0

changelogより

> **React 18 and RTK 2 / Redux core 5 Are Required**

> React-Redux 7.x および 8.x は、フック (16.8+、17.x、18.x) を備えた React のすべてのバージョンで動作しました。ただし、React-Redux v8 は React 18 の新しい useSyncExternalStore フックを使用しました。古い React バージョンとの下位互換性を維持するために、React 16 または 17 で使用する場合に useSyncExternalStore フックの公式ユーザーランド実装を提供する use-sync-external-store "shim" パッケージを使用しました。 React 18 では、必要ではないにもかかわらず、数百バイトの余分な shim コードがインポートされていました。

ということでreact-redux v8のダウングレードを試みる

```bash
# major versionだけ指定してそのメジャーバージョンの最新バージョンを取得したいとき
# ^をつける
$ yarn upgrade react-redux@^8.0.0
```

`upgrade`でバージョンを変更したら、変更前バージョンのパッケージアイテムはnode_modulesに残るか？

-> 残らない。完全に置き換わるそうで。


## error useDispatch.withTypes is not a function

https://github.com/reduxjs/react-redux/releases/tag/v9.1.0

react-redux v9.1.0からの機能のようなので、ダウングレードしたreact-reduxに合わせてwithtypesの使用をあきらめる。

#### withTypes の代わり

https://react-redux.js.org/using-react-redux/usage-with-typescript#withtypes

`wihTypes`を用いる前の使い方について書いてあった

https://redux.js.org/usage/usage-with-typescript#define-root-state-and-dispatch-types

#### 密接なかかわりのあるライブラリ同士のバージョンのコンパチを確認する方法

- 公式releaseまたはdocsを読む
- node_modulesのそのライブラリのpackage.jsonを確認する


## 参考

https://blog.isquaredsoftware.com/2021/01/context-redux-differences/



## 入替

#### 要確認事項

- TODO: explorer/Workspace/各columnでのファイル削除機能
- TODO: explorer/Workspace/各columnでのフォルダ削除機能
- TODO: explorer/Workspace/各columnでのリネーム機能
- TODO: explorer/Workspace/各columnでのフォルダ新規追加機能
- TODO: explorer/Workspace/各columnでのファイル新規追加機能
- TODO: explorer/Workspace/各columnでのdnd機能
- TODO: explorer/Workspace/paneheaderでのフォルダ追加機能
- TODO: explorer/openEditorでのファイル閉じる機能
- TODO: explorer/openEditorでのファイルすべて閉じる機能
- TODO: TabsAndActionsでのタブを閉じる機能
- TODO: TabsAndActionsでのタブをdndする機能

#### Error: A non-serializable value was detected in the state, in the path

https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state

もしかしたらclass instanceのことを言っているのかもしれない

```bash
VM4666:6 A non-serializable value was detected in the state, in the path: `files.files.0`. Value: 
File {_path: 'public/index.html', _value: '\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset…body>\n    <div id="root"></div>\n  </body>\n</html>', _language: 'html', _isFolder: false, _selected: false, …}
 
Take a look at the reducer(s) handling this action type: files/changeFile.
(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)
dispatch	@	VM4666:6
reflectToPackageJson	@	TypingLibsContext.tsx:534
handleWorkerMessage	@	TypingLibsContext.tsx:286
Show 6 more frames
```

modalアクションをリクエストするときに、関数をstateに保存しようとしていますよというエラー

```bash
VM4666:6 A non-serializable value was detected in an action, in the path: `payload.callback`. Value: ƒ callback() {
      // やってほしいこと
      dispatch(_slices_filesSlice__WEBPACK_IMPORTED_MODULE_12__.filesActions.deleteMultipleFiles({
        requiredPaths: deletionTargetFiles.map(function (d) {
       … 
Take a look at the logic that dispatched this action:  
{type: 'layout/ShowModal', payload: {…}}
 
(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants) 
(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)
```


## Deprecate File class

「仮想ファイルシステムを構築しよう」という壮大な夢は隣に於いておいて。

classの利用をやめて完全にプレーンなJSオブジェクトに変更する

TODO: classからプレーンオブジェクトへの置換作業
    ひとまずfilesSlice.tsの置換処理を完了したらテストして

- TODO: setPathメソッドの機能だけ取り出さないといけない。
- TODO: files.ts/filesはそのまま渡していいのか？

```TypeScript

export class File {
    constructor(
        private _path: string,
        private _value: string,
        private _language: string,
        private _isFolder: boolean,
        private _selected: boolean = false,
        private _opening: boolean = false,
        private _tabIndex: number | null = null
    ) {}

    _isPathValid(path: string): boolean {
        // TODO: make sure path is valid
        return true;
    }

    setPath(path: string) {
        // TODO: make sure path is not include non exist folder
        // if(isFilenameValid(path)){
        if (this._isPathValid(path)) {
            this._path = path;
            const language = getFileLanguage(path);
            this._language = language !== undefined ? language : '';
        }
    }

    setValue(value: string) {
        this._value = value;
    }

    getPath(): string {
        return this._path;
    }

    getValue(): string {
        return this._value;
    }

    isFolder(): boolean {
        return this._isFolder;
    }

    // temporary
    getLanguage(): string {
        return this._language;
    }

    setSelected(): void {
        this._selected = true;
    }

    unSelected(): void {
        this._selected = false;
    }

    isSelected(): boolean {
        return this._selected;
    }

    isOpening(): boolean {
        return this._opening;
    }

    setOpening(flag: boolean): void {
        this._opening = flag;
    }

    getTabIndex(): number | null {
        return this._tabIndex;
    }

    setTabIndex(i: number | null): void {
        this._tabIndex = i;
    }
}

```



#### 仮想ファイルシステム（という壮大な話）

参考：ポピュラーなvirtual filesystem機能を提供するnpm package

- BrowserFS
- virtualFS

- [web api filessytem](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [The origin private file system](https://web.dev/articles/origin-private-file-system)

ブラウザからクライアントのファイルシステムにアクセスできるという代物で、つまり求めているモノではない（sandbox-editorでローカルファイルシステムにアクセスすることは考えていないため）。あくまでブラウザ上の仮想ファイルシステム（のようなもの）が欲しいのである。ファイルの管理の参考にするため


#### 何がどうなればいいのか?

保存機能があればいいのだと思う

monaco-editor: 

- すべての仮想files毎にmodelの生成が必要
- ファイル同士の参照のために、すべてのfileをmonacoのaddExtraLibsに登録する必要がある


```TypeScript
// modelの生成
const { value, language, uri } = AFileFromFiles;
const model = monaco.editor.createModel(value, language, uri);
// editorに展開するとき
// pathから一致するmodelを探して
this._refEditor.setModel(model);

let uri = monaco.Uri.from({
            scheme: 'file',
            path: path,
        }).toString();
        if (path.includes('@')) {
            uri = uri.replace('%40', '@');
        }

// extra-libsへの登録
const js = monaco.languages.typescript.javascriptDefaults.addExtraLib(
    code,
    uri
);
const ts = monaco.languages.typescript.typescriptDefaults.addExtraLib(
    code,
    uri
);
```

#### テスト　走り書き


- TODO: MonacoEditorでonDidChangeModelContentで正常にfileが更新されているか
        filesとextraLibsも。
- TODO: explorer/Workspace/各columnでのフォルダ削除機能
- TODO: explorer/Workspace/各columnでのdnd機能
- TODO: explorer/Workspace/paneheaderでのフォルダ追加機能
- TODO: TabsAndActionsでのタブをdndする機能

- explorer/openEditorでのファイル閉じる機能
        OK。ただしeditor上に表示されてるモデルは閉じたはずのファイルのモデルが残っている。

- TabsAndActionsでのタブを閉じる機能
        OK。ただしeditor上に表示されてるモデルは閉じたはずのファイルのモデルが残っている。

- explorer/Workspace/各columnでのファイル削除機能
        OK。ただしfiles.tsx::filesのデータロジックに変更が必要なことが判明。

- explorer/openEditorでのファイルすべて閉じる機能
        OK。
- explorer/Workspaceでのアイテムdnd機能
        OK。ただし、ルートディレクトリへアイテムをドロップできない。

- explorer/Workspace/各columnでのリネーム機能
        OK。

- explorer/Workspace/各columnでのフォルダ新規追加機能
        OK。

- explorer/Workspace/各columnでのファイル新規追加機能
        OK。


他

- TODO: files.tsx::filesにはフォルダを含めないとならない
    generateTreeなど多くの場所に影響がある（変更が必要になる

- TODO: explorer/Workspaceでのdndに関して、ルートディレクトリへのdrop出来ない問題