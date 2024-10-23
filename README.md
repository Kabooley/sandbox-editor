## 私を読んで

## TODOs

- TODO: テストフレームワークを動作させるためにpackage.jsonの`"type": "module"`を追加したけど開発用途においてまだ対応していないことの対応

## Browser Test

```bash
$ npm run test:browser
```

関連ディレクトリ

- `output`
- `browser`

要確認：`package.json`に`"type": "module"`が追加されていること

NOTE: `src/worker/fetchLibs.worker.ts`はbrowserテストをするけど、worker apiをテストするには開発者の技術が足りていないので、通常のモジュール（`browser/fetchLibs.ts`）として本来のファイルを変更してテストしている

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

