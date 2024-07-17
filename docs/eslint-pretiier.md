# eslint と prettier を両立させる

2024/07/10

NOTE: まず`README-BEFORE-LINT.md`を読んで

## 環境

Ubuntu: 20.04
Node.js: 20.12.2

## nodenv と corepack

eslint は yarn で動かすつもり。

eslint は Node.js のバージョンが古いと使えない。

なので Node.js と yarn のバージョン管理ができるようにしておくと便利。

nodenv で Node.js のバージョン管理、corepack で yarn のバージョン管理をしておくと楽。

詳しくは`./corepack.md`に。

## Installation

- NOTE: `eslint-plugin-prettier`は使わない（非推奨であると公式が明言しているから）
- NOTE: `eslint-config-prettier`は eslint と prettier の競合するルールをオフにしてくれるので prettier も使いたいなら必須
- NOTE: yarn バージョンが古くないことを前提としています
- NOTE: [あらかじめ済ませておくこと](#Modern-yarn-へ移行する)

```bash
$ yarn add --dev prettier
$ yarn add --dev eslint
$ mkdir -p .vscode && touch $_/settings.json
$ yarn create @eslint/config
? How would you like to use ESLint? …
  To check syntax only
❯ To check syntax and find problems
  To check syntax, find problems, and enforce code style

? What type of modules does your project use? …
❯ JavaScript modules (import/export)
  CommonJS (require/exports)
  None of these

? Which framework does your project use? …
❯ React
  Vue.js
  None of these

? Does your project use TypeScript? › No / Yes

? Where does your code run? …  (Press <space> to select, <a> to toggle all, <i> to invert selection)
✔ Browser
✔ Node

eslint@8.x, globals, @eslit/js, typescript-eslint, eslint-plugin-reaact
? Would you like to install them now with npm? › No / Yes  # choose yes
? Which package manager do you use? yarn
# yarnで選択したモジュールをインストールする
```

これで上記の内容を反映した`eslint.config.js`が生成される。

## `.vscode/settings.json`

ファイルを保存したときに eslint と prettier を発動させたいとき。

```JSON
{
  /* Linter and Formatter */
  // linter
  "eslint.packageManager": "yarn", // ESLintライブラリ解決時に使うパッケージマネージャ
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true, // eslint
    "source.fixAll.stylelint": true // Stylelint
  },
  // formatter
  "editor.defaultFormatter": "esbenp.prettier-vscode", // デフォルトフォーマッターをPrettier
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnType": true,
  // Prettier対象外言語
  "prettier.disableLanguages": ["markdown"]
}
```

## eslint config

https://eslint.org/docs/latest/use/getting-started

最近の eslint は json 形式ではなくて`eslint.config.[m]js`（flat config）を推奨しているみたい。

なので JSON 形式にはしない。

`$ yarn create @eslint/config`で各質問に答えたら次の通りに生成された

```JavaScript
// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";


export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
];

```

#### prettier と連携させる

https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#eslint-config-prettier

`eslint-plugin-prettier`は非推奨らしいので

`eslint-config-prettier`を**一番最後に追加する**

```diff
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
+ import eslintConfigPrettier from "eslint-config-prettier";



export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
+ eslintConfigPrettier
];

```

#### ignores

https://eslint.org/docs/latest/use/configure/ignore

```diff
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import eslintConfigPrettier from "eslint-config-prettier";



export default [
+ {ignores: ["**/node_modules/", "**/dist/", "**/docs/"]},
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  eslintConfigPrettier
];

```

参考：

https://typescript-eslint.io/getting-started

https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#eslint-config-prettier

https://qiita.com/Shilaca/items/c494e4dc6b536a5231de#eslint-%E3%81%AE-flat-config-%E3%81%A8%E3%81%AF

https://zenn.dev/shun91/articles/min-eslint-flat-config-for-vue3-ts-prettier

## `.prettierrc.json`

なんなら空オブジェクトのまままである

```JSON
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true
}
```

他 markdown など prettier を実行してほしくないファイルは`.prettierignore`へ。

https://prettier.io/docs/en/configuration#basic-configuration

## package.json に script の登録

https://eslint.org/docs/latest/use/command-line-interface

> If you are using a flat configuration file (eslint.config.js), you can also omit the file arguments and ESLint will use .. For instance, these two lines perform the same operation:

> ```bash
> npx eslint .
> npx eslint
> ```

ということで

```diff
{
  "scripts": {
+   "lint": "eslit src",
+   "lint:fix": "eslit src --fix",
  }
}
```

NOTE: なんか公式はあんなこと書いていたけれど`src`まで指定しないとなんもしない

参考：

https://docs.npmjs.com/cli/v7/commands/npx

## Modern yarn へ移行する

corepack導入前にclassic yarn を削除する。

まず環境へどうやって yarn を導入したのかその方法によって削除方法が異なる。

自分は nodenv-yarn-install を使ってインストールした。

https://github.com/pine/nodenv-yarn-install?tab=readme-ov-file#getting-started

これを使ってインストールすると

`User/.anyenv/envs/nodenv/versions/16.16.0/bin/yarn`
`User/.anyenv/envs/nodenv/versions/16.16.0/bin/yarnpkg`

等が生成される

ここのオブジェクトは実際にはリンクで、実物は

`User/.anyenv/envs/nodenv/versions/16.16.0/lib/node_modules/yarn/bin/yarn.js`
`User/.anyenv/envs/nodenv/versions/20.12.2/lib/node_modules/yarn/bin/yarn.js`

に存在する。両方削除して初めて「消える」

手順：

```bash
# 現在のnodenv globalsで設定されているnodenvバージョンのyarnが示される
$ which yarn
/home/User/.anyenv/envs/nodenv/versions/16.16.0/bin
# 保存個所の確認
$ ls -al $(nodenv root)/versions/*/bin
/home/user/.anyenv/envs/nodenv/versions/16.16.0/bin:
total 79288
drwxr-xr-x 2 user user     4096 Jan  6  2023 .
drwxr-xr-x 6 user user     4096 Jan  6  2023 ..
lrwxrwxrwx 1 user user       45 Jan  6  2023 corepack -> ../lib/node_modules/corepack/dist/corepack.js
-rwxr-xr-x 1 user user 81180048 Jan  6  2023 node
lrwxrwxrwx 1 user user       38 Jan  6  2023 npm -> ../lib/node_modules/npm/bin/npm-cli.js
lrwxrwxrwx 1 user user       38 Jan  6  2023 npx -> ../lib/node_modules/npm/bin/npx-cli.js
lrwxrwxrwx 1 user user       36 Jan  6  2023 yarn -> ../lib/node_modules/yarn/bin/yarn.js
lrwxrwxrwx 1 user user       36 Jan  6  2023 yarnpkg -> ../lib/node_modules/yarn/bin/yarn.js

/home/user/.anyenv/envs/nodenv/versions/20.12.2/bin:
total 95696
drwxr-xr-x 2 user user     4096 May  4 00:48 .
drwxr-xr-x 6 user user     4096 May  4 00:48 ..
lrwxrwxrwx 1 user user       45 May  4 00:47 corepack -> ../lib/node_modules/corepack/dist/corepack.js
-rwxr-xr-x 1 user user 97981176 May  4 00:47 node
lrwxrwxrwx 1 user user       38 May  4 00:47 npm -> ../lib/node_modules/npm/bin/npm-cli.js
lrwxrwxrwx 1 user user       38 May  4 00:47 npx -> ../lib/node_modules/npm/bin/npx-cli.js
lrwxrwxrwx 1 user user       36 May  4 00:48 yarn -> ../lib/node_modules/yarn/bin/yarn.js
lrwxrwxrwx 1 user user       36 May  4 00:48 yarnpkg -> ../lib/node_modules/yarn/bin/yarn.js
/home/teddy/.anyenv/envs/nodenv/versions/16.16.0/lib:

# nodenvのバージョンごとに存在するyarnのシンボリックリンクと実物を削除する
$ rm -rf /home/user/.anyenv/envs/nodenv/versions/16.16.0/bin/yarn
$ rm -rf /home/user/.anyenv/envs/nodenv/versions/16.16.0/bin/yarnpkg
$ rm -rf /home/user/.anyenv/envs/nodenv/versions/20.12.2/bin/yarnpkg
$ rm -rf /home/user/.anyenv/envs/nodenv/versions/20.12.2/bin/yarn

# 削除が滞りなく済んだか確認
# (lib/以下の方も確認)
$ ls -al $(nodenv root)/versions/*/bin/
/home/user/.anyenv/envs/nodenv/versions/16.16.0/bin:
total 79288
drwxr-xr-x 2 user user     4096 Jan  6  2023 .
drwxr-xr-x 6 user user     4096 Jan  6  2023 ..
lrwxrwxrwx 1 user user       45 Jan  6  2023 corepack -> ../lib/node_modules/corepack/dist/corepack.js
-rwxr-xr-x 1 user user 81180048 Jan  6  2023 node
lrwxrwxrwx 1 user user       38 Jan  6  2023 npm -> ../lib/node_modules/npm/bin/npm-cli.js
lrwxrwxrwx 1 user user       38 Jan  6  2023 npx -> ../lib/node_modules/npm/bin/npx-cli.js

/home/user/.anyenv/envs/nodenv/versions/20.12.2/bin:
total 95696
drwxr-xr-x 2 user user     4096 May  4 00:48 .
drwxr-xr-x 6 user user     4096 May  4 00:48 ..
lrwxrwxrwx 1 user user       45 May  4 00:47 corepack -> ../lib/node_modules/corepack/dist/corepack.js
-rwxr-xr-x 1 user user 97981176 May  4 00:47 node
lrwxrwxrwx 1 user user       38 May  4 00:47 npm -> ../lib/node_modules/npm/bin/npm-cli.js
lrwxrwxrwx 1 user user       38 May  4 00:47 npx -> ../lib/node_modules/npm/bin/npx-cli.js


# nodenv rehashをしろとのことなのでやっておく
$ nodenv rehash

# yarnで何が参照されるか確認
$ which yarn
/mnt/c/Users/user/AppData/Roaming/npm/yarn  # すくなくともshimsはなくなった

# このままcorepackでyarnを使うなら
$ npm uninstall -g yarn
```

参考：

https://github.com/nodenv/nodenv/wiki/FAQ#cannot-remove-shim


# モダンyarnに切り替えたら発生したエラー

NOTE: 本エラーは解決するのではなく回避することにした。

これまでyarn@1.22.22を使っていたがeslintがyarn古いと動かなかったので

モダンyarnに変更した際、その環境でアプリケーションをビルドしたら発生したエラー。


## 遭遇しているエラー

```bash
$ npm run start
  # ...
ERROR in ./node_modules/typescript/lib/typescript.js 38749:29-46
Module not found: Error: Can't resolve 'module' in '/home/USER/sandbox-editor/node_modules/typescript/lib'
resolve 'module' in '/home/USER/sandbox-editor/node_modules/typescript/lib'
  Parsed request is a module
  using description file: /home/USER/sandbox-editor/node_modules/typescript/package.json (relative path: ./lib)
    resolve as module
      /home/USER/sandbox-editor/node_modules/typescript/lib/node_modules doesn't exist or is not a directory
      /home/USER/sandbox-editor/node_modules/typescript/node_modules doesn't exist or is not a directory
      /home/USER/sandbox-editor/node_modules/node_modules doesn't exist or is not a directory
      looking for modules in /home/USER/sandbox-editor/node_modules
        single file module
          using description file: /home/USER/sandbox-editor/package.json (relative path: ./node_modules/module)
            no extension
              Field 'browser' doesn't contain a valid alias configuration
              /home/USER/sandbox-editor/node_modules/module doesn't exist
            .*
              Field 'browser' doesn't contain a valid alias configuration
              /home/USER/sandbox-editor/node_modules/module.* doesn't exist
            .js
              Field 'browser' doesn't contain a valid alias configuration
              /home/USER/sandbox-editor/node_modules/module.js doesn't exist
            .jsx
              Field 'browser' doesn't contain a valid alias configuration
              /home/USER/sandbox-editor/node_modules/module.jsx doesn't exist
            .tsx
              Field 'browser' doesn't contain a valid alias configuration
              /home/USER/sandbox-editor/node_modules/module.tsx doesn't exist
            .ts
              Field 'browser' doesn't contain a valid alias configuration
              /home/USER/sandbox-editor/node_modules/module.ts doesn't exist
        /home/USER/sandbox-editor/node_modules/module doesn't exist
      /home/USER/node_modules doesn't exist or is not a directory
      /home/node_modules doesn't exist or is not a directory
      /node_modules doesn't exist or is not a directory
 @ ./src/worker/fetchLibs.worker.ts 43:0-28 323:16-18

webpack 5.89.0 compiled with 1 error and 3 warnings in 40394 ms

^C<i> [webpack-dev-server] Gracefully shutting down. To force exit, press ^C again. Please wait...
```

https://github.com/microsoft/vscode/issues/168420

https://stackoverflow.com/a/74771533/22007575

#### `module`の呼び出し箇所

`'/home/USER/sandbox-editor/node_modules/typescript/lib'`の 43055 行目に確かに`module`というライブラリを呼び出しているみたい

```JavaScript
// src/compiler/pnpapi.ts
function getPnpApi(path) {
  if (typeof process.versions.pnp === "undefined") {
    return;
  }
  const { findPnpApi } = require("module");
  if (findPnpApi) {
    return findPnpApi(`${path}/`);
  }
}
function getPnpApiPath(path) {
  var _a;
  return (_a = getPnpApi(path)) == null ? void 0 : _a.resolveRequest(
    "pnpapi",
    /*issuer*/
    null
  );
}
```

typescript と pnp というものに関係がありそう

#### 情報収集

- https://stackoverflow.com/a/68952054/22007575
- https://github.com/yarnpkg/berry/issues/3722#issuecomment-974634888
- https://yarnpkg.com/advanced/pnpify
- https://yarnpkg.com/migration/guide

#### モダンyarnの独自パッケージ管理方法

モダンyarnはpnpという代物を使って`node_modules`を生成する代わりに独自のパッケージ管理方法を使っている模様

その関係で、classic yarnだったらアプリケーションは問題なくビルドできていたのに、

モダンyarnにしたとたんに`module`なんて依存関係しらないけど？みたいなエラーを吐き出してアプリケーションが動かなくなってしまった。

#### モダンyarnのさらなる弊害

しかも極めつけは、VSCodeでReactファイルに対して`react`なんて見つからんけど？みたいなエラーを出す始末で開発がままならない。

