# Test

branch: `test/setup-test`

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

testファイルは`src/__tests__`以下へ保存する。

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

## jest APIをimportなしで使うために

https://stackoverflow.com/a/61107618/22007575

```bash
# 1. @types/jestをインストール
# メジャーバージョンは合わせておくこと！ jest@29.XX.XXなら@types/jest@29.ZZ.ZZ
$ yarn add -D @types/jest
```

tsconfig.jsonにjestの存在を認識させる。

```JSON
{
    "types": ["jest"]
}
```