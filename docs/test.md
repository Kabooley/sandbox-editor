# Test 環境を React + Webpack 環境へ導入する手順

この手順でやればReact + Webpack環境にテストを導入できるはずという記事。

branch: `test/setup-test`

## 参考

https://zenn.dev/crsc1206/articles/de79af226d0c69

↑ 本当に助かった

## Dependencies

JavaScript ファイルをテストするために`jest`、
TypeScript ファイルをテストするために`ts-jest`、
React ファイルをテストするために`RTL`

```
jest
ts-jest
babel-jest
@babel/core
@babel/preset-env
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
jest-environment-jsdom
@types/jest
@types/testing-library__react
@types/testing-library__user-event
@types/testing-library__jest-dom
```

## 手順

-   [1. jest と ts-jest の設定](#1.-jest-と-ts-jest-の設定)
-   [2. RTL フレームワーク他を現在のテスト環境に追加、有効にする](#2.-RTL-フレームワーク他を現在のテスト環境に追加、有効にする)
-   [3. webpack 設定](#3.-webpack-設定)

## 1. jest と ts-jest の設定

目標： ECMAScript 文法、且つ TypeScript で書かれた JavaScript ファイルのテストを可能とさせる。

以下のような設定を行っていく：

-   CommonJS 文法で書かれたファイルのテストは babel-jest が行う
-   TypeScript で書かれたファイルのテストは ts-jest が行う
-   global 型情報の取得
-   ECMAScript 文法を許容させる
-   test ファイル群は`<rootDir>/__tests__/`へ納める
-   ビルド時に`src/__tests__`などテスト関係が含まれないように webpack の設定を変更する
-   テスト用の tsconfig ファイルを用意する

Installation:

https://jestjs.io/docs/getting-started

```bash
# jestのインストール
$ yarn add --dev jest
# テストのためのbabelのインストール
$ yarn add --dev babel-jest @babel/core @babel/preset-env
# ts-jestのインストール
$ yarn add --dev ts-jest
# 型情報のインストール
$ yarn add --dev @types/jest
```

コンフィグファイルの構成:

https://jestjs.io/docs/getting-started#using-babel

https://kulshekhar.github.io/ts-jest/docs/getting-started/installation

```bash
# jest.config.jsが出力される
npx ts-jest config:init
# <rootDir>/jest.config.js
```

以下のような内容になっている

```JavaScript
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

#### jest に TypeScript 拡張子ファイルに対しては ts-jest を使うように認識させる

`transform`プロパティを定義することで設定できる。

https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object

`transform`プロパティは Node がサポートしていない JavaScript 構文をサポート可能な構文に変換するための設定を定義するところである。

デフォルトだと`.ts`, `.js`, `.tsx`, `.jsx`は babel-jest が変換処理を行うことになっている。

これに`ts-jest`の設定を追加することで TypeScript ファイルをテスト可能とさせる。

`ts-jest`の設定で`transform`設定を定義する場合は`preset`設定を除外すること。

> If you are using custom transform config, please remove preset from your Jest config to avoid issues that Jest doesn't transform files correctly.

https://kulshekhar.github.io/ts-jest/docs/getting-started/options/#introduction

```diff JavaScript
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
- preset: 'ts-jest',
  testEnvironment: 'node',
+    transform: {
+        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
+        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
+        '^.+\\.(ts|tsx)?$': [
+            'ts-jest',
+            {
+               // define ts-jest settings
+            },
+        ]
+    },
};
```

#### jest に TypeScript 拡張子ファイル以外に対しては bable-jest を使うように認識させる

TypeScript 拡張子ファイルを ts-jest に変換させるルールを書いたら、

デフォルトの`{"\\.[jt]sx?$": "babel-jest"}`設定がなくなっているので、

TypeScript 拡張子以外の JavaScript ファイルはお前がやってくれと設定を追加しなくてはならない。

> Remember to include the default babel-jest transformer explicitly, if you wish to use it alongside with additional code preprocessors:

```diff JavaScript
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
- preset: 'ts-jest',
  testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
               // define ts-jest settings
            },
        ],
