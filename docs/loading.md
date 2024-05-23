# Loading

## Summary

- [Performance の基準の参考](#Performanceの基準の参考)

- [パフォーマンスについて知っておくこと](#パフォーマンスについて知っておくこと)

  - [ユーザエクスペリエンスに基づく基準値](#ユーザエクスペリエンスに基づく基準値)
  - [Script Evaluation](#Script-Evaluation)

- [計測方法](#計測方法)

  - [Chrome Dev Tools Performance](#Chrome-Dev-Tools-Performance)

- [React パフォーマンス改善基礎](#Reactパフォーマンス改善基礎)

  - [React Lazy](#React-Lazy)
  - [Profiler](#Profiler)

- [Webpack 設定](#Webpack設定)


- [計測](#計測)

  - [Performance 計測手順](#Performance計測手順)

- [マウント時バンドルの実行](#マウント時バンドルの実行)

- [参考](#参考)

## TODOs

- TODO: webpack5 における Profiler 用の設定とは？
- TODO: [初期マウント時にバンドル処理](#初期マウント時にバンドル処理)
- TODO: `webpack.prod.js`を production モード用に作り直す

- TODO: NOTE: `useLoadingSurvey`というコンポーネント呼出の為のフックを各コンポーネントに追加しているのでこれの削除

- TODO: [EditorContainer.tsxのローディング中のfallbackアニメーションがフリーズする件](#EditorContainer.tsxのローディング中のfallbackアニメーションがフリーズする件)

- TODO: PixelLoading.cssをsassに移動すること

- TODO: [performance] classコンポーネントをPureComponentに変更するか検討

- TODO: [[別ブランチ]context+useReducerからReduxへ切り替え](#[別ブランチ]context+useReducerからReduxへ切り替え)

## パフォーマンスについて知っておくこと

## ユーザエクスペリエンスに基づく基準値

https://web.dev/articles/rail?hl=ja

Google がウェブアプリケーションのロード時間や応答時間とユーザの反応の関係から最適な時間の目安を紹介している

目標はユーザの満足度を向上させることで、処理速度の向上ではない。

## Script Evaluation

https://web.dev/articles/script-evaluation-and-long-tasks?hl=ja

Script Evaluation とは、ブラウザが JavaScript ファイルをバイトコードにコンパイルする前にファイルを評価する処理のことである。

ブラウザが JavaScript を Just-In-Time でコンパイルするため実行時でも常に JavaScript を評価する。

この読み取り処理が重ければ当然その間メインスレッドがブロックされる。

- Total Blocking Time: ページ読み込み時にスクリプト評価が過剰に発生しないかどうか調べるための指標

https://web.dev/articles/tbt?hl=ja

- スクリプト評価のためにディスパッチされるタスクの数は`<script>`要素の数と直接関係がある

ディスパッチの数は少ない程よいが、ディスパッチが一回で済むにしてもスクリプトが巨大であれば話は異なる

**個々のスクリプトサイズは 100kb を目安にするべき**

- `<script>`は type=module なのか否かでスクリプト評価タスクがどのように開始されるかは異なる

- ページ読み込み時に読み込む JavaScript は可能な限り最小限に抑えるべき。もしくはメインスレッドをブロックしない程度にスクリプトを分割する。

> 現在のところ、Chromium ベースのブラウザでは、defer 属性を使用して読み込まれたすべてのスクリプトが、DOMContentLoaded イベントと同じタスクで実行されます。これにより、全体的なレイアウト作業は最小限に抑えられますが、コストが高くなり、タスクが長くなる可能性が高くなり、他のパフォーマンスの問題を引き起こす可能性があります。

本アプリケーションは index.html がバンドル後 script を defer 属性をつけて読み込むようになっている

- webworker でスクリプトを読み込めば webworker を登録するコード自体はメインスレッドで実行されるが、webworker 内のコードは別スレッドで実行されるためメインスレッドの処理の集中が軽減される

疑問：では Webpack で複数ファイルをバンドルするとき、ファイルは大きくなりすぎないようにある程度のサイズで分割するべきなのか？

トレードオフと考慮事項

スクリプトを複数の小さなファイルに分割することで、評価時間を短くすることができるが、スクリプトを分割するにあたって気を付けるべきこと。

- 圧縮効率は、ファイルサイズが小さいファイルになるほど下がり、サイズが大きいファイルであるほど高まる。バランスが大事。

まとめ：

type=module 属性を指定せずに `<script>` 要素を使用してスクリプトを読み込む場合は、非常に大きなスクリプトを読み込まないでください。そのようなスクリプトを使用すると、メインスレッドをブロックする、リソースを大量に消費するスクリプト評価タスクが開始されます。この作業を分割するために、スクリプトをより多くの `<script>` 要素に分散させます。

type=module 属性を使用してブラウザで ES モジュールをネイティブに読み込むと、個々のモジュール スクリプトごとに、評価対象の個々のタスクが開始されます。

動的な import() 呼び出しを使用して、初期バンドルのサイズを小さくします。これはバンドラでも機能します。バンドラは動的にインポートされた各モジュールを「スプリット ポイント」として扱い、動的にインポートされたモジュールごとに別々のスクリプトを生成します。

圧縮効率やキャッシュの無効化などのトレードオフを必ず比較検討してください。スクリプトが大きいほど圧縮率は高くなりますが、より少ないタスクで高コストのスクリプト評価作業が必要になり、ブラウザ キャッシュの無効化が発生し、全体的にキャッシュ効率が低下します。

ES モジュールをバンドルせずにネイティブに使用する場合は、modulepreload リソースヒントを使用して起動中の読み込みを最適化します。
通常どおり、できる限り JavaScript の提供は最小限に留めてください。

NOTE: 上記の理想を webpack で実現するにはどうしたらいいだろうか？

## React パフォーマンス改善基礎

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

loadFunction は Promise を返す関数でなくてはならない。

ローディングの際に resolve されるまで待機する。

reject されたらもっとも近い場所のエラーバウンダリでエラーをキャッチする

通常の`import`文でモジュールをインポートする場合と異なるのは、

`import`文でインポートするときは、その import 分を含んでいるモジュールが読み込まれたときであるのに対して、

`lazy + import()`でインポートする場合はその`import()`でインポートするモジュールを初めてレンダリングする段階で読み込む

という点である。

レンダリングされる段階で初めて読み込み開始されるとのことだけど、

レンダリング -> 読み込み（非同期）-> lazy()の解決 -> そのコンポーネントのレンダリング

という段階を踏むことになるけれど、「読み込み」「解決」の間はレンダリングプロセス中ということでいいのかしら？

しかし読み込みは非同期なので同期的な処理が一度は完了しているはずなので、

非同期読み込みが完了するまでの間動的コンポーネントをどう扱っているのか？null なのか？

--> 単純に存在しないだけである。

#### 通常 import で取得したコンポーネントと同時にレンダリングするなら lazy 読み取りする意味はないか？

### 参考

https://github.com/expo/snack/blob/15cac8943ef75066fd5d4d4cd5201465412c4537/website/src/client/components/EditorView.tsx#L36

## Profiler

https://react.dev/reference/react/Profiler

https://gist.github.com/bvaughn/25e6233aeb1b4f0cdb8d8366e54a3977

https://www.dhiwise.com/post/how-to-optimize-react-app-performance-with-webpack-5

## [Webpack] TODO: Setting for Production mode bundling

https://webpack.js.org/guides/production/

Production 用の webpack config を作りなさいと。

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

## 計測方法

## Chrome Dev Tools Performance

「ボトルネックは推測するな計測せよ」

https://web.dev/articles/rail?hl=ja#chrome_devtools

google の中の人による UX に関してパフォーマンスを計測する大まかな方法の記事。

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

#### 参考になりそうな記事

[google 公式の dev tools 解説](https://developer.chrome.com/docs/devtools/performance/reference)

https://zenn.dev/koki_tech/articles/9deb70d0a9befb

https://qiita.com/teradonburi/items/5b8f79d26e1b319ac44f

https://calibreapp.com/blog/react-performance-profiling-optimization

#### Call Tree

https://developer.chrome.com/docs/devtools/performance/reference#call-tree

Chrome Dev Tools Performance の Call Tree タブについて

CallTree タブは任にの選択期間のアクティビティを表示する

- self time: そのアクティビティの経過時間
- total time:

## Webpack 設定

#### copilot にバンドル JavaScript ファイルは小さく分割できるか聞いてみた

To keep your JavaScript file size under 100KB when using webpack, you can use several strategies:

1. **Code Splitting**: This is a feature of webpack that allows you to split your code into various bundles which can then be loaded on demand or in parallel. It can be used to achieve smaller bundles and control resource load prioritization which, if used correctly, can have a major impact on load time.

```javascript
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

2. **Minification**: Webpack uses `TerserPlugin` by default to minify the output files.

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  //...
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
```

3. **Tree Shaking**: Webpack allows you to eliminate dead code paths, resulting in smaller bundle sizes. It depends on the use of ES2015 module syntax (`import` and `export`).

```javascript
module.exports = {
  //...
  optimization: {
    usedExports: true,
  },
};
```

4. **Scope Hoisting**: Webpack can avoid function wrapping around modules to concatenate the scope of all your modules into one closure and allow for your code to have a faster execution time in the browser.

```javascript
module.exports = {
  //...
  optimization: {
    concatenateModules: true,
  },
};
```

5. **Ignoring unused modules with IgnorePlugin**: If there are libraries or modules that you are sure you're not using, you can ignore them using the `IgnorePlugin`.

```javascript
const webpack = require('webpack');

module.exports = {
  //...
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
};
```

Remember, it's important to regularly check the size of your output files to ensure they stay within reasonable limits. You can use tools like `webpack-bundle-analyzer` for this. Also, consider setting performance budgets in your `webpack.config.js` to warn you when your bundles exceed certain sizes.

```javascript
module.exports = {
  //...
  performance: {
    maxAssetSize: 100000,
    maxEntrypointSize: 100000,
    hints: 'warning',
  },
};
```

These are just a few strategies to help manage your bundle sizes with webpack. Depending on your specific use case, some methods may be more effective than others. It's always a good idea to understand what each of these techniques does and how it affects your code.

## code splitting

https://webpack.js.org/guides/code-splitting/

> この機能を使用すると、コードをさまざまなバンドルに分割し、オンデマンドまたは並行してロードできるようになります。これを使用すると、より小さなバンドルを実現し、リソース負荷の優先順位付けを制御できます。正しく使用すると、負荷時間に大きな影響を与える可能性があります。

- entry point で明示的にファイルを分割する
- `SplitChunkPlugin`を使ってチャンクの重複を排除する
- 動的 import を使う

#### 手動で entry point ファイルを分割する

entry point でファイル分割するといってもどういう区別にもとづいて分割すればいいのかしら?

手動の分割による ptifall:

- もしも分割したファイル同士で重複する依存関係などあればそれらは両方のファイルにバンドルされる
- 柔軟性が低く、コア アプリケーション ロジックでコードを動的に分割するために使用することはできません。

#### 重複の防止

`dependsOn`オプションはチャンク同士でモジュールを共有させることができる

なので先の手動分割によって分けられたチャンク（ファイル）両者が同じ依存関係を持っていても両方のバンドルに同じものを含めることがなくなり両者で共有されるようにしてくれる

#### `dependsOn` オプション

チャンク間で共通する依存関係を重複しないようにバンドルさせる設定。

https://webpack.js.org/configuration/entry-context/#dependencies

> デフォルトでは、各エントリチャンクは、そのエントリが使用するすべてのモジュールを保存します。dependOn オプションを使うと、あるエントリーチャンクから別のエントリーチャンクへモジュールを共有することができます：

たとえば index.bundle.js にも index.worker.bundle.js にも typescript が依存関係になっていたら、両者の共有モジュールとして生成してくれるのかしら？

#### `runtimeChunk: 'single'`

https://bundlers.tooling.report/code-splitting/multi-entry/

モジュールの**インスタンス**を複製しないようにするための設定。

チャンクを分割して、しかし両者が同じモジュールを依存関係とするとき、同じモジュールのインスタンスが複数存在することになり、それぞれの状態が同期されなくなる可能性がある

`runtimeChunk: 'single'`を設定することでインスタンスの複製を防止することができる

この設定はチャンク間の同一依存関係がそれぞれにバンドルされることは防げない。インスタンスの複製のみ防止する。

(なのでバンドルの重複を防止する場合は`dependsOn`設定を設けること)

...ということで、エントリーポイントを分割する場合、依存関係が重複していないか、重複するモジュールのインスタンスが複数にならないか気を付けて設定しなくてはならない。

本アプリケーションでは index.bundle.js と各 worker のバンドルファイルを分割しているのみである。

なので worker と index.bundle.js で重複する部分を見つける必要がある。

TODO: チャンクの重複項目の洗い出し

#### `splitChunks`

> SplitChunksPlugin を使うと、共通の依存関係を既存のエントリー・チャンクや全く新しいチャンクに抽出することができます。

optimization.splitChunks コンフィギュレーションオプションを設定すると、index.bundle.js と another.bundle.js から重複した依存関係が取り除かれます。プラグインは、lodash を別のチャンクに分離して、メインのバンドルから重荷を取り除いたことに気づくはずだ。

https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks

中の人より、よくわからんなら`all`にしておけとのこと。

https://github.com/webpack/webpack/discussions/18040

#### splitChunks, runtimeChunk, dependsOn 違い

copilot 曰く：

webpack の`optimization.splitChunks`設定は、コードを様々なバンドルに分割し、オンデマンドまたは並列にロードするために使用されます。これは `runtimeChunk` と `dependsOn` の設定とは独立しています。

- runtimeChunk\*\*： このオプションは、ランタイムのみを含む追加のチャンクを各エントリーポイントに追加するように webpack に指示します。single`（すべてのチャンクに対して単一のランタイムバンドルを作成する）または `multiple`（エントリポイントごとにランタイムファイルを作成する）に設定できます。これは、複数のエントリーポイントがあり、エントリーポイント間で分割されるコードの重複を最小限にしたい場合に便利です。

- dependsOn\*\*： このオプションで、このチャンクが依存するチャンクを指定できます。これは特定の順番でロードする必要があるチャンクがある場合に便利です。

つまり、`optimization.splitChunks` を有効にすることで、バンドルのサイズを管理することができますが、`runtimeChunk` と `dependsOn` のどちらを使うべきかは、プロジェクト固有の要件に依存します。これらはそれぞれ異なる目的を果たすものであり、ニーズに応じて独立して使用することも、一緒に使用することもできます。これらの設定がそれぞれ何をするのか、そしてそれがあなたのコードにどのような影響を与えるのかを理解することは、常に良いアイデアです。よくわからない場合は、さまざまな設定を試してみて、ビルドにどのような影響があるかを確認するとよいだろう。目標は、パフォーマンスと保守性の両方を最適化することであることを忘れないでください。

## Optimization

https://webpack.js.org/configuration/optimization/

#### minimize

minimizer を指定したいときに true にする

#### minimizer

コードの最小化をするためのプラグインを指定する

TerserPlugin を使う意義

TerserPlugin は、JavaScript ファイルを最小化するために webpack で使用されます。最小化とは、ブラウザによるリソースの処理に影響を与えることなく、不要なデータや冗長なデータを削除することです。これには、空白やコメントの削除、変数名を 1 文字に短縮することなどが含まれます。

以下は TerserPlugin を使用する場合のシナリオです：

本番環境：本番環境では、コードを可能な限り効率的かつ高速にしたいものです。JavaScript ファイルを最小化することで、ファイルサイズが小さくなり、ダウンロード時間が短縮され、帯域幅の使用量も少なくなります。
解析時間の最適化: 最小化されたコードは、JavaScript エンジンの解析にかかる時間も短縮し、インタラクティブになるまでの時間を短縮します。
コンソールログの削除： 本番ビルドでコンソールログを削除したい場合、TerserPlugin を設定することができます。

ミニフィケーションはパフォーマンスに大きなメリットをもたらしますが、実行されるコードがあなたが書いたコードと同じではないため、デバッグが難しくなる可能性もあることを覚えておいてください。そのため、通常は本番環境でしか使わない。開発環境では、通常、デバッグを支援するために最小化のステップをスキップします。

また、webpack 4 以降、TerserPlugin は本番環境用に最初から含まれているので、カスタム設定が必要な場合を除き、手動で設定する必要はありません。

設定すればコード中の console.log を削除してくれるようだ。また、このプラグインはデフォルトになっているみたいなので特別 terserplugin でカスタム設定を施すのではないならわざわざ明示する必要はないみたい

## Tree Shaking

https://webpack.js.org/guides/tree-shaking/

ツリー・シェイキングとは、デッドコード（どこからも参照されていない、使われていないコード）を排除することをいう。

webpack のバンドル対象のファイルすべてが ESM 記法の`import`, `export`を採用している場合、webpack でツリーしぇいキングを行うことができる

tree-shaking を実施するにあたって注意すること：

- webpack のバンドル対象ファイルがすべて ESM 記法であるかどうか
- sideEffects に当たるファイルが含まれる場合、package.json に指定したかどうか

#### SideEffects

> 1 つ以上のエクスポートを公開する以外に、インポートされたときに特別な動作を行うコードとして定義される。この例として、ポリフィルが挙げられます。ポリフィルはグローバルスコープに影響し、通常はエクスポートを提供しません。

> インポートされたファイルはすべて、ツリーの揺れの影響を受けることに注意してください。つまり、プロジェクトで css-loader のようなものを使って CSS ファイルをインポートする場合、本番モードで意図せずドロップされないように、副作用リストに追加する必要があります

####

#### webpack.prod.js の作成

webpack.prod.js

```JavaScript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    // entry pointはそのまま
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
});
```

伴って：

```diff JSON
{
    "name": "sandbox-editor",
    "scripts": {
-       "start": "node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js",
-       "build": "NODE_ENV='production' node ./node_modules/webpack/bin/webpack.js --progress"
+       "start": "node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --config webpack.dev.js",
+       "build": "NODE_ENV='production' node ./node_modules/webpack/bin/webpack.js --progress --config webpack.prod.js"
    },
    "dependencies": {
    },
    "devDependencies": {
    }
}

```

#### [Bug] webpack5 terserpluginkilled 

What I got:

```bash
$ npm run build

> build
> NODE_ENV='production' node ./node_modules/webpack/bin/webpack.js --progress --config webpack.prod.js

92% sealing asset processing TerserPluginKilled
$ 
```

terserpluginの段階になったら処理がハングして自動的にタスク切るされたっぽい

https://stackoverflow.com/questions/66343602/use-latest-terser-webpack-plugin-with-webpack5



## 計測

計測結果のメモ

#### Performance 計測手順

1. production mode でコンパイルすること。本番環境で計測すること。
2. `dist/index.html`をブラウザで開く
3. chrome dev tools の Performance タブでリロードする

TODO: `webpack.prod.js`がまだ production モード用に作り直していない。

#### ローディング完了までの計測内容

NOTE:個々の情報はデベロップモードで webpack dev server でアプリケーションを実行しているときに計測した情報で、production モードではない！！

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
内、getModelByPath.ts の占める割合は 45.4%で、その原因が monaco-editor のコンパイル
fetchLibs.worker.bundle.js:9.7%
内、依存関係である typescript の読み取りに 6.5%でほぼこれが原因
なんだか別のところで Semver が時間かかっているように見えたけれど、これは 0.4%で無視していい

getModelByPath.ts の読取は MonacoEditor.tsx の前に実行されるので実質ここで monaco-editor が読み取られる

とはいえ結局 monaco-editor のコンパイルはしなくてはならないわけで、遅いか速いかの違いでしかないと思う

実際`getModelByPath`は型の参照しかしていない

#### 20240517

ユーザが満足に操作できるまで24秒かかっている

Summary:

total: 23890ms
loading: 75ms
scripting: 15480ms
rendering: 893ms
system: 4822ms

メルカリの記事によれば、`Disable JavaScript sample`項目のチェックを外してパフォーマンスを計測すると計測処理の負荷が大きくなるので実態に合わない計測結果になりがちとのこと

何をすればいいのかわからん。とにかくscriptingが主にローディングのほとんどを占める

動的importをためす


## 参考

https://developer.mozilla.org/ja/docs/Web/Performance

https://engineering.mercari.com/blog/entry/2018-12-12-090156/

https://gihyo.jp/book/2017/978-4-7741-9400-4



## Chrome Dev Tools Performance

#### Capture Setting: `Disable JavaScript Samples`

https://developer.chrome.com/docs/devtools/performance/reference#disable-js-samples

通常メイントラックにレコード中に呼び出されたJavaScriptファイルはそのコールスタックが記録されるようになっている。

`Disable JavaScript Samples`の有効化はそのJSファイルのコールスタックを無効にするものである

つまり、レコードの負荷軽減とJSfile抜きの時の挙動を知りたいときに使うやつである。

これを有効にして却ってローディングが長くなったということは考えられないはず...


## Dynamic Import

#### 参考

snack expoのclientでは、previewとeditor以外のローディング、editorのローディング、previewのローディングという流れみたい

#### 実装

エディタ部分を動的importする

レイアウトを崩さない、かつmonaco-editorに関する部分を動的にimportする



## マウント時バンドルの実行



## EditorContainer.tsxのローディング中のfallbackアニメーションがフリーズする件

ここでｱﾆﾒｰｼｮﾝしてくれないんじゃぁどうしようもないなぁ

#### 参考

- useTransitionを使う

https://zenn.dev/kobayang/articles/8e06c77cec9359

## 初期マウント時にバンドル処理

現状:

onChangeイベント時にバンドル処理が初めて始まる

```sequence
MonacoEditor.tsx -> EditorContainer.tsx: _onEditorContentChange
_onEditorContentChange -> this._debouncedBundle -> this._onBundle
-> this._bundleWorker.postMessage()

' worker bundles and send back

onMessage event -> this._onBundled -> this.props.dispatchBundledCode
```

なのでマウント時にはバンドル処理が始まらない

これを修正する

#### バンドル処理のトリガー

どのタイミングでバンドル処理をリクエストするか？

初期マウント時にどっかぶりだと処理が重くなる

現状、初期マウント完了 -> lazyloadでEditorContainer.tsxというローディングの順番なので

componentDidMountでthis.props.onEditorContentChange(selected file code)を呼び出す

問題はこの処理は本来はeditorchangeではないためどのファイルを選択するかである



## Redux利用検討


#### React Redux vs Context

https://www.reddit.com/r/reactjs/comments/z4y7sj/redux_vs_context_what_exactly_does_redux/

> In addition, there are some distinct differences between how Context and (React-)Redux pass along updates. Context has some major perf limitations - in particular, any component that consumes a context will be forced to re-render, even if it only cares about part of the context value.

> さらに、Contextと（React-）Reduxの更新の受け渡し方法には明確な違いがある。特に、コンテキストを消費するコンポーネントは、たとえそれがコンテキスト値の一部しか気にしていなくても、再レンダリングを余儀なくされる。

https://blog.isquaredsoftware.com/2021/01/context-redux-differences/

react contextはデータをreactコンポーネント・ツリーの任意の場所へ渡す一つの方法であってstate管理をする手段ではない

useReducerはReduxと似ている部分があるものの、機能には大きな違いがある

いつReduxを使うべき？

- 巨大なアプリケーションで再レンダリング頻度が高いとき
- stateを更新するロジックが複雑な時
- 副作用、永続性、データのシリアル化を管理するための、より強力な機能が必要なとき

contextについて

contextからの新しい値が渡されるたびに、contextを消費するコンポーネントはすべて必ず再レンダリングされる

react contextを使う目的は`"prop-drilling"`を避けることである

Reduxについて

- state管理に特化するライブラリである
- Redux が提供するパターンとツールを使用すると、アプリケーションの状態がいつ、どこで、なぜ、どのように更新されるのか、また、それらの変更が発生したときにアプリケーション ロジックがどのように動作するのかを理解しやすくなります。

ことReactとの連携においては、

あるイベントが発生したときに、どのようにstateが更新・決定されるのかのロジックを分離できる点がメリットである

redux devtools等を使うとどのようにstateが更新されたのか追跡が容易になる

context + useReducerとRedux + React-Reduxのちがいについて

> Context + useReducer は、Context を介して現在の状態値を渡すことに依存します。 React-Redux は、現在の Redux ストア インスタンスを Context 経由で渡します。

> つまり、useReducer が新しい状態値を生成すると、そのコンテキストにサブスクライブされているすべてのコンポーネントは、データの一部のみを考慮している場合でも、強制的に再レン​​ダリングされます。これにより、状態値のサイズ、そのデータにサブスクライブされているコンポーネントの数、再レンダリングの頻度によっては、パフォーマンスの問題が発生する可能性があります。 React-Redux を使用すると、コンポーネントはストア状態の特定の部分をサブスクライブし、それらの値が変更された場合にのみ再レンダリングできます。

> DevTools では、現在のコンテキスト値を表示できますが、過去の値や時間の経過に伴う変化は表示できません。 Redux DevTools を使用すると、ディスパッチされたすべてのアクション、各アクションの内容、各アクションが処理された後の状態、および時間の経過に伴う各状態間の差分を確認できます。

> useReducer にはミドルウェアがありません。

**"サブスクライブされているすべてのコンポーネント"の意味**:

[公式の記述より](https://legacy.reactjs.org/docs/context.html#contextprovider)

`consuming provider`: `<MyContext.Provider></MyContext.Provider>`で挟まれたコンポーネント

つまり、以下のようなコードでたとえ実際にMyContextからの値を必要とするのが`CounterA`と`CounterB`だけであっても、HogeもFugaもすべてMyContextで囲われたコンポーネントはすべて再レンダリングされる

HogeやFugaが`useMyContext`で実際に値を取得していなくてもそれらはMyContextの更新で強制的に再レンダリングされるということ。

```TypeScript
import MyContext from "./contexts/MyContext";

const SomeComponent = () => {
  return (
    <MyContext.Provider>
      <CounterA />
      <Hoge />
      <Fuga />
      <CounterB />
    </MyContext.Provider>
  )
}
```

ここまで聞くと、contextの使いどころが見えてくる

つまりcontext（context + useReducer）は**更新頻度が低いstateの値**をコンポーネントネストの任意のコンポーネントに渡す場合に利用するのが適しているということである

理由はcontextのproviderで挟まれたすべてのコンポーネント（サブスクライバ）はcontextの値を実際に利用しようがしまいがcontextの更新によって強制的に再レンダリングされるからである

これら余計な再レンダリングを防ぐためにどくじにReact.memo()機能やuseMemo()を工夫して使うことで実現しようとすることもできるが、それはReduxの再発名（しかもひどく劣化した）でしかなくなってしまう。

それぞれのツールの使いどころ：

- React context: ネストされたコンポーネントにprop-drillingせずに値を渡したいときに使う。ただしサブスクライバはすべてcontextの更新で強制的に再レンダリングされる。

- useReducer + context: 複雑なstate管理とネストされたコンポーネントにprop-drillingせずに値を渡したいときに使う。ただしサブスクライバはすべてcontextの更新で強制的に再レンダリングされる。

- Redux:

> - リデューサー関数を使用した中程度から非常に複雑な状態管理 時間の経過とともに状態がいつ、なぜ、どのように変化したかを追跡可能 
> - 状態管理ロジックを UI レイヤーから完全に分離して作成したい 
> - 異なる UI レイヤー間で状態管理ロジックを共有する Redux ミドルウェアの機能を使用して、アクションがディスパッチされるときに追加のロジックを追加する 
> - Redux 状態の一部を永続化できること 開発者が再現できるバグレポートを有効にする 開発中のロジックと UI のデバッグを高速化



## React Contextはサブスクライバをいつ再レンダリングさせるのか

