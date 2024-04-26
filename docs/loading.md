# Loading 

## Summary

## TODOs

- TODO: [初期マウント完了までの計測](#初期マウントの完了までの計測)
- TODO: [Profiler](#Profiler)

- TODO: buildしたアプリケーションを実行させるにはどうすればいいのか
- TODO: webpack5におけるProfiler用の設定とは？

## React lazy

https://react.dev/reference/react/lazy

```JavaScript
import React from "react";

// lazy(loadFunction)
const MarkDownPreview = React.lazy(() => import('./MarkDownPreview.js'));
```

loadFunction:

上記の例でいえば、`MarkDownPreview`を初めてレンダリングしようとするまで、`./MarkDownPreview.js`のローディングを保留する。

この`MarkDownPreview`をレンダリングしようという段階で`MarkDownPreview.js`のローディングを試みる。

loadFunctionはPromiseを返す関数でなくてはならない。

ローディングの際にresolveされるまで待機する。

rejectされたらもっとも近い場所のエラーバウンダリでエラーをキャッチする

通常の`import`文でモジュールをインポートする場合と異なるのは、

`import`文でインポートするときは、そのimport分を含んでいるモジュールが読み込まれたときであるのに対して、

`lazy + import()`でインポートする場合はその`import()`でインポートするモジュールを初めてレンダリングする段階で読み込む

という点である。

レンダリングされる段階で初めて読み込み開始されるとのことだけど、

レンダリング -> 読み込み（非同期）-> lazy()の解決 -> そのコンポーネントのレンダリング

という段階を踏むことになるけれど、「読み込み」「解決」の間はレンダリングプロセス中ということでいいのかしら？

しかし読み込みは非同期なので同期的な処理が一度は完了しているはずなので、

非同期読み込みが完了するまでの間動的コンポーネントをどう扱っているのか？nullなのか？

--> 単純に存在しないだけである。

#### 通常importで取得したコンポーネントと同時にレンダリングするならlazy読み取りする意味はないか？

### 参考

https://github.com/expo/snack/blob/15cac8943ef75066fd5d4d4cd5201465412c4537/website/src/client/components/EditorView.tsx#L36


## 初期マウントの完了までの計測

各コンポーネントが初期マウント完了するまでに何をトリガーとして何度呼び出されているのか調査する

一時的に調査のために調査用のフックを作成する

自作カスタムフック：`useLoadingSurvey.tsx` ただ副作用でconsole.logするだけ
Profiler：Reactの組み込みライブラリ

```TypeScript
```

## Profiler

https://react.dev/reference/react/Profiler

https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977

https://www.dhiwise.com/post/how-to-optimize-react-app-performance-with-webpack-5

- TODO: buildしたアプリケーションを実行させるにはどうすればいいのか
- TODO: webpack5におけるProfiler用の設定とは？

## [webpack] how to run build app built by webpack?

https://webpack.js.org/guides/production/

Production用のwebpack configを作りなさいと。

いまのところ変更するべきは以下の部分か。

```JavaScript
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  mode: "development",
  devServer: {
    static: "./dist",
    hot: true,
    port: 8080,
    // allowedHosts: 'auto',
    // codesandboxで動かす都合上以下のhostに設定する
    allowedHosts: "lpzft6-8080.csb.app",
    // DEBUG:
    // Only for development mode
    headers: {
      "Access-Control-Allow-Origin": "*", // unpkg.com
      // 'Access-Control-Allow-Origin': 'unpkg.com',		// unpkg.com
      "Access-Control-Allow-Headers": "*", // GET
      "Access-Control-Allow-Methods": "*",
    },
    client: {
      overlay: false,
    },
  },
    //   ...
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-typescript",
                "@babel/preset-react",
              ],
              plugins: [
                isDevelopment && require.resolve("react-refresh/babel"),
              ].filter(Boolean),
            },
          },
        ],
      },
    //   ...
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "src/index.html",
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
};
```

#### 環境変数の設定

https://stackoverflow.com/a/30061249/22007575

## 走り書き stephan course

userのハードドライブ上にアプリケーションの更新内容を保存する

...かわりに更新内容を一つのファイルにまとめて保存するという手段をとる

アプリケーションをローカル環境に影響できるようにする

ローカル環境にローカルExpressサーバを起動させて、ローカルからのアプリケーションの起動を可能にさせる

ローカルサーバ上にはLocal Node apiで動くアプリケーションが配備されており

ブラウザ上で動く本アプリケーションの更新内容を記録したりする


package.json

```JSON
{ 
  "scripts": {
    "serve": "node your-local-api.js"
  }
}
```

