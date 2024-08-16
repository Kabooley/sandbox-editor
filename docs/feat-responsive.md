# Responsive化

そもそもstackblitz.comのプロジェクトで元となったdevelopmentブランチの内容が古かった可能性があるので

間違いなくマージ前に衝突をなくすこと

## 走り書き

##### `src/`内の`:Zone.Identifier`が付いたファイルをすべて削除する

```bash
$ cd src
# 一旦出力内容をノートに写して問題ないか確認するなどする
$ find . -name "*:Zone.Identifier" > docs/feat-responsive.md
# 問題なければ一括削除する
$ find . -name "*:Zone.Identifier" -exec rm {} -verbose ';'
```

#### 2つのコミット間の差分を確認する

参考：

https://qiita.com/yuya_presto/items/ef199e08021dea777715

最新のdevelopmentブランチのコミットとstackblitz.comのsandbox-editor responsiveプロジェクトからダウンロードした内容のコミットを比較して、responsive関連の変更だけ残したい

- コミット内容が逆行しないよう、responsive化と関係ない変更はコミットしないように気を付ける

```bash
$ git branch 
  development
* feat/responsive-layout    # 今回stackblitzからダウンロードした内容を反映させたブランチ
  main
  ...

$ git log --oneline
9e509ba (HEAD -> feat/responsive-layout) YYYYYYYYYYY
fe5abd7 (origin/development, development) XXXXXXXXXXX

# 以下のコマンドはブランチの差分すべてを出力して5000行くらいになったので、ファイル一つずつにする
$ git diff development..feat/responsive-layout


# 差分のあるファイル名を取得する
$ git diff development..feat/responsive-layout --name-only
# 各ファイルのブランチ間差分を出力させる
# 変更内容のコードを分析してコミットするかする

# 特定のファイルにおける2つのブランチ間の差分を出力する
# a: 古いコンテンツ、b: 新しいコンテンツ
$ git diff development..feat/responsive-layout src/App.tsx
```


```bash
# 差分のあるファイル名を取得する
$ git diff development..feat/responsive-layout --name-only
docs/feat-responsive.md
src/App.tsx
src/Layout/EditorSection.tsx
src/Layout/MainContainer.tsx
src/Layout/PaneSection.tsx
src/Layout/desktop/index.tsx
src/Layout/index.tsx
src/Layout/phone/EditorSection.tsx
src/Layout/phone/PaneSection.tsx
src/Layout/phone/index.tsx
src/Layout/tablet/EditorSection.tsx
src/Layout/tablet/PreviewSection.tsx
src/Layout/tablet/index.tsx
src/components/Header/index.tsx
src/components/Modal/index.tsx
src/components/Monaco/MonacoEditor.tsx
src/components/Pane.tsx
src/components/ScrollableElement/index.tsx
src/components/SliderPane.tsx
src/components/TabsAndActions/index.tsx
src/components/VSCodeExplorer/Workspace/index.tsx
src/components/sliderPane.css
src/constants/index.ts
src/index.html
src/sass/abstracts/_mixins.scss
src/sass/base/_base.scss
src/sass/base/_typography.scss
src/sass/components/_editor.scss
src/sass/components/_header.scss
src/sass/components/_tabsAndActions.scss
src/sass/layout/_main.scss
src/sass/main.scss
src/slices/layoutSlice.ts
src/utils/index.ts
src/utils/limitWithinRange.ts
```

```bash

```

## レスポンシブ内容の反映処理

#### 問題なければリストから該当ファイルを消していって

TODO: つづき

```bash
# 未確認
docs/feat-responsive.md
src/Layout/EditorSection.tsx
src/Layout/MainContainer.tsx
src/Layout/PaneSection.tsx
src/Layout/desktop/index.tsx
src/Layout/index.tsx
src/Layout/phone/EditorSection.tsx
src/Layout/phone/PaneSection.tsx
src/Layout/phone/index.tsx
src/Layout/tablet/EditorSection.tsx
src/Layout/tablet/PreviewSection.tsx
src/Layout/tablet/index.tsx
src/components/Pane.tsx
src/components/SliderPane.tsx
src/components/VSCodeExplorer/Workspace/index.tsx
src/components/sliderPane.css
src/constants/index.ts
src/index.html
src/sass/abstracts/_mixins.scss
src/sass/base/_base.scss
src/sass/base/_typography.scss
src/sass/components/_editor.scss
src/sass/components/_header.scss
src/sass/components/_tabsAndActions.scss
src/sass/layout/_main.scss
src/sass/main.scss
src/slices/layoutSlice.ts
src/utils/index.ts
src/utils/limitWithinRange.ts

# 問題なし
src/components/TabsAndActions/index.tsx
src/components/ScrollableElement/index.tsx
src/components/Monaco/MonacoEditor.tsx
src/components/Modal/index.tsx
src/components/Header/index.tsx

# 変更なし
src/App.tsx

```

## わかったこと

- prettierのルールは統一しよう。;がないとかスペースとかで差分ありと出るのは面倒である