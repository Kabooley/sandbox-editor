# Local Server

ローカル環境にNodeサーバを起動して、アプリケーションの起動や連携を行う。

Stephanの講義より。

## Summary

- [monorepo あれこれ](#monorepo-あれこれ)

## 講義内容走り書き

section 21より

package.json

```diff JSON
{
    "scripts": {
+       "server": "node your-node-server.js"
    }
}
```

road map

CLI:

- ローカルAPIを起動する方法
- アプリケーションを公開する方法

Local Express API:

ローカルマシン上でどうさせることだけを前提とする場合

- アプリケーションの起動方法
- filesystemの読み書き

Public Express API:

公開する場合（講義外）

- filesysetmではなくdatabaseからの読み書き
- 認証方法、権限

アプリケーション：

- publicかlocalかでことなる実装

CLI/local express/public express/appはそれぞれ独立したアプリケーションにしたい

各機能を独立したアプリケーションにするのでpackageに分割する

つまり以下の各機能を独立したパッケージとして作成して、すべて一つのパッケージとしてまとめるのである

CLI: jbook
local express api: @jbook/local-api
public express api: @jbook/public-api
app: @jbook-client

githubでよく見る奴。

公開情報に認証機能のコードを含めると攻撃の対象となるので必要に応じてprivateにするなどする



## Lerna CLI

https://lerna.js.org/docs/getting-started

Lernaを導入するとどんなメリットがあるの？

複数のパッケージプロジェクトを管理するためのツールである

類似のライブラリ

- Yarn Workspace
- NPM Workspace
- Bolt
- Luigi

Lernaのようなパッケージマネージャを利用し始めるとこれまでのように`npm`コマンドや`yarn`コマンドが使えなくなる

それらのコマンドはすべてLernaが代わりに行うことになる

つまりはひとたびLernaを使い始めるとすべてのパッケージの依存関係はLernaが管理することになる

```bash

```

#### Docs

既存のリポジトリに後からLernaを追加することができる

先に述べた通り依存関係管理は今後npmやyarnに代わってLernaになるとあるが、

公式のドキュメントにはそれらのﾊﾟｯｹｰｼﾞﾏﾈｰｼﾞｬの`workspace`機能を使うことを推奨された

https://docs.npmjs.com/cli/v10/using-npm/workspaces

`Workspace`とは要は独立したパッケージのための開発環境である

```bash
root/
    packages/
        package-a/
            ...
            package.json
        package-b/
            ...
            package.json
    package.json
```

上記のような状況に効果を発揮する機能である。

つまり、ルートディレクトリ、パッケージAのディレクトリ、パッケージBのディレクトリと
複数の環境が存在するようなプロジェクトのなかで、

YYフォルダ以下はパッケージXXのための開発環境であるというように指定ができるものである

`workspace`プロパティを`package.json`へ定義することで指定できる

ではどのpackage.jsonへ定義すればいいのだ？ルートディレクトリのやつか？各apckage.jsonか？

`workspace`を定義するのはルートディレクトリのpackage.jsonである

```JSON

```

#### 既存リポジトリにLernaを後から導入する場合

https://lerna.js.org/docs/getting-started#adding-lerna-to-an-existing-repo

後からの導入は可能。

予め`workspace`機能を定義してあればLernaは自動的に`workspace`の設定を読み取ってくれる

手動で指定することもできる


```bash
npx tsc --init
```


## monorepo あれこれ

npm workspace, yarn workspace, NX, Lerna which one is best?

https://stackoverflow.com/a/67202780/22007575

まずLernaが公式にもはやメンテナンスされないことがわかっている。

## Yarn Workspace

