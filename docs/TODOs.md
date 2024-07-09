# TODOs

当面の間。

このノートはブランチに関係なく横断して編集される

## 機能

- TODO: ローディング機能（ローディング完了するまで触れないようにする機能）
- TODO: サンドボックス化
- TODO: レスポンシブレイアウト

- TODO: 重要アイテム要素にtitle属性をつける（何者なのかホバーしたら表示されるようにする）
- TODO: TabsAndActions と Preview に action の追加（Preview トグルボタン、エディタに展開しているファイルを閉じるボタンなど）

- TODO: JSX色付け
- TODO: monaco-editorの最低限の設定機能の提供（ミニマップの表示非表示など）
- TODO: Dependenciesやpackage.jsonで依存関係の取得をしたときに失敗したらユーザへ通知する

## 修正

- TODO: 依存関係がうまく取得できていない件の確認(まだ依存関係修正ブランチを取りこんでいないからという可能性もあり)
- TODO: data/files.ts を class インスタンス化をやめる
- TODO: selected: true のファイルを削除すると、editor 上ではその削除したファイルが残ったままになり別のファイルが selected:true になっていない
- TODO: 初期のバンドル処理が行われていないのか、バンドル結果が preview に表示されない
- TODO: format 機能がいつの間にかなくなっている？右クリックメニューでできるようにする

## パフォーマンス

実際に何らかのプログラムをこの sandbox-editor で動かしてみよう

trivial edit