+       '^.+\\.(js|jsx)$': 'babel-jest',
    },
};
```

#### babel のコンフィグを定義する

https://jestjs.io/docs/getting-started#using-babel

```bash
# on root directory
$ touch .babelrc.json
```

`.bablerc.json`:

```JSON
{
  "presets": [["@babel/preset-env", {"targets": {"node": "current"}}]],
}
```

`current`の部分は使用環境の Node のバージョンを指定する。

[`.babelrc`と`babel.config.js`どちらを定義すればいいのかについて](#.babelrc-vs-babel.config.js)

#### ECMAScript 文法を許容させる

https://kulshekhar.github.io/ts-jest/docs/getting-started/options/#options

https://jestjs.io/docs/ecmascript-modules

https://jestjs.io/docs/configuration#extensionstotreatasesm-arraystring

jest は ECMAScript 文法のサポートは実験的なサポートしか提供していない、とのこと。

```diff JavaScript
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
+   extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
+               useESM: true
            },
        ],
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
};
```

-   `ts-jest`は`useESM`を有効にする
-   `extensionsToTreatAsESM`に ESM 文法を使う拡張子を指定する。

> jest は package.json で`"type": "module"`が定義されているときに`.js`や`.mjs`のファイルを ECMAScript として扱う。

`.js`は常に package.json の設定に従って常に(ESM だと)推測されるから含めるなというエラーが発生するので`.js`は含めない。

```bash
● Validation Error:

  Option: extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx', '.js'] includes '.js' which is always inferred based on type in its nearest package.json.

```

#### import 文なしでテスト API を使えるようにする

テストファイルでいちいち`import <テストAPI>`したくないための設定。

https://jestjs.io/docs/getting-started#type-definitions

API を使用するには

-   `@jest/globals`をインストールして、各 test ファイルは import 文で取得する
-   `@types/jest`をインストールする

`@types/jest`をインストールする方法を採用した。

インストールするだけだとまったく認識してくれない。

次の通りに設定する。

`tsconfig.jest.json`:

```diff JSON
{
    "compilerOptions": {
+      types: ["jest"]
    }
}
```

#### test ファイル群のディレクトリを認識させる

```diff JSON
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                useESM: true
            },
        ],
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
+   testMatch: [
+       '**/__tests__/**/*.+(ts|tsx|js)',
+       '**/?(*.)+(spec|test).+(ts|tsx|js)',
+       '!**/__tests__/setup-jest.js',
+   ],
};
```

test ファイル群を指定するプロパティは`testMatch`と`testRegex`の 2 つがある。

どちらか一方のプロパティのみ指定できる。

両者の指定する正規表現は異なる。

`testMatch`は`micromatch`という glob という正規表現の一種を採用している模様。

正直この正規表現はさっぱりわからん（そこに掛ける時間がない）いじることができないので公式に乗っている指定方法をそのまま踏襲。

複数の正規表現を渡すことで上から順番にテストファイル群を探してたどり着く仕組み。

```JavaScript
testMatch: [
    // __tests__ディレクトリ以下の`.ts`, `.tsx`, `.js`ファイルすべて
    '**/__tests__/**/*.+(ts|tsx|js)',
    // 先の結果のうち、`.spec`, `.test`が拡張子の前についているファイルすべて
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
    // 先の結果のうち次のファイルを除外する
    '!**/__tests__/setup-jest.js',
],
```

ということで各正規表現は常に前の結果のフィルタの役割になっているみたい。

上記の設定で、

`__tests__/`ディレクトリ以下の、`.test`,`.spec`が付いた`.ts`, `.tsx`, `.js`拡張子のファイル、ただし`setup-jest.js`ファイル以外が対象となる。

個人的に jest の setup ファイルは`__tests__/`以下に置きたかったのでこのような指定方法にした。

#### tsconfig.jest.json を認識させる、設定する

テスト時にだけ参照する tsconfig ファイルを用意する

```diff JavaScript
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                useESM: true,
+               tsconfig: './tsconfig.jest.json'
            },
        ],
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
   testMatch: [
       '**/__tests__/**/*.+(ts|tsx|js)',
       '**/?(*.)+(spec|test).+(ts|tsx|js)',
       '!**/__tests__/setup-jest.js',
   ],
};
```

概ねの tsconfig.jest.json の設定は`tsconfig.json`の方と同じになるはずなので、

`extends`プロパティでオリジナルの設定を引っ張ってくればいい。

#### @babel/preset-typescript vs ts-jest

結論：型チェックしたいなら ts-jest しかありえない。

TypeScript ファイルをテストするには 2 通りあると jest の公式に書いてある。

https://jestjs.io/docs/getting-started#using-typescript

https://babeljs.io/docs/babel-plugin-transform-typescript#caveats

babel の仕様として、

-   babel は型チェックをしないため、本来 TypeScript が型チェックしたらエラーを出力するはずのコードでも babel はコード変換を問題なく実行させてしまう
-   babel は`tsconfig.json`の変更を反映しない。
-   babel は TypeScript コードをトランスパイルするだけである。

#### `testEnvironment`

https://jestjs.io/docs/configuration#testenvironment-string

test を実行するための実行環境を指定する。

デフォルトで`node`なので、ブラウザを想定した JavaScript コードをテストしたい場合変更する必要がある。

> If you are building a web app, you can use a browser-like environment through jsdom instead.

`jsdom`にすればいいだけではなく、実際にその実行環境を提供してくれるライブラリをインストールしておかなくてはならない。

```bash
$ yarn add --dev jest-environment-jsdom
```

```diff JavaScript
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
- testEnvironment: 'node',
+ testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                useESM: true,
+               tsconfig: './tsconfig.jest.json'
            },
        ],
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
   testMatch: [
       '**/__tests__/**/*.+(ts|tsx|js)',
       '**/?(*.)+(spec|test).+(ts|tsx|js)',
       '!**/__tests__/setup-jest.js',
   ],
};
```

#### `jest.config.js` 他の設定

```JavaScript
/** @type {import('ts-jest').JestConfigWithTsJest} */
// export default {
module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: './tsconfig.jest.json',
            },
        ],
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
        '!**/__tests__/setup-jest.js',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup-jest.js'],
    moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],    
    transformIgnorePatterns: ['/node_modules/.*']
};

