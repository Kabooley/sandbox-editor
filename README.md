## 私を読んで

## TEST

## Directory構成

```bash
+---__tests__/       # NOTE: jest排除予定につき削除予定。jestを使ったテスト対象ファイル群。
+---browser-test/    # ブラウザ環境で実行されるテストファイル群。
+---mocha-tests/     # TODO: 削除予定。mochaの使い方を知るために設けたディレクトリ。
+---scripts/
|   `---generateBrowserTestFiles.mjs    # /browser-test/*.test.tsをブラウザテストファイルとして生成するscirpt
|
+---vitest-tests/    # ローカル環境でテスト可能なテストファイル群。
|   +---mocks/       # Web APIもキングファイル群
|   +---src-utils/   # src/utils/ファイル群のテストファイル群
|   +---src-worker/  # TODO: 削除予定。workerファイルはbrowser-testでテストすることにしたいので。
|   +---utils/       # TODO: 削除予定。
|   +--- *.test.ts[x]    # src/以下のReactファイルのテストファイル
|
|
+---babel.config.js  # TODO: 削除していいのか要確認。jestで使っていたbabelコンフィグファイル。jest削除予定につき削除予定。
+---jest.config.mjs  # TODO: 削除予定。jest削除予定につき。
+---rollup.config.js # browser-test用バンドラ。
```

## ブラウザテスト

手順：

```bash
# /browser-test/*.test.tsをブラウザテストファイルとして生成する
$ npm run bundle:browser-test
# テストサーバである/browser-test/server.mjsを起動する
$ npm run server:test-server
# ブラウザテストファイルをすべてブラウザ上で実行して結果をテストする
$ npm run test:browser-test
```

TODO: `browserTest.test.ts`はrollupの対象外にしなくてはならない
TODO: 各ブラウザテストファイルの記述における前提を定める（reportBrowserTest.tsを必ず呼び出すなど）

#### 前提


#### 単体ファイルからブラウザテストを生成する

```bash
$ npx rollup --config=rollup.config.mjs --input=browser-test/your-test-file.test.ts
```

## TODOs

#### 機能

- TODO: ローディング機能（ローディング完了するまで触れないようにする機能）
- TODO: サンドボックス化
- TODO: レスポンシブレイアウト

- TODO: 重要アイテム要素にtitle属性をつける（何者なのかホバーしたら表示されるようにする）
- TODO: TabsAndActions と Preview に action の追加（Preview トグルボタン、エディタに展開しているファイルを閉じるボタンなど）

- TODO: JSX色付け
- TODO: monaco-editorの最低限の設定機能の提供（ミニマップの表示非表示など）
- TODO: Dependenciesやpackage.jsonで依存関係の取得をしたときに失敗したらユーザへ通知する
- TODO: src/worker/fetchLibs.worker.tsがtypescriptを丸ごとimportしているのを、実際に使っているメソッドだけimportするように修正。（tree-shakingが有効になることでtypescriptを全部バンドルしなくていいようにするため）

#### 修正

- TODO: 依存関係がうまく取得できていない件の確認(まだ依存関係修正ブランチを取りこんでいないからという可能性もあり)
- TODO: data/files.ts を class インスタンス化をやめる
- TODO: selected: true のファイルを削除すると、editor 上ではその削除したファイルが残ったままになり別のファイルが selected:true になっていない
- TODO: 初期のバンドル処理が行われていないのか、バンドル結果が preview に表示されない
- TODO: format 機能がいつの間にかなくなっている？右クリックメニューでできるようにする

- TODO: テストフレームワークを動作させるためにpackage.jsonの`"type": "module"`を追加したけど開発用途においてまだ対応していないことの対応


#### TEST

- TODO: script `test:browser`でブラウザテストする対象全てをテストしたい
- TODO: 自動テスト（watchモード）の導入


## Browser Test

```bash
$ npm run test:browser
```

関連ディレクトリ

- `output`
- `browser`

要確認：`package.json`に`"type": "module"`が追加されていること

NOTE: `test:browser`コマンドはrollupのエントリファイルがbrowser/index.test.ts固定なので任意のファイルをエントリファイルにしたい場合はscriptを使わず直接コマンドを打つこと

## Lint

本プロジェクトはyarn@1.22.22を前提とする。

一方、`eslint`を実行するときはyarn@4.3.1を使う。

なのでlintするときだけバージョンを切り替えて！！（用が済んだらyarnを戻して！)

#### 前提

Node.jsバージョンはv20.xである。

#### 手順

NOTE: yarnのバージョン切り替えにcorepackを使っている。

NOTE: corepackはプロジェクトごとに切り替えること。

```bash
$ pwd
/home/USERNAME/sandbox-editor
$ corepack disable
$ corepack enable
$ corepack enable yarn

# --- 通常時 ---
$ yarn set version 1.22.22
# 以降以下のコマンドなど使える
# ただし、lintコマンドは使うな！
$ npm run start
$ npm run build

# --- lintコマンドを実行したいとき ---
$ yarn set version 4.3.1
$ npm run lint
$ npm run lint:fix
# lintの用が済んだらyarnのバージョンを戻す
$ yarn set version 1.22.22
```

要は、lintを使うときだけモダンyarnを使うのである。

#### 背景

yarn@4.3.1でアプリケーションを実行すると必ずエラーになるからで、かつ解決方法が見つかっていないから。

#### そもそもモダンyarnを使う理由

eslintはclassic yarnに対応していないから。

#### モダンyarnでアプリケーションが実行できない理由

実行すると以下のエラーが発生する。

```bash
Error: Can't resolve 'module' in /home/USER/sandbox-editor/node_modules/typescript/lib

```

どうもモダンyarnはpnpなる、`node_modules`を生成する代わりに独自の依存関係管理方法を作り出したみたいなんだけど、

これのせいでなぜかいままで問題なくビルドできていたtypescriptが、急にrequireしたモジュールどこにもないけど？とかいうエラーを吐き出し始める。

他にも理由があって、モダンyarnを採用すると、TypeErrorで`react`なんてライブラリ存在しないけど？とか言われる。

話にならんのでこれまで通り通常はyarn@1.22.22を採用することにする。

ほんとあほじゃないの？

