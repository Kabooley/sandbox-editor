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

## Error

#### `Cannot find module 'react-dom/client' from 'node_modules/@testing-library/react/dist/pure.js'`

https://stackoverflow.com/a/71716438/22007575

> @testing-library/react v13+ doesn't support React <=17. So, for React >=18 -> @testing-library/react >=13+ and for React <=17 -> @testing-library/react

とのことなので

現状React@17.0.2なので@testing-library/react@14.2.1が使えない。

ダウングレードして解決した。（14.2.1 --> @release-12.x）