```

#### `roots`

https://jestjs.io/ja/docs/configuration#roots-arraystring

jestが探索してよいディレクトリを指定できる。

jestの探索対象はテストファイルとテストされるファイルなので、

もしも`roots`を指定したい場合、そのディレクトリはテストファイルもテストされるファイルも両方収まっていないとならない

例： `__tests__`は`src`以下の場所でないディレクトリの場合

```JavaScript
module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    ...
}
```

#### `setupFilesAfterEnv`

https://jestjs.io/docs/configuration#setupfilesafterenv-array

テストスイートが実行される前に実行しておきたい構成ファイルやフレームワークを列挙できるプロパティ

`setupFiles`プロパティはフレームワークがインストールされる前に実行されるのと異なり、
フレームワークがインストールされた直後、かつテストスイーツが実行される前に実行したいものを指定できる。

`setupFilesAfterEnv`で指定されるモジュール群は、各テスト ファイルで繰り返されるコードを対象としています。テスト フレームワークをインストールすると、モジュール内で Jest グローバル、Jest オブジェクト、および Expect にアクセスできるようになります。たとえば、jest 拡張ライブラリから追加のマッチャーを追加したり、セットアップ フックやティアダウン フックを呼び出したりできます。

たとえば`@testing-library/react`などのフレームワークの API をｸﾞﾛｰﾊﾞﾙで使いたい場合、`setup-jest.js`でその設定を書けばすべてのテストに適用できるなど。

#### `moduleFileExtensions`

https://jestjs.io/docs/configuration#modulefileextensions-arraystring

> モジュールが使用するファイル拡張子の配列。ファイル拡張子を指定せずにモジュールが必要な場合、これらの拡張子が Jest によって左から右の順序で検索されます。
> プロジェクトで最もよく使用される拡張子を左側に配置することをお勧めします。そのため、TypeScript を使用している場合は、「ts」または「tsx」、あるいはその両方を配列の先頭に移動することを検討してください。

#### `collectCoverageFrom`

コードカバレッジのレポートにどのファイルを含めるのか指定する。

デフォルトだとテスト中にロードされたすべてのファイルが対象になる。

レポートに余計なファイルが含まれる可能性はあるのでそうした場合を回避したいならば指定する。

今回は`src/`以下の特定の拡張子のファイルのみを指定した。




## 2. RTL フレームワーク他を現在のテスト環境に追加、有効にする

目標：Reactファイルをテストできるようにする。

#### Installation

```bash
# ReactのDOMをテストするフレームワーク
$ yarn add --dev @testing-library/react
# ユーザの操作を模倣するフレームワーク
$ yarn add --dev @testing-library/user-event
# DOMの状態についてアサートできるライブラリ
$ yarn add --dev @testing-library/jest-dom
```

#### babel に JSX を JS へ変換してもらう

https://jestjs.io/docs/tutorial-react#dom-testing

```bash
$ yarn add --dev @babel/preset-react
```

```JSON
{
    "presets": [
        ["@babel/preset-env", { "targets": { "node": "16.16.0" } }],
        ["@babel/preset-react", { "runtime": "automatic" }]
    ]
}

