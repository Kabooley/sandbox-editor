# eslint と prettier を両立させる

## TODOs

- TODO: upgrade Node.js version because eslint requires at least more than @^18.18.0 version

- TODO: eslint.config.jsを消してしまったので作り直し且つinstallしますかはすべてyesで。

- TODO: yarnバージョンがおそらくNode.js v20とコンパチではないためすべてのyarnコマンドが失敗するのでモダンyarnへ移行してみる(#Upgrade-to-modern-yarn-from-classic-1.x)

## Installation

```bash
$ yarn add --dev prettier
$ echo {} > .prettierrc.json
$ yarn add -dev eslint
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

? Where does your code run? …  (Press <space> to select, <a> to toggle all, <i> to invert selection)/
✔ Browser
✔ Node

? What format do you want your config file to be in? …
  JavaScript
  YAML
❯ JSON

@typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest eslint@latest
? Would you like to install them now with npm? › No / Yes
$ yarn add --dev eslint-config-prettier eslint-plugin-gridsome eslint-plugin-vue babel-eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

```

## `.vscode/settings.json`

```JSON
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## `.prettierrc.json`

```JSON



```

## `.eslintrc.json`

```JSON
{
    "env": {
      "browser": true,
      "node": true,
      "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
    }
}
```

## `.prettierignore`

```

```

## package.json

## 走り書き

https://qiita.com/chihiro/items/f373873d5c2dfbd03250

git stash で隠した内容はローカルのリポジトリのみに適用されてプッシュ時にサーバへは送信されない

```bash
# -u: inclide untracked fileで新規作成されたファイルも含む
$ git stash -u "message"
# stashしたら好きにできる
#
$ git stash list
# もどってきたら
$ git stash apply stash@{n}

```


## Upgrade to modern yarn from classic 1.x

参考：

https://ermakovich.ru/posts/migrating-from-yarn-v1-to-v4-on-node-v20/

https://zenn.dev/catnose99/articles/9356979accca26

