# sidebar view の改善

## resources

https://github.com/PKief/vscode-material-icon-theme

## summary

-   [VSCodeExplorer の導入](#VSCodeExplorerの導入)
-   [自作 scrollable wrapper 作成](#自作scrollable-wrapper作成)

## 問題

-   済）[DEBUG: stack の resize が window のリサイズ後にできなくなる問題の修正](#debug-stackのresizeがwindowのリサイズ後にできなくなる問題の修正)
-   [`react-custom-scrollbars`の`Scrollbars`を導入して window をリサイズすると謎の白い余白が発生する](#`react-custom-scrollbars`の`Scrollbars`を導入してwindowをリサイズすると謎の白い余白が発生する)
-   言語など足りていない icon svg の導入
-   ライブラリ無しで stack の body を scrollable にする（もしくは適切なライブラリを導入する）
-   VirtualFolder で新規ファイルを追加するときにあらわれるフォームは、インデントが足りていないためどのこフォルダに属するのか誤解を与える
-   押したら取り戻せない処理を行う delete ボタンが常に表示されていると危険なのでせめて確認ウィンドウ出せるように

細かいところ：

-   VirtualFolder の各カラムの action が常時存在しているせいで、ファイル名が長いとそのカラムの title が半分くらいで省略される
-   VirtualFolder のカラムのファイル名が長いと indent に関係なく左側に寄って行ってしまう。
-   svg を css でカスタムできない(色を変えたいなど)

## `react-custom-scrollbars`の`Scrollbars`を導入して window をリサイズすると謎の白い余白が発生する

対応不可判断。

なので使えなくなった。

おそらくこいつのせいでまたも window リサイズ時に謎の余白（誤差）が発生し、

せっかく修正した[DEBUG: stack の resize が window のリサイズ後にできなくなる問題の修正](#debug-stackのresizeがwindowのリサイズ後にできなくなる問題の修正)が意味なくなってしまった。

--> [自作 scrollable wrapper 作成](#自作scrollable-wrapper作成)へ。

## DEBUG: stack の resize が window のリサイズ後にできなくなる問題の修正

修正済。

原因は window の resize の結果 stack の各 height の合計が explroer height と同値にならないせいで、

各 stack の rewize ハンドラでリサイズ更新を適用しない条件分岐にたどり着いてしまうからであった。

#### 対処内容

`src/components/VSCodeExplorer/VSCodeExplorer.tsx`に以下を追加した。

```TypeScript
  /**
   * Manager of parent/Window resize
   * Reset each stack height when parameter height has been changed.
   * Also upadte `refPreviousSidebarHeight`.
   *
   * TODO: Check if udpated height is not over maxConstraints and less than _minConstraints.
   * */
  useEffect(() => {
    if (refPreviousSidebarHeight.current) {
      const updatedStackOneHeight =
        height * (stackOneHeight / refPreviousSidebarHeight.current);
      const updatedStackTwoHeight =
        height * (stackTwoHeight / refPreviousSidebarHeight.current);
      const updatedStackThreeHeight =
        height * (stackThreeHeight / refPreviousSidebarHeight.current);
      const updatedStackFourHeight =
        height * (stackFourHeight / refPreviousSidebarHeight.current);
      // 負の値なら合計値は長すぎて、静の値なら合計値は足りていない
      const measureError =
        sidebarHeight -
        (collapseStackOne ? collapsingHeightOfSection : updatedStackOneHeight) -
        (collapseStackTwo ? collapsingHeightOfSection : updatedStackTwoHeight) -
        (collapseStackThree
          ? collapsingHeightOfSection
          : updatedStackThreeHeight) -
        (collapseStackFour
          ? collapsingHeightOfSection
          : updatedStackFourHeight);
      // @ts-ignore
      const nextMaxConstraints = getMaxConstraints();

      // DEBUG:
      console.log(
        `[VSCodeExplorer] update explorer height ${refPreviousSidebarHeight.current} to be ${height}`
      );
      console.log(`[VSCodeExplorer] MeasureError: ${measureError}`);

      // 誤差修正と各stack heightの更新
      let isFixedMeasureError = false;
      [
        { height: updatedStackOneHeight, set: setStackOneHeight },
        { height: updatedStackTwoHeight, set: setStackTwoHeight },
        { height: updatedStackThreeHeight, set: setStackThreeHeight },
        { height: updatedStackFourHeight, set: setStackFourHeight },
      ].forEach((stack) => {
        if (
          !isFixedMeasureError &&
          stack.height + measureError > _minConstraints &&
          stack.height + measureError < nextMaxConstraints
        ) {
          stack.set(stack.height + measureError);
          isFixedMeasureError = true;
        } else {
          stack.set(stack.height);
        }
      });
      //
      refPreviousSidebarHeight.current = height;
    }
  }, [height]);
```

つまり、

開いている stack の height と閉じている stack の height の合計値は常に explorer height と同値になるように調整する。

そうしないと使えば使うほど誤差が積もって変なことになるからと、

resize ハンドラが誤差を許さない仕様なので誤差を残したままにするとリサイズが無効になってしまうから。

## VSCodeExplorer の導入

`src/components/Explorer`の使用を中止し`src/components/VSCodeExplorer`を使用する。

directory は以下のとおり変更。

```diff
src/
    components/
-       Pane.tsx        # 本来のコンポーネント。
+       Pane2.tsx       # ここにsidebarのindexを。ファイル名はひとまず。
+       VSCodeExplorer/ # 新規ディレクトリ
    sass/
        components/
-         _fileExplorer/scss  # Explorerのためのcss
+         _pane/scss          # VSCodeExplorerのためのcss
```

## 作成と導入:`ScrollableElement`

https://codesandbox.io/p/sandbox/test-scrollable-component-5rz8dv

で作成した`src/Scrollable22/index.tsx`をこの`src/components/ScrollableElement/index.tsx`へ移動した。

`Stack.tsx`コンポーネントと scrollabletabs へ導入。

#### `ScrollableTabs.tsx`へ`ScrollableElement`の導入

`ScrollableTabs.tsx`は完全にスクロール機能と本来の機能（editor のタブを表示する機能）が蜜結合しているので

これを作り直す。

`src/components/TabsAndActions/index.tsx`

要修正：ScrollableElement の幅や高さを５％固定にしていることの修正。やはりカスタムスタイルは避けられない。
