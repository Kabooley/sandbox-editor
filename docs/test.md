# Test

branch: `test/setup-test`

## 参考

https://zenn.dev/crsc1206/articles/de79af226d0c69

↑ 本当に助かった

## Dependencies

```
jest
ts-jest
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
jest-environment-jsdom
@types/jest
@types/testing-library__react
@types/testing-library__user-event
@types/testing-library__jest-dom
```

## set up

#### webpack のビルドにテストファイルが入らないように

`webpack.config.js`:

```JavaScript
module.exports = {
    // ...
    exclude: {
        test: [/\.test\.(ts|tsx|js|jsx)$/],
    },
}
```

参考：

https://stackoverflow.com/a/44380045/22007575

https://webpack.js.org/configuration/module/#ruleexclude

#### installation

```bash

```

#### ディレクトリ構成

```diff
<rootDir>/
    src/
+       __tests__/
+          setup-jest.js
        assets/
        ...
```

test ファイルは`src/__tests__`以下へ保存する。

#### `package.json`

`test`スクリプトを追加。

```JSON
{
    "scripts": {
        "test": "jest"
    }
}
```

## メモ

## jest API を import なしで使うために

https://stackoverflow.com/a/61107618/22007575

```bash
# 1. @types/jestをインストール
# メジャーバージョンは合わせておくこと！ jest@29.XX.XXなら@types/jest@29.ZZ.ZZ
$ yarn add -D @types/jest
```

tsconfig.json に jest の存在を認識させる。

```JSON
{
    "types": ["jest"]
}
```

## errors

```bash
> test
> jest

 FAIL  src/__tests__/setup-jest.js
  ● Test suite failed to run

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    /home/teddy/sandbox-editor/src/__tests__/setup-jest.js:1
    ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){import { configure } from '@testing-library/react';
                                                                                      ^^^^^^

    SyntaxError: Cannot use import statement outside a module

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1505:14)

 FAIL  src/__tests__/ToggleSwitch.test.tsx
  ● Test suite failed to run

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    /home/teddy/sandbox-editor/src/__tests__/setup-jest.js:1
    ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){import { configure } from '@testing-library/react';
                                                                                      ^^^^^^

    SyntaxError: Cannot use import statement outside a module

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1505:14)

Test Suites: 2 failed, 2 total
Tests:       0 total
Snapshots:   0 total
Time:        5.049 s
Ran all test suites.
```

遭遇しているエラーは

-   `setup-jest.ts`: encountered an unexpected token

```bash

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    blahblahblah
```

要は`.js`ファイルが標準でない JavaScript 構文を使っているから読めなかったんだけどと言っている。

これの解決方法らしいのが、`js`拡張子を解決するやつを登録すること。

```diff
module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx)?$': [
            'ts-jest',
            {
                // ts-jest configuration goes here
            },
        ],
+       '^.+\\.(js|jsx)?$': [
+           // set something resolve .js files (in many case it should be babel)
+       ]
    },
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup-jest.js'],
};

```

ECMA Script で書かれた JavaScript ファイルを有効にさせるために：

https://jestjs.io/docs/ecmascript-modules

上記は実験的な機能らしい。

## ts-jest

#### Paths Mapping

tsconfig.json で`baseUrl`や`paths`オプションを使っている場合、

`moduleNameMapper`オプションを jest.config.js に、tsconfig.json 通りに設定しなくてはならない。

特に今のところ設定する必要はなさそう。

#### ESM Support

https://kulshekhar.github.io/ts-jest/docs/guides/esm-support

https://jestjs.io/docs/ecmascript-modules

https://archive.jestjs.io/docs/en/22.x/configuration#setuptestframeworkscriptfile-string

> スイート内の各テスト ファイルが実行される前に、テスト フレームワークを構成またはセットアップするコードを実行するモジュールへのパス。
> setupFiles はテスト フレームワークが環境にインストールされる前に実行されるため、このスクリプト ファイルにより、テスト フレームワークが環境にインストールされた直後にコードを実行できます。 プロジェクトのルート ディレクトリに対する相対パスを指定する場合は、「<rootDir>/a-configs-folder」のように、パスの文字列内に <rootDir> を含めてください。 たとえば、Jest には、jasmine API にモンキー パッチを適用することで機能する、jasmine へのいくつかのプラグインが付属しています。さらに多くの Jasmine プラグインをミックスに追加したい場合 (または、たとえばプロジェクト全体のカスタム マッチャーが必要な場合)、これらのモジュールで行うことができます。