```

#### `tscofnig.jest.json`の`"react"`プロパティに`"react-jsx"`を渡す

jest に JSX を認めさせるのと、`import React from "react"`の記載なしでも React を認識してくれるようにする措置。

`tsconfig.jest.json`:

```JSON
{
    "compilerOptions": {
        "jsx": "react-jsx",
    }
}
```

これを"preserve"にしていたら次のエラーが発生する。

```bash
Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.
# ...
```

これは jest が JSX って何？ってなっている状態。

なので`"jsx": "react-jsx"`を 指定することで解決できる。

#### `jsx: react`と`jsx: react-jsx`の違い

`jsx: react`にすると test ファイルで`import React from "react"`が必ず必要になる
`jsx: react-jsx`にすると test ファイルで上記の import が不要になる

実際、`jsx: react`にすると以下のエラーが発生する。

```bash
  ● Test suite failed to run

    src/__tests__/ToggleSwitch.test.tsx:16:14 - error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.

    16             <ToggleSwitch
                    ~~~~~~~~~~~~
```

`React`を参照したけれど module だから import を代わりに使えと言われる。

#### setup ファイルにインストールしたフレームワークを import してグローバルに API を使えるようにする

`setup-jest.js`:

```bash
$ touch ./__tests__/setup-jest.js
```

```JavaScript
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';

configure({ testIdAttribute: 'data-my-test-id' });
```

これで、すべての` @testing-library/react``@testing-library/user-event `,`@testing-library/jest-dom`を使いたいテストファイルは import なしで API が使えるようになる

...はずなのだが自身の環境では使えるようになっていない。

現状個別にすべて各テストファイルに import している。

## 3. webpack 設定

実をいうと設定することはない。

要はバンドルにテストディレクトリ以下を含めたくないのでこれを webpack の設定なりで指定できないか調べたが、デフォルトの設定のままで問題ない。

webpack では、entry point で指定したファイルから参照できないファイルはバンドルに含まれない。

webpack はエントリーポイントからエントリーポイントから始まる依存グラフを生成しこのグラフの一部であるファイルのみがバンドルに含まれる。

また、production モードで webpack の tree shaking 機能がテストディレクトリを排除するようにしてあれば猶更必要はない。

参考:

https://webpack.js.org/concepts/dependency-graph/

https://webpack.js.org/guides/tree-shaking/#root

#### Module オプション、`exclude`の指定対象はバンドルから除外できるわけではない

参考：

https://stackoverflow.com/a/46305792/22007575

https://webpack.js.org/loaders/babel-loader/

`exclude`というプロパティが webpack config にあるけど、これを指定すればバンドルから外れるのでは？という疑問に対する回答。

できない。

`exclude`という設定は webpack の`module`設定に追加できるプロパティだけど、

**webpack のバンドルからは除外できるという設定ということではない。**

たとえば以下の`module`設定はどういう意味かというと

```JavaScript
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-typescript',
                                '@babel/preset-react',
                            ],
                            plugins: [
                                isDevelopment &&
                                    require.resolve('react-refresh/babel'),
                            ].filter(Boolean),
                        },
                    },
                ],
            },
