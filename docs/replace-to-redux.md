# React Reduxへの切り替え

https://react-redux.js.org/introduction/getting-started

https://github.com/reduxjs/react-redux/releases

https://github.com/reduxjs/redux-toolkit/releases?page=3

既にcontext + useReducerのproviderが４つある、かつ余計な再レンダリングを減らすためにReduxを導入する。

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

## 学習ノート

udemyのMaximilian Reactコースより

## Section 19

## 参考

https://blog.isquaredsoftware.com/2021/01/context-redux-differences/



## 入替

#### A non-serializable value was detected in the state, in the path: `files.files.0`. Value: 