https://stackoverflow.com/a/61785012/22007575

https://github.com/expo/snack/blob/main/website/jest/unit.config.js

```JavaScript
// jest.config.js

```

#### package.json modifying

```diff JSON
{
+   "type": "module",
    "scripts": {
+       "test": "jest --config=jest.config.js"
}
}
```

## babel

jest はデフォルトの動作として CommonJS 文法しか受け付けていないので、

この ESM 文法のファイルを CJS 文法に直すように変換処理をいったん行わないとならないらしい。

そのために結局 babel は必要であるってワケ。

公式のドキュメントに罠があって、`ts-jest`を使うか`bable`をいじるか 2 択しかないよみたいに書いてあるけれど結局 2 択じゃなくて「適切に両者の役割を分担させて設定する」が正解だったわけ。

子ね。何時間無駄にしたと思っているんじゃ。

参考：

https://qiita.com/ovrmrw/items/ae123a4e0408d0777fd1

https://zenn.dev/crsc1206/articles/de79af226d0c69

https://jestjs.io/docs/getting-started#using-babel

```bash
# @babel/preset-react, @babel/core, @babel/preset-envはinstall済
yarn add --dev babel-jest

# .babelrcをプロジェクトのルートディレクトリに作る
$ touch .babelrc
```

babel は`.bablerc`を作らないと働いてくれない模様。

#### .babelrc vs babel.config.js

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

## webpack

https://archive.jestjs.io/docs/ja/next/webpack

## `setup-jest.js`はどこのディレクトリへ保存するべきか？

## `tsconfig.jest.json`で jest 用の tsconfig を作る

`tsconfig.json`との違いを如何に記載：

```diff JSON
{
+   "extends": "./tsconfig.json",
}
```

jest 用の tsconfig を有効にするためには、以下の通りにする：

```diff JavaScript

```

https://stackoverflow.com/a/73696933/22007575

## jest における`<rootDir>`

https://jestjs.io/docs/webpack#configuring-jest-to-find-our-files

> <rootDir> is a special token that gets replaced by Jest with the root of your project. Most of the time this will be the folder where your package.json is located unless you specify a custom rootDir option in your configuration.

> <rootDir> は、Jest によってプロジェクトのルートに置き換えられる特別なトークンです。ほとんどの場合、構成でカスタム rootDir オプションを指定しない限り、これは package.json が配置されるフォルダーになります。

## Error

#### `Cannot find module 'react-dom/client' from 'node_modules/@testing-library/react/dist/pure.js'`

https://stackoverflow.com/a/71716438/22007575

> @testing-library/react v13+ doesn't support React <=17. So, for React >=18 -> @testing-library/react >=13+ and for React <=17 -> @testing-library/react

とのことなので

現状React@17.0.2なので@testing-library/react@14.2.1が使えない。

ダウングレードして解決した。（14.2.1 --> @release-12.x）

## 手順

## 1. jest と ts-jest の設定

ECMAScript 文法、且つ TypeScript で書かれた JavaScript ファイルのテストを可能とさせる。

以下のような設定を行っていく：

-   CommonJS 文法で書かれたファイルの babel-jest が行う
-   TypeScript で書かれたファイルのテストは ts-jest が行う
-   global 型情報の取得
-   ECMAScript 文法を許容させる
-   test ファイル群は`src/__tests__/`へ納める
-   webpack でビルドするプロジェクトなので、ビルド時に`src/__tests__`などテスト関係が含まれないように webpack の設定を変更する
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

NOTE: `ts-jest`の設定で`transform`設定を定義する場合は`preset`設定を除外すること。

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

TypeScript 拡張子以外の JavaScript はお前がやってくれと設定を追加しなくてはならない。

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

`.bablerc`:

```JSON
{
  "presets": [["@babel/preset-env", {"targets": {"node": "current"}}]],
}
```

`current`の部分は使用環境の Node のバージョンを指定する。

