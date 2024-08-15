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

最新のdevelopmentブランチのコミットとstackblitz.comのsandbox-editor responsiveプロジェクトからダウンロードした内容のコミットを比較して、responsive関連の変更だけ残したい

```bash
$ git branch 
  development
* feat/responsive-layout    # 今回stackblitzからダウンロードした内容を反映させたブランチ
  main
  ...

$ git log --oneline
9e509ba (HEAD -> feat/responsive-layout) YYYYYYYYYYY
fe5abd7 (origin/development, development) XXXXXXXXXXX
...

$ git diff 
```
TODO: 続き

```bash
$ git diff development..feat/responsive-layout
```
```
diff --git a/docs/feat-responsive.md b/docs/feat-responsive.md
new file mode 100644
index 0000000..1bcaf72
--- /dev/null
+++ b/docs/feat-responsive.md
@@ -0,0 +1,2 @@
+# Responsive蛹・+
