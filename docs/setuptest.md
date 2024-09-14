# Setup test: Jest, RTL, ts-jest

jest, testing-library/react, ts-jest
あとbabel-jest。

ESMで書かれたTypeScript, JavaScriptファイルをテスト可能にする。
Reactファイル（.jsx, .tsx）をテスト可能にする
react-reduxを使っていてもテスト可能にできるか試してみる

## まず知っておくこと

jsdomはWebWorkerなどの一部のweb apiをサポートしていない

## TODO: セットアップ内容をドキュメント化すること

その際、この環境ではWorkerコンストラクタがテストの障害になるからworkerを呼び出すコンポーネントをテストに含むことができないことを明記

TODO: ESMで書かれた.jsファイルがテスト可能であることの確認
TODO: .tsファイルがテスト可能であることの確認
TODO: .tsxファイルがテスト可能であることの確認

## 目次

- 準備

- TypeScriptファイルをテスト可能にする

    - ts-jestの公式サンプルリポジトリ、react-appをベースにする
    - 注意：jest.configファイルの拡張子は.mjsにすること


- ESMファイルをテスト可能にする
- `.js`, `.jsx`ファイルをテスト可能にする

- babel-jestを導入する
    - babel.config.jsを作成してテストに関するルールを記述する
    - jest.config.mjsのtransformルールに追加する

- jsdomがサポートしていないAPIをモックする

- Workerコンストラクタをモックする

- monaco-editorサポート

    - jest-canvas-mockをインストールする
    - matchMedia APIをモックする

- 他

    - ./__tests__/setup-jest.tsファイルがテスト対象になってしまう場合はtestMatchを設定しよう

## はじめに

この記事は以下の人にとってもしかしたらヒントになるかもしれない記事です。

- ESMファイルをjestでどうやってテスト可能にすればいいのかわからない
- JavaScript, TypeScript両ファイルが混ざっているプロジェクトをテスト可能にしたい
- jsdomがサポートしていないweb APIをモックする方法を知りたい
- monaco-editorを導入しているプロジェクトをテスト可能にしたい

次のような事柄を解決します

- jestでESMファイルをテスト可能にする
- TypeScriptファイルをテスト可能にする
- `.js`, `.ts`両拡張子のファイルをテスト可能にする
- jsdomがサポートしていないweb APIのモックを実現する

## 知っておくべきこと

- jestはECMAScriptで書かれたモジュールを正式にサポートしていない
- jestはそのままではTypeScriptファイルをサポートしていない
- jestはNode.js環境で利用可能であり、ブラウザ環境を想定していない

## 準備

TypeScriptファイルをjestでテスト可能にしてくれるライブラリts-jestの公式サンプルであるリポジトリをベースにします。

stackblitz.comならすぐにブラウザ上でリポジトリを開くことができます。

https://developer.stackblitz.com/guides/user-guide/importing-projects

ts-jestの公式サンプルのリポジトリは、そのままでReact + TypeScript 環境かつ ESM で書かれたファイルをテスト可能になっています。

https://github.com/kulshekhar/ts-jest/tree/main/examples/react-app

以下のとおり、import/exportで書かれた`App.tsx`がテストをパスするのが確認できます。

```bash
$ npm run test-esm
```

以降はこの公式リポジトリのいくつかあるテストコマンドのうち、

`test-esm`コマンドと、このコマンドに渡しているコンフィグファイルを変更していき、最終的にJavaScript、TypeScript、ESMでかかれたファイルなどがすべてテスト可能になる設定にしていきます。

## TypeScriptファイルをテスト可能にする方法

実はjestコンフィグファイルに対してはやることはないです。

どちらかというとjestようにtsconfig.jsonファイルを用意して適切に設定していく必要があります。

package.json:

```JSON
{
  // ...
  "scripts": {
    // ...
    "test:esm": "NODE_OPTIONS=\"$NODE_OPTIONS --experimental-vm-modules\" npx jest -c=jest.config.mjs --no-cache"
  },
  //   ...
}
```

## ESMファイルをテスト可能にする方法

https://jestjs.io/docs/ecmascript-modules

> Jest ships with experimental support for ECMAScript Modules (ESM).

ということでそんな実験的な機能を有効にするための手順が上のリンクに載っていますと。