[`.babelrc`と`babel.config.js`どちらを定義すればいいのかについてはこちら](#.babelrc-vs-babel.config.js)

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

`.js`は常に package.json の設定に従って常に(ESM だと)推測されるので含めるなというエラーが発生するので`.js`は含めない。

```bash
● Validation Error:

  Option: extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx', '.js'] includes '.js' which is always inferred based on type in its nearest package.json.

```

TODO: `extensionsToTreatAsESM`の設定は意味があるのか確認。今のところ package.json は`type: module`設定していない

#### import 文なしでテスト API を使えるようにする

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

TODO: tsconfig の該当項目を要確認。

types と typeRoots の項目

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

正直この正規表現はさっぱりいじることができないので公式に乗っている指定方法をそのまま踏襲するほかない。

複数の正規表現を渡すことでテストファイル群を詳しく指定している。

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

ディレクトリ構成：

```diff
    src/
        __tests__/
            setup-jest.js
            XXXX.test.tsx
            ZZZZ.test.ts
            YYYY.test.js
        XXXX.tsx
        ZZZZ.ts
        YYYY.js
    jest.config.js
    tsconfig.json
+   tsconfig.jest.json
    webpack.config.js
```

概ねの tsconfig.jest.json の設定は`tsconfig.json`の方と同じになるはずなので、

`extends`プロパティでオリジナルの設定を引っ張ってくればいいのだが

なんでか知らんが tsconfig.jest.json で`extends`を設定しても認識しないっぽい

なので今のところ tsconfig.json をそのままコピペしている。

#### @babel/preset-typescript vs ts-jest

結論：型チェックしたいなら ts-jest しかありえない。

TypeScript ファイルをテストするには 2 通りあると jest の公式に書いてある。

https://jestjs.io/docs/getting-started#using-typescript

https://babeljs.io/docs/babel-plugin-transform-typescript#caveats

babel の仕様として、

-   babel は型チェックをしないため、本来 TypeScript が型チェックしたらエラーを出力するはずのコードでも babel はコード変換を問題なく実行させてしまう
-   babel は`tsconfig.json`の変更を反映しない。
-   babel は TypeScript コードをトランスパイルするだけである。

#### testEnvironment

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

#### 他の設定

```JavaScript
/** @type {import('ts-jest').JestConfigWithTsJest} */
// export default {
module.exports = {
    roots: ['<rootDir>/src'],
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
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],    transformIgnorePatterns: ['/node_modules/.*']
};

```

#### `setupFilesAfterEnv`

https://jestjs.io/docs/configuration#setupfilesafterenv-array

テストスイートが実行される前に実行しておきたい構成ファイルやフレームワークを列挙できるプロパティ

`setupFiles`プロパティはフレームワークがインストールされる前に実行されるのと異なり、
フレームワークがインストールされた直後、かつテストスイーツが実行される前に実行したいものを指定できる。

`setupFilesAfterEnv`で指定されるモジュール群は、各テスト ファイルで繰り返されるコードを対象としています。テスト フレームワークをインストールすると、モジュール内で Jest グローバル、Jest オブジェクト、および Expect にアクセスできるようになります。たとえば、jest 拡張ライブラリから追加のマッチャーを追加したり、セットアップ フックやティアダウン フックを呼び出したりできます。

たとえば`@testing-library/react`などのフレームワークの API をｸﾞﾛｰﾊﾞﾙで使いたい場合、`setup-jest.js`でその設定を書けばすべてのテストに適用できるなど。

#### moduleFileExtensions

https://jestjs.io/docs/configuration#modulefileextensions-arraystring

> モジュールが使用するファイル拡張子の配列。ファイル拡張子を指定せずにモジュールが必要な場合、これらの拡張子が Jest によって左から右の順序で検索されます。
> プロジェクトで最もよく使用される拡張子を左側に配置することをお勧めします。そのため、TypeScript を使用している場合は、「ts」または「tsx」、あるいはその両方を配列の先頭に移動することを検討してください。

## 2. RTL フレームワーク他を現在のテスト環境に追加、有効にする

#### Installation

```bash
# ReactのDOMをテストするフレームワーク
$ yarn add --dev @testing-library/react
# ユーザの操作を模倣するフレームワーク
$ yarn add --dev @testing-library/user-event
#
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

```JavaScript
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/user-event';

configure({ testIdAttribute: 'data-my-test-id' });
```

これで、すべての` @testing-library/react``@testing-library/user-event `,`@testing-library/jest-dom`を使いたいテストファイルは import なしで API が使えるようになる...はずなのだが使えるようになっていない。

現状個別にすべて各テストファイルに import している。

## 3. webpack 設定

参考:

https://gist.github.com/kpunith8/51d43ed6adaaa5698e49ed2cab3f514e

https://riptutorial.com/web-component/example/30849/webpack-and-jest

#### test 関連のファイルがバンドルに含まれないようにする

バンドルに__tests__ファイルが含まれているか確認 --> わからん

`src/__tests__/`というディレクトリ構成が問題なのかも

`__tests__`をルート直下に移動できるか？

