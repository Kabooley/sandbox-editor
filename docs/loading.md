# Loading 

## Summary

- [Performance計測手順](#Performance計測手順)
- [Chrome Dev Tools Performance](#Chrome-Dev-Tools-Performance)
- [Performanceの基準の参考](#Performanceの基準の参考)

## TODOs

- TODO: [初期マウント完了までの計測](#初期マウントの完了までの計測)
- TODO: [Profiler](#Profiler)

- TODO: buildしたアプリケーションを実行させるにはどうすればいいのか
- TODO: webpack5におけるProfiler用の設定とは？
- TODO: やっぱり初期レンダリング時にバンドルしていない（編集を開始しないとバンドルしないのかも）
- TODO: `webpack.prod.js`をproductionモード用に作り直す

- TODO: NOTE: `useLoadingSurvey`というコンポーネント呼出の為のフックを各コンポーネントに追加しているのでこれの削除

## React Performance Optimization

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



## Profiler

https://react.dev/reference/react/Profiler

https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977

https://www.dhiwise.com/post/how-to-optimize-react-app-performance-with-webpack-5


## [Webpack] TODO: Setting for Production mode bundling

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



## Performance計測手順

1. production modeでコンパイルすること。本番環境で計測すること。
2. `dist/index.html`をブラウザで開く
3. chrome dev toolsのPerformanceタブでリロードする

TODO: `webpack.prod.js`がまだproductionモード用に作り直していない。


## Performanceの基準の参考

https://web.dev/articles/rail?hl=ja

Googleがウェブアプリケーションのロード時間や応答時間とユーザの反応の関係から最適な時間の目安を紹介している

目標はユーザの満足度を向上させることで、処理速度の向上ではない。

## Chrome Dev Tools Performance

https://developer.chrome.com/docs/devtools/performance/reference

https://zenn.dev/koki_tech/articles/9deb70d0a9befb

https://qiita.com/teradonburi/items/5b8f79d26e1b319ac44f

https://calibreapp.com/blog/react-performance-profiling-optimization


「ボトルネックは推測するな計測せよ」






## Chrome dev tools

- CPU をスロットリングして、性能の低いデバイスをシミュレートします。

- ネットワークをスロットリングして、低速の接続をシミュレートします。

- メインスレッドのアクティビティを表示して、記録中にメインスレッドで発生したすべてのイベントを確認します。

- テーブルにメインスレッド アクティビティを表示して、最も時間を要したアクティビティに基づいてアクティビティを並べ替える。

- フレーム/秒（FPS）を分析し、アニメーションが本当にスムーズに実行されるかどうかを測定します。

- パフォーマンス モニターを使用すると、リアルタイムで CPU 使用率、JS ヒープサイズ、DOM ノード、1 秒あたりのレイアウトなどをモニタリングできます。

- [ネットワーク] セクションで、記録中に発生したネットワーク リクエストを可視化できます。

- 録画中にスクリーンショットをキャプチャすることで、ページの読み込み中やアニメーション表示などでページの表示状態を正確に再現できます。

- インタラクションを表示して、ユーザーがページを操作した後にページで何が起きたかを簡単に特定できます。

- 問題がある可能性のあるリスナーが起動されるたびにページをハイライト表示することで、スクロールのパフォーマンスの問題をリアルタイムで検出できます。

- ペイント イベントをリアルタイムで表示して、アニメーションのパフォーマンスを低下させている可能性がある、コストのかかるペイント イベントを特定します。


# Call Tree

https://developer.chrome.com/docs/devtools/performance/reference#call-tree

CallTreeタブは任にの選択期間のアクティビティを表示する

- self time: そのアクティビティの経過時間
- total time: 

## Script evaluation and long tasks

https://web.dev/articles/script-evaluation-and-long-tasks?hl=ja

- Total Blocking Time: ページ読み込み時にスクリプト評価が過剰に発生しないかどうか調べるための指標

https://web.dev/articles/tbt?hl=ja

- スクリプト評価のためにディスパッチされるタスクの数は`<script>`要素の数と直接関係がある

ディスパッチの数は少ない程よいが、ディスパッチが一回で済むにしてもスクリプトが巨大であれば話は異なる

**個々のスクリプトサイズは100kbを目安にするべき**

- `<script>`はtype=moduleなのか否かでスクリプト評価タスクがどのように開始されるかは異なる

- ページ読み込み時に読み込むJavaScriptは可能な限り最小限に抑えるべき。もしくはメインスレッドをブロックしない程度にスクリプトを分割する。

> 現在のところ、Chromium ベースのブラウザでは、defer 属性を使用して読み込まれたすべてのスクリプトが、DOMContentLoaded イベントと同じタスクで実行されます。これにより、全体的なレイアウト作業は最小限に抑えられますが、コストが高くなり、タスクが長くなる可能性が高くなり、他のパフォーマンスの問題を引き起こす可能性があります。

本アプリケーションはindex.htmlがバンドル後scriptをdefer属性をつけて読み込むようになっている

- webworkerでスクリプトを読み込めばwebworkerを登録するコード自体はメインスレッドで実行されるが、webworker内のコードは別スレッドで実行されるためメインスレッドの処理の集中が軽減される

疑問：ではWebpackで複数ファイルをバンドルするとき、ファイルは大きくなりすぎないようにある程度のサイズで分割するべきなのか？

トレードオフと考慮事項

> スクリプトを別々の小さなファイルに分割することで、少数の大きなファイルを読み込むのではなく、時間のかかるタスクを制限できますが、スクリプトの分割方法を決定する際は、いくつかの点を考慮することが重要です。

TODO: 続きをまとめること


## 計測

計測結果のメモ

#### ローディング完了までの計測内容

NOTE:個々の情報はデベロップモードでwebpack dev serverでアプリケーションを実行しているときに計測した情報で、productionモードではない！！

だからこの記事は消すかも。

Summary:
  
DOMContentLoaded: 31063ms
LoadEvent:25983ms
Scripting: 70%
system: 10%
idle: 5%

Call Tree:

Evaluate Script: 13730.2ms
  index.bundle.js: 83.2%
    内、getModelByPath.tsの占める割合は45.4%で、その原因がmonaco-editorのコンパイル
  fetchLibs.worker.bundle.js:9.7%
    内、依存関係であるtypescriptの読み取りに6.5%でほぼこれが原因
    なんだか別のところでSemverが時間かかっているように見えたけれど、これは0.4%で無視していい 

getModelByPath.tsの読取はMonacoEditor.tsxの前に実行されるので実質ここでmonaco-editorが読み取られる

とはいえ結局monaco-editorのコンパイルはしなくてはならないわけで、遅いか速いかの違いでしかないと思う

実際`getModelByPath`は型の参照しかしていない