```

`babel-loader`は`exclude`に指定されている`/node_modules/`をトランスパイルしないよという意味である。

しかし webpack は`node_modules`をバンドルには含めるので、バンドルに含めないという意味ではない。

#### `webpack-bundle-analyzer`をつかってバンドル結果を分析する

出力結果を視覚的にわかりやすく表示してくれるプラグイン。

`webpack-bundle-analyzer`を使うとバンドルした結果を分析して

バンドル内容を視覚化したインタラクティブなツリーマップが作成してくれる。

この結果を見て予期せぬディレクトリが含まれていないか確認することはできる。

## 出来上がったもの

ディレクトリ構成:

```bash
.
|-- __tests__           # テストファイル群はここへ
`   -- setup-jest.js
|-- jest.config.js
|-- node_modules
|-- package.json
|-- src
|-- tsconfig.jest.json
|-- tsconfig.json
|-- webpack.config.js
`-- yarn.lock
```

`jest.config.js`:

```JavaScript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: './tsconfig.jest.json',
            },
        ],
        '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    },
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
        '!**/__tests__/setup-jest.js',
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup-jest.js'],
    moduleFileExtensions: ['tsx', 'ts', 'js', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    transformIgnorePatterns: ['/node_modules/.*'],
};
```

`jest.config.js`:

```JavaScript
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';

configure({ testIdAttribute: 'data-my-test-id' });
```

`.babelrc.json`:

```json
{
    "presets": [
        ["@babel/preset-env", { "targets": { "node": "16.16.0" } }],
        ["@babel/preset-react", { "runtime": "automatic" }]
    ]
}
```

`tsconfig.jest.json`:

```JSON
{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "types": ["jest"],
        "jsx": "react-jsx",
    }
}

```

`webpack.config.js`: 変更なし

`package.json`:

```diff json
{
    "scripts": {
        ...
+       "test": "jest --config=jest.config.js"
    },
}
```

これで以下のコマンドが正常に稼働すればテスト環境の導入は完了です。

```bash
$ npm run test
```

## .babelrc vs babel.config.js

https://stackoverflow.com/a/60349119/22007575

https://babeljs.io/docs/config-files#project-wide-configuration

> .babelrc は、ファイル/ディレクトリのサブセットに対して特定の変換/プラグインを実行する場合に便利です。おそらく、babel によって変換/変更されたくないサードパーティのライブラリがあるかもしれません。
> babel.config.json は、プロジェクト内に単一の babel config を利用する複数のパッケージ (つまり、複数の package.json) ディレクトリがある場合に便利です。これはあまり一般的ではありません。

`Project-wide configuration`とはプロジェクト全体に適用したい設定という意味

`File-relative configuration`は特定のファイルに適用したい設定という意味かしら。

もしも`babel.config.json`ファイルが存在すれば、babel はその設定ファイルに基づいて動作する。

プロジェクト全体の構成ファイルは構成ファイルの物理的な場所から分離されているため、広範囲に適用する必要がある構成に最適である。

もしもコンパイル中の特定のファイルを見つけたとき、babel は`.babelrc.json`に基づいてコンパイル処理を決定する。
なので、特定のファイルやサブセットに対して特別に設定を設けたいときに`.babelrc`を用いるべき。


## `Cannot find module 'react-dom/client' from 'node_modules/@testing-library/react/dist/pure.js'`

https://stackoverflow.com/a/71716438/22007575

> @testing-library/react v13+ doesn't support React <=17. So, for React >=18 -> @testing-library/react >=13+ and for React <=17 -> @testing-library/react

とのことなので

現状React@17.0.2なので@testing-library/react@14.2.1が使えない。

ダウングレードして解決した。（14.2.1 --> @release-12.x）
