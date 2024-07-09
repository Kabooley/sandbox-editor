# Document of typingLibsSlcie.ts

`src/slices/typingLibsSlice.ts`

## Overview

sandbox-editorの依存関係の管理を司るReduxのreducerの一つである。

monaco-editorのextra libsへ取得した依存関係の型ファイルを登録する

アプリケーションの提供しているエディタが主としている依存関係を管理する

`src/worker/fetchLibs.worker.ts`のインスタンスを保持し通信する

`src/worker/fetchLibs.worker.ts`が依存関係の取得を行う

アプリケーションに依存関係一覧情報とアクションを提供する

## Logic

```TypeScript
interface iState {
    dependencies: iDependency[];
    // requestingDependencies: iRequestingDependency[];
}

interface ModuleAndVersion {
    moduleName: string;
    version: string;
    devDependency: boolean;
}

const initialState: iState = {
    dependencies: [],
    // requestingDependencies: [],
};
```

`requestingDependencies`は使っていない

#### monaco-editor extraLibs disposers

extra libsへ登録や登録したファイルの削除をするために登録したファイルのdisposerをtypingLibsへ登録している

```TypeScript
/***
 * stores pair of fetched moudleName and its monaco disposable for cache purpose.
 **/
const typingLibs = new Map<
    string,
    { js: monaco.IDisposable; ts: monaco.IDisposable }
>();
```

## Features

#### `fetchModule`

リクエストされた依存関係を取得する`createAsyncThunk`で生成したThunkアクションクリエータである。

workerと通信して依存関係の取得をリクエストしレスポンスをstateへ反映させる

処理中に発生したエラーはすべて`builder.addCase(fetchModule.rejected)`が処理する

pending

state.dependenciesへリクエストされた依存関係を追加して`state: 'loading'`にする

fulfilled

state.dependenciesの依存関係`state: 'loaded'`にする

`addExtraLibs`を呼び出して依存関係の依存関係ファイルをextraLibsへ登録させる

rejected

state.dependenciesの依存関係`state: 'failed'`にする

#### `fetchAnotherVersionModule`

NOTE:既存依存関係の別バージョンの取得中に失敗したら既存バージョンの依存関係も削除される

なのでユーザは再度手動で取得しなおすことになる

#### `removeModules`

リクエストされた依存関係（の依存関係ファイル）をextraLibsから削除する。

リクエストされた依存関係をstate.dependenciesから削除する。


## Dependencies

workerとの通信を簡潔にしたいのでComlinkを使ってワーカーインスタンスをラップしている


## Usage

#### 新規依存関係をリクエストするとき

NOTE: 必ずdispatchする側が`reflectDependenciesToPackageJson`アクションを呼び出すこと

typingLibsSlice側で呼び出さないのは、typingLibsSlice.state.dependenciesの更新を先に行いたいからである

Reduxのunwrap()ではfinallyは呼び出せない模様なので冗長だけどthen()とcatch()で同じ処理を行っている

catchは.unwrap()している限り必ず呼び出さなくてはならない。例外がキャッチされずにアプリケーションが止まるから

```TypeScript
dispatch(
    fetchModule({
        moduleName: dependencyName,
        version: version,
        prevVersion: exist.version,
        devDependency: false,
    })
)
    .unwrap()
    .then(() => dispatch(reflectDependenciesToPackageJson()))
    .catch(() => {
        dispatch(reflectDependenciesToPackageJson());
    });

```

#### 既存依存関係の別バージョンをリクエストするとき

fetchModuleと同様

```TypeScript
dispatch(
    fetchAnotherVersionModule({
        moduleName: dependencyName,
        version: version,
        prevVersion: exist.version,
        devDependency: false,
    })
)
    .unwrap()
    .then(() => dispatch(reflectDependenciesToPackageJson()))
    .catch(() => {
        dispatch(reflectDependenciesToPackageJson());
    });

```

### 依存関係を削除するとき

```TypeScript

dispatch(
    removeModules([
        {
            moduleName: dependency.moduleName,
            version: dependency.version,
            devDependency: dependency.devDependency,
        },
    ])
)
    .unwrap()
    .then(() => dispatch(reflectDependenciesToPackageJson()));
```