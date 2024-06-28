# Document of packageJsonSlice.ts

## Overview

typingLibsSlice.tsのstate.dependenciesの依存関係と`src/data/files.ts`のfiles`['package.json']`の連携を司るreducer。

ユーザによるpackage.jsonファイルの編集内容をtypingLibsSlice.tsのstate.dependenciesへ反映させる

## Logic

```TypeScript

interface iState {
    snapshot: string;
    updatingDependencies: boolean;
    reflectingDependencies: boolean;
}


interface iPackageJsonProps {
    dependencies: Record<string, any>;
    devDependencies: Record<string, any>;
}


const initialState: iState = {
    snapshot: packageJsonTemplate,
    updatingDependencies: false,
    reflectingDependencies: false,
};
```

- `snapshot`

package.jsonの差分を検出するための比較対象のファイル。package.jsonの`dependencies`と`devDependencies`に変更があるのか比較するために変更前の状態のpackage.jsonを保存する。

- `updatingDependencies`

依存関係に差分が検出されたときに、差分の解消が済むまで`true`となる

ローディング表示をするために利用する予定

- `reflectingDepenencies`

依存関係の差分の解消が完了したのち、それらをpackage.jsonファイルへ反映させる間`true`となる

## Feature

#### `updatePackageJson`

現在のpackage.jsonとstate.snapshotのpackage.jsonの値を比較して差分を検出し、

差分内容ごとにtypingLibsSliceのアクションを呼び出す

`dependencies`と`devDependencies`の差分から次を見つけ出す

削除された依存関係、変更された依存関係、新規に追加された依存関係


pending

`state.updatingDependencies`をtrueにする

fulfilled

`state.updatingDependencies`をfalseにする

rejected

`state.updatingDependencies`をfalseにする

#### `reflectingDependenciesToPackageJson`

`ThunkAPI.getState()`からtypingLibsSlice.tsのdependenciesを取得して

その内容をpackage.jsonファイルへ反映させる

NOTE: typingLibsSlice.tsのdependenciesが更新されるたびに呼び出さなくてはならない


pending

`state.reflectingDependencies`をtrueにする

fulfilled

`state.reflectingDependencies`をfalseにする

snapshotを更新済のpackage.jsonファイルに更新する

rejected

`state.reflectingDependencies`をfalseにする

## Dependencies

`src/slices/typingLibsSlice.ts`と密接

## Usage


```TypeScript
this.props.dispatch(updatePackageJson(code))
.unwrap()
.then(() => 
    this.props.dispatch(reflectDependenciesToPackageJson())
)
.catch((rejectedValue: SerializedError) => {
    this.props.dispatch(reflectDependenciesToPackageJson())
    console.error('[TestPackageJsonManagement] there was an error');
    console.error(rejectedValue.name + ' ' + rejectedValue.message);
    console.error(rejectedValue.stack);
});
```