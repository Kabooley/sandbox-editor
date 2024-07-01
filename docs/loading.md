# ローディングにかかわる機能

`feat/loading`ブランチ

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

- [走り書き](#走り書き)

## TODOs

- TODO: webpack5 における Profiler 用の設定とは？
- TODO: [初期マウント時にバンドル処理](#初期マウント時にバンドル処理)
- TODO: `webpack.prod.js`を production モード用に作り直す

- TODO: NOTE: `useLoadingSurvey`というコンポーネント呼出の為のフックを各コンポーネントに追加しているのでこれの削除

- TODO: [EditorContainer.tsxのローディング中のfallbackアニメーションがフリーズする件](#EditorContainer.tsxのローディング中のfallbackアニメーションがフリーズする件)

- TODO: PixelLoading.cssをsassに移動すること

- TODO: [performance] classコンポーネントをPureComponentに変更するか検討

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


## 走り書き

editor, explorer, previewなどMainContainer内部のコンポーネントを動的ローディングするようにする

- 3つローディングが完了したら一気に表示するようにする。それまではローディング画面。


```html
<div class="vscode-sidebar" style="width: 240px; height: 100%;">
  <!-- ここから人セクション -->
  <div style="height: 24px; top: 0px; width: 240px;">
    <!-- Resizable -->
    <div class="section custom-box box react-resizable" style="height: 100%; overflow-y: hidden;">
      <div class="stack">
      <div class="pane-header">
        <div class="codicon">
          <img src="http://localhost:8080/a125af57a216bc4918ec.svg" alt="">
        </div>
        <h3>open editor</h3>
        <div class="actions">
          <!-- actions -->
        </div>
      </div>
      <div class="collapsible collapse">
        <div class="scrollable-element__container" style="width: 240px; height: 72.75px; position: relative; overflow: hidden;">
          <div class="scrollable-element__scrollable" style="position: absolute; top: 0px; left: 0px;">
            <div class="stack-body-list" style="width: 240px;">
              <div class="stack-body-list__item open-editor">
                <div class="indent" style="padding-left: 1.6rem;"></div>
                  <div class="actions always-appear">
                    <div class="actions-bar">
                      <ul class="actions-container">
                        <li class="action-item"><img class="codicon" src="http://localhost:8080/8c7fb24a1d94a7146906.svg" alt="" title=""></li></ul>
                    </div>
                  </div>
                  <div class="codicon">
                    <svg viewBox="0 0 24 24" aria-labelledby="icon_labelledby_58" style="width: 16px; height: 16px;">
                    <title id="icon_labelledby_58">react</title><path></path></svg>
                  </div>
                  <h3 class="item-label">App.tsx</h3>
                  <span>src/App.tsx</span>
                </div>
              </div>
            </div>
          </div></div></div><span></span></div></div><div style="height: 24px; top: 24px; width: 240px;"><div class="section custom-box box react-resizable" style="height: 100%; overflow-y: hidden;"><div class="stack"><div class="pane-header"><div class="codicon"><img src="http://localhost:8080/a125af57a216bc4918ec.svg" alt=""></div><h3>virtual folder</h3><div class="actions"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/fafb0c26a9b188367899.svg" alt="New file..." title="New file..."></li><li class="action-item"><img class="codicon" src="http://localhost:8080/6b9f7203e4f665fad191.svg" alt="New folder..." title="New folder..."></li></ul></div></div></div><div class="collapsible collapse"><div class="scrollable-element__container" style="width: 240px; height: 330.75px; position: relative; overflow: hidden;"><div class="scrollable-element__scrollable" style="position: absolute; top: 0px; left: 0px;"><div class="stack-body-list" style="width: 240px;"><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 1.6rem;"></div><div class="codicon"><img src="http://localhost:8080/a125af57a216bc4918ec.svg"></div><h3 class="item-label">public</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/fafb0c26a9b188367899.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/6b9f7203e4f665fad191.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div><div style="display: none;"><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 3.2rem;"></div><div class="codicon"><svg viewBox="0 0 24 24" aria-labelledby="icon_labelledby_60" style="width: 16px; height: 16px;"><title id="icon_labelledby_60">html5</title><path d="M12,17.56L16.07,16.43L16.62,10.33H9.38L9.2,8.3H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56M4.07,3H19.93L18.5,19.2L12,21L5.5,19.2L4.07,3Z" style="fill: rgb(228, 77, 38);"></path></svg></div><h3 class="item-label">index.html</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div></div></div></div><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 1.6rem;"></div><div class="codicon"><img src="http://localhost:8080/a125af57a216bc4918ec.svg"></div><h3 class="item-label">soMuchLongDirectoryName</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/fafb0c26a9b188367899.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/6b9f7203e4f665fad191.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div><div style="display: none;"><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 3.2rem;"></div><div class="codicon"><svg viewBox="0 0 24 24" aria-labelledby="icon_labelledby_62" style="width: 16px; height: 16px;"><title id="icon_labelledby_62">file</title><path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" style="fill: currentcolor;"></path></svg></div><h3 class="item-label">superUltraHyperTooLongBaddaaasssssFile.txt</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div></div></div></div><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 1.6rem;"></div><div class="codicon"><img src="http://localhost:8080/a125af57a216bc4918ec.svg"></div><h3 class="item-label">src</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/fafb0c26a9b188367899.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/6b9f7203e4f665fad191.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div><div style="display: none;"><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 3.2rem;"></div><div class="codicon"><svg viewBox="0 0 24 24" aria-labelledby="icon_labelledby_64" style="width: 16px; height: 16px;"><title id="icon_labelledby_64">react</title><path d="M12,10.11C13.03,10.11 13.87,10.95 13.87,12C13.87,13 13.03,13.85 12,13.85C10.97,13.85 10.13,13 10.13,12C10.13,10.95 10.97,10.11 12,10.11M7.37,20C8,20.38 9.38,19.8 10.97,18.3C10.45,17.71 9.94,17.07 9.46,16.4C8.64,16.32 7.83,16.2 7.06,16.04C6.55,18.18 6.74,19.65 7.37,20M8.08,14.26L7.79,13.75C7.68,14.04 7.57,14.33 7.5,14.61C7.77,14.67 8.07,14.72 8.38,14.77C8.28,14.6 8.18,14.43 8.08,14.26M14.62,13.5L15.43,12L14.62,10.5C14.32,9.97 14,9.5 13.71,9.03C13.17,9 12.6,9 12,9C11.4,9 10.83,9 10.29,9.03C10,9.5 9.68,9.97 9.38,10.5L8.57,12L9.38,13.5C9.68,14.03 10,14.5 10.29,14.97C10.83,15 11.4,15 12,15C12.6,15 13.17,15 13.71,14.97C14,14.5 14.32,14.03 14.62,13.5M12,6.78C11.81,7 11.61,7.23 11.41,7.5C11.61,7.5 11.8,7.5 12,7.5C12.2,7.5 12.39,7.5 12.59,7.5C12.39,7.23 12.19,7 12,6.78M12,17.22C12.19,17 12.39,16.77 12.59,16.5C12.39,16.5 12.2,16.5 12,16.5C11.8,16.5 11.61,16.5 11.41,16.5C11.61,16.77 11.81,17 12,17.22M16.62,4C16,3.62 14.62,4.2 13.03,5.7C13.55,6.29 14.06,6.93 14.54,7.6C15.36,7.68 16.17,7.8 16.94,7.96C17.45,5.82 17.26,4.35 16.62,4M15.92,9.74L16.21,10.25C16.32,9.96 16.43,9.67 16.5,9.39C16.23,9.33 15.93,9.28 15.62,9.23C15.72,9.4 15.82,9.57 15.92,9.74M17.37,2.69C18.84,3.53 19,5.74 18.38,8.32C20.92,9.07 22.75,10.31 22.75,12C22.75,13.69 20.92,14.93 18.38,15.68C19,18.26 18.84,20.47 17.37,21.31C15.91,22.15 13.92,21.19 12,19.36C10.08,21.19 8.09,22.15 6.62,21.31C5.16,20.47 5,18.26 5.62,15.68C3.08,14.93 1.25,13.69 1.25,12C1.25,10.31 3.08,9.07 5.62,8.32C5,5.74 5.16,3.53 6.62,2.69C8.09,1.85 10.08,2.81 12,4.64C13.92,2.81 15.91,1.85 17.37,2.69M17.08,12C17.42,12.75 17.72,13.5 17.97,14.26C20.07,13.63 21.25,12.73 21.25,12C21.25,11.27 20.07,10.37 17.97,9.74C17.72,10.5 17.42,11.25 17.08,12M6.92,12C6.58,11.25 6.28,10.5 6.03,9.74C3.93,10.37 2.75,11.27 2.75,12C2.75,12.73 3.93,13.63 6.03,14.26C6.28,13.5 6.58,12.75 6.92,12M15.92,14.26C15.82,14.43 15.72,14.6 15.62,14.77C15.93,14.72 16.23,14.67 16.5,14.61C16.43,14.33 16.32,14.04 16.21,13.75L15.92,14.26M13.03,18.3C14.62,19.8 16,20.38 16.62,20C17.26,19.65 17.45,18.18 16.94,16.04C16.17,16.2 15.36,16.32 14.54,16.4C14.06,17.07 13.55,17.71 13.03,18.3M8.08,9.74C8.18,9.57 8.28,9.4 8.38,9.23C8.07,9.28 7.77,9.33 7.5,9.39C7.57,9.67 7.68,9.96 7.79,10.25L8.08,9.74M10.97,5.7C9.38,4.2 8,3.62 7.37,4C6.74,4.35 6.55,5.82 7.06,7.96C7.83,7.8 8.64,7.68 9.46,7.6C9.94,6.93 10.45,6.29 10.97,5.7Z" style="fill: rgb(0, 188, 212);"></path></svg></div><h3 class="item-label">App.tsx</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div></div><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 3.2rem;"></div><div class="codicon"><svg viewBox="0 0 24 24" aria-labelledby="icon_labelledby_66" style="width: 16px; height: 16px;"><title id="icon_labelledby_66">react</title><path d="M12,10.11C13.03,10.11 13.87,10.95 13.87,12C13.87,13 13.03,13.85 12,13.85C10.97,13.85 10.13,13 10.13,12C10.13,10.95 10.97,10.11 12,10.11M7.37,20C8,20.38 9.38,19.8 10.97,18.3C10.45,17.71 9.94,17.07 9.46,16.4C8.64,16.32 7.83,16.2 7.06,16.04C6.55,18.18 6.74,19.65 7.37,20M8.08,14.26L7.79,13.75C7.68,14.04 7.57,14.33 7.5,14.61C7.77,14.67 8.07,14.72 8.38,14.77C8.28,14.6 8.18,14.43 8.08,14.26M14.62,13.5L15.43,12L14.62,10.5C14.32,9.97 14,9.5 13.71,9.03C13.17,9 12.6,9 12,9C11.4,9 10.83,9 10.29,9.03C10,9.5 9.68,9.97 9.38,10.5L8.57,12L9.38,13.5C9.68,14.03 10,14.5 10.29,14.97C10.83,15 11.4,15 12,15C12.6,15 13.17,15 13.71,14.97C14,14.5 14.32,14.03 14.62,13.5M12,6.78C11.81,7 11.61,7.23 11.41,7.5C11.61,7.5 11.8,7.5 12,7.5C12.2,7.5 12.39,7.5 12.59,7.5C12.39,7.23 12.19,7 12,6.78M12,17.22C12.19,17 12.39,16.77 12.59,16.5C12.39,16.5 12.2,16.5 12,16.5C11.8,16.5 11.61,16.5 11.41,16.5C11.61,16.77 11.81,17 12,17.22M16.62,4C16,3.62 14.62,4.2 13.03,5.7C13.55,6.29 14.06,6.93 14.54,7.6C15.36,7.68 16.17,7.8 16.94,7.96C17.45,5.82 17.26,4.35 16.62,4M15.92,9.74L16.21,10.25C16.32,9.96 16.43,9.67 16.5,9.39C16.23,9.33 15.93,9.28 15.62,9.23C15.72,9.4 15.82,9.57 15.92,9.74M17.37,2.69C18.84,3.53 19,5.74 18.38,8.32C20.92,9.07 22.75,10.31 22.75,12C22.75,13.69 20.92,14.93 18.38,15.68C19,18.26 18.84,20.47 17.37,21.31C15.91,22.15 13.92,21.19 12,19.36C10.08,21.19 8.09,22.15 6.62,21.31C5.16,20.47 5,18.26 5.62,15.68C3.08,14.93 1.25,13.69 1.25,12C1.25,10.31 3.08,9.07 5.62,8.32C5,5.74 5.16,3.53 6.62,2.69C8.09,1.85 10.08,2.81 12,4.64C13.92,2.81 15.91,1.85 17.37,2.69M17.08,12C17.42,12.75 17.72,13.5 17.97,14.26C20.07,13.63 21.25,12.73 21.25,12C21.25,11.27 20.07,10.37 17.97,9.74C17.72,10.5 17.42,11.25 17.08,12M6.92,12C6.58,11.25 6.28,10.5 6.03,9.74C3.93,10.37 2.75,11.27 2.75,12C2.75,12.73 3.93,13.63 6.03,14.26C6.28,13.5 6.58,12.75 6.92,12M15.92,14.26C15.82,14.43 15.72,14.6 15.62,14.77C15.93,14.72 16.23,14.67 16.5,14.61C16.43,14.33 16.32,14.04 16.21,13.75L15.92,14.26M13.03,18.3C14.62,19.8 16,20.38 16.62,20C17.26,19.65 17.45,18.18 16.94,16.04C16.17,16.2 15.36,16.32 14.54,16.4C14.06,17.07 13.55,17.71 13.03,18.3M8.08,9.74C8.18,9.57 8.28,9.4 8.38,9.23C8.07,9.28 7.77,9.33 7.5,9.39C7.57,9.67 7.68,9.96 7.79,10.25L8.08,9.74M10.97,5.7C9.38,4.2 8,3.62 7.37,4C6.74,4.35 6.55,5.82 7.06,7.96C7.83,7.8 8.64,7.68 9.46,7.6C9.94,6.93 10.45,6.29 10.97,5.7Z" style="fill: rgb(0, 188, 212);"></path></svg></div><h3 class="item-label">index.tsx</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div></div><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 3.2rem;"></div><div class="codicon"><svg viewBox="0 0 24 24" aria-labelledby="icon_labelledby_68" style="width: 16px; height: 16px;"><title id="icon_labelledby_68">css3</title><path d="M5,3L4.35,6.34H17.94L17.5,8.5H3.92L3.26,11.83H16.85L16.09,15.64L10.61,17.45L5.86,15.64L6.19,14H2.85L2.06,18L9.91,21L18.96,18L20.16,11.97L20.4,10.76L21.94,3H5Z" style="fill: rgb(66, 165, 245);"></path></svg></div><h3 class="item-label">styles.css</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div></div></div></div><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 1.6rem;"></div><div class="codicon"><svg viewBox="0 0 24 24" aria-labelledby="icon_labelledby_70" style="width: 16px; height: 16px;"><title id="icon_labelledby_70">json</title><path d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19M12,15A1,1 0 0,1 13,16A1,1 0 0,1 12,17A1,1 0 0,1 11,16A1,1 0 0,1 12,15M8,15A1,1 0 0,1 9,16A1,1 0 0,1 8,17A1,1 0 0,1 7,16A1,1 0 0,1 8,15M16,15A1,1 0 0,1 17,16A1,1 0 0,1 16,17A1,1 0 0,1 15,16A1,1 0 0,1 16,15Z" style="fill: rgb(146, 170, 93);"></path></svg></div><h3 class="item-label">package.json</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div></div><div><div draggable="true"><div class="stack-body-list__item virtual-folder"><div class="indent" style="padding-left: 1.6rem;"></div><div class="codicon"><svg viewBox="0 0 24 24" aria-labelledby="icon_labelledby_72" style="width: 16px; height: 16px;"><title id="icon_labelledby_72">json</title><path d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19M12,15A1,1 0 0,1 13,16A1,1 0 0,1 12,17A1,1 0 0,1 11,16A1,1 0 0,1 12,15M8,15A1,1 0 0,1 9,16A1,1 0 0,1 8,17A1,1 0 0,1 7,16A1,1 0 0,1 8,15M16,15A1,1 0 0,1 17,16A1,1 0 0,1 16,17A1,1 0 0,1 15,16A1,1 0 0,1 16,15Z" style="fill: rgb(146, 170, 93);"></path></svg></div><h3 class="item-label">tsconfig.json</h3><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="" title=""></li><li class="action-item"><img class="codicon" src="http://localhost:8080/89118687abc534bcb716.svg" alt="" title=""></li></ul></div></div></div></div></div></div></div></div></div></div><span></span></div></div><div style="height: 24px; top: 48px; width: 240px;"><div class="section custom-box box react-resizable" style="height: 100%; overflow-y: hidden;"><div class="stack"><div class="pane-header"><div class="codicon"><img src="http://localhost:8080/a125af57a216bc4918ec.svg" alt=""></div><h3>dependencies</h3><div class="actions"><div class="actions-bar"><ul class="actions-container"></ul></div></div></div><div class="collapsible collapse"><div class="scrollable-element__container" style="width: 240px; height: 72.75px; position: relative; overflow: hidden;"><div class="scrollable-element__scrollable" style="position: absolute; top: 0px; left: 0px;"><div class="stack-body-list" style="width: 240px;"><div class="dependency-input-form" title="fetch npm form" style="padding: 16px;"><form><label><input type="text" name="form" style="width: 100%; height: 28px; padding-left: 8px; padding-right: 8px; line-height: 16px; border: 1px solid rgb(52, 52, 52); border-radius: 4px; outline: none; background-color: rgb(52, 52, 52); color: white;"></label></form></div><div class="stack-body-list__item dependencies"><div class="indent" style="padding-left: 1.6rem;"></div><h3 class="item-label">@types/react</h3><span>18.0.25</span><div class="indent" style="padding-left: 1.6rem;"></div><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="Delete dependency permanently" title="Delete dependency permanently"></li></ul></div></div></div><div class="stack-body-list__item dependencies"><div class="indent" style="padding-left: 1.6rem;"></div><h3 class="item-label">@types/react-dom</h3><span>18.0.9</span><div class="indent" style="padding-left: 1.6rem;"></div><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="Delete dependency permanently" title="Delete dependency permanently"></li></ul></div></div></div><div class="stack-body-list__item dependencies"><div class="indent" style="padding-left: 1.6rem;"></div><h3 class="item-label">react</h3><span>18.2.0</span><div class="indent" style="padding-left: 1.6rem;"></div><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="Delete dependency permanently" title="Delete dependency permanently"></li></ul></div></div></div><div class="stack-body-list__item dependencies"><div class="indent" style="padding-left: 1.6rem;"></div><h3 class="item-label">react-dom</h3><span>18.2.0</span><div class="indent" style="padding-left: 1.6rem;"></div><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="Delete dependency permanently" title="Delete dependency permanently"></li></ul></div></div></div><div class="stack-body-list__item dependencies"><div class="indent" style="padding-left: 1.6rem;"></div><h3 class="item-label">react-scripts</h3><span>5.0.1</span><div class="indent" style="padding-left: 1.6rem;"></div><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="Delete dependency permanently" title="Delete dependency permanently"></li></ul></div></div></div><div class="stack-body-list__item dependencies"><div class="indent" style="padding-left: 1.6rem;"></div><h3 class="item-label">typescript</h3><span>4.4.2</span><div class="indent" style="padding-left: 1.6rem;"></div><div class="actions hover-to-appear"><div class="actions-bar"><ul class="actions-container"><li class="action-item"><img class="codicon" src="http://localhost:8080/07cc3cd53771eec4a4c9.svg" alt="Delete dependency permanently" title="Delete dependency permanently"></li></ul></div></div></div></div></div></div></div></div><span></span></div></div></div>
```