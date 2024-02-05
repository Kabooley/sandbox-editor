# Error 表示パネルの実装

VSCode の`PROBLEMS`パネルの実装。

## 前提

linterは使わない（使えない）。

litnerはファイルシステムが必要であるが、これはブラウザで動作するアプリケーションなのでlinterは動かせない。

有名なオンラインエディタは独自にこれを実現する方法を編み出している模様であるが、一個人には無理すぎる。

## 参考

snack expoのpanel

snack expoでは、monaco-editorの標準のマーカーをそのまま使用しておらず、

独自のブラウザで動作するlinterを使って毎度ファイルの内容をlintさせて

その結果をeditorに対してはsetmarkerし、

panelにはスタックとレースを表示させる

ということを行っている模様。

つまり

ファイルの変更有 --> ファイルの内容を検査(linter) --> 結果をeditorとpanelに返す --> それぞれに適切な形にして反映させる

ということですること。

- 実行タイミング：editorのondidchangemodelcontent
- 取得するデータ：getmodelmarkers
- (linterはつかわないので検査は必要ない。getModelMarkersで取得したものがすべて)
- データの反映先：footerのpanel
- データの変換：getModelMarkersから取得したデータをpanelに表示するために変換する


