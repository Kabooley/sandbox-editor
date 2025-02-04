# Script: Run multiple browser-test files

branch `scripts/multiple-browser-test-files`

## 目的

`browser-test`内のテスト対象ファイルを一つのコマンドですべて実行できるようにする。

現状テストファイルごとに手動でコマンドを打つか、package.jsonの`test:browser`スクリプトの`--input`オプションの引数となるファイルを手動で書き換えないといけない。

#### 検証内容

- [Node.js child_process apiを利用する方法](#Node.js-child_process-apiを利用する方法)

- [テストファイルをindex.test.tsがimportして一括で実行するという方法](#テストファイルをindex.test.tsがimportして一括で実行するという方法)

rootHookを制御できないので断念。
rootHookを使わないならネストしたsuite()は有効なので、
テストファイル群をindex.test.tsへすべてimportして実行するという手段はあり。

- [テストランナーを使うという方法](#テストランナーを使うという方法)

最早これ以上フレームワークについて調べるのきついので断念。

## Node.js child_process apiを利用する方法

## 目標

次のコマンドを、`browser-test/`ディレクトリ内のテスト対象ファイル毎に実行したい

```bash
# --input=browser-test/index.test.tsの`index.test.ts`の部分をテストファイル毎に読み替えて実行させたい
$ npx rollup --config=rollup.config.js --input=browser-test/index.test.ts && http-server ./ --port=8080 -c-1 -o output/index.html
```

可能であればメモリを食いつぶさないように同時実行数を制御したい。


## 情報収集

https://github.com/mochajs/mocha/issues/2756

## 参考

https://www.geeksforgeeks.org/node-js-child-process/

https://nodejs.org/api/child_process.html#child-process

https://github.com/darkreader/darkreader/blob/main/tasks/cli.js

## [Node.js] child_process

> Node.js の child_process モジュールを使用すると、子プロセスを作成して制御できるため、システム コマンドを実行したり、スクリプトを実行したり、メインの Node.js プロセス外でその他の操作を実行したりできます。 Node.js は、JavaScript を使用するランタイム環境で、多くの便利な機能を備えています。通常、イベント駆動型の非ブロッキング モデルを使用して単一のスレッドで動作し、待機せずにタスクを処理できます。ただし、実行する作業が多い場合は、child_process モジュールを使用して、スレッドではなく追加のサブプロセスを作成します。これらのサブプロセスは、組み込みのメッセージング システムを使用して相互に通信できます。

#### `exec()`, `execFile()`, `spawn()`, `fork()`の違い。

- exec(): シェルでコマンドを実行し、出力をバッファリングします。 
- execFile(): シェルを使用せずにファイルを直接実行します。単純なスクリプトやコマンドの場合は exec() よりも効率的です。 
- spawn(): 指定されたコマンドで新しいプロセスを起動し、stdin、stdout、stderr のストリームを提供します。 
- fork(): 新しい Node.js プロセスを生成し、親と子の間の通信チャネルを確立するように特別に設計された spawn() の特殊バージョンです。



## はしりがき

デフォルトでは、親 Node.js プロセスと生成されたサブプロセスの間に stdin、stdout、stderr のパイプが確立されます。これらのパイプには、制限された (プラットフォーム固有の) 容量があります。サブプロセスが出力をキャプチャせずにその制限を超えて stdout に書き込むと、サブプロセスはパイプ バッファーがさらにデータを受け入れるまでブロックします。これは、シェルのパイプの動作と同じです。出力を消費しない場合は、{ stdio: 'ignore' } オプションを使用します。 

env がオプション オブジェクト内にある場合、コマンド検索は options.env.PATH 環境変数を使用して実行されます。それ以外の場合は、process.env.PATH が使用されます。options.env が PATH なしで設定されている場合、Unix ではデフォルトの検索パス検索である /usr/bin:/bin で検索が実行され (execvpe/execvp については、オペレーティング システムのマニュアルを参照してください)、Windows では現在のプロセスの環境変数 PATH が使用されます。 

Windows では、環境変数の大文字と小文字は区別されません。 Node.js は env キーを辞書順に並べ替え、大文字と小文字を区別せずに一致する最初のキーを使用します。サブプロセスには最初の (辞書順の) エントリのみが渡されます。これにより、PATH や Path など、同じキーの複数のバリアントを持つオブジェクトを env オプションに渡すときに、Windows で問題が発生する可能性があります。 

child_process.spawn() メソッドは、Node.js イベント ループをブロックせずに、子プロセスを非同期的に生成します。child_process.spawnSync() 関数は、生成されたプロセスが終了するか終了するまでイベント ループをブロックする同期方式で同等の機能を提供します。

利便性のため、node:child_process モジュールは、child_process.spawn() および child_process.spawnSync() の同期および非同期の代替手段をいくつか提供します。これらの代替手段はそれぞれ、child_process.spawn() または child_process.spawnSync() の上に実装されます。 

- child_process.exec(): シェルを生成し、そのシェル内でコマンドを実行し、完了時に stdout と stderr をコールバック関数に渡します。 

- child_process.execFile(): child_process.exec() と似ていますが、デフォルトでは最初にシェルを生成せずにコマンドを直接生成します。 

- child_process.fork(): 新しい Node.js プロセスを生成し、親と子の間でメッセージを送信できる IPC 通信チャネルを確立して、指定されたモジュールを呼び出します。
 
- child_process.execSync(): Node.js イベント ループをブロックする child_process.exec() の同期バージョンです。 child_process.execFileSync(): Node.js イベント ループをブロックする child_process.execFile() の同期バージョンです。 シェル スクリプトの自動化などの特定のユース ケースでは、同期の対応の方が便利な場合があります。ただし、多くの場合、同期メソッドは、生成されたプロセスが完了するまでイベント ループを停止するため、パフォーマンスに大きな影響を与える可能性があります。

## [youtube] All you need to know about "child_process" in Node.js

https://www.youtube.com/watch?v=C1v4MXGhpcM

より。

worker threadsは同一プロセス内の（JavaScriptの）メインスレッドとは別のスレッドのこと。

child_processは`child_process.spawn()`したプロセスとは別のプロセスを生成すること

child_processで別のプロセスを生成したら、プロセス同士は独立である。

## [Node.js API] child_process.fork()

https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options

`child_process.fork()`は`ChildProcess`オブジェクトを返し、そのオブジェクトには親子間通信が可能なチャネルが組み込まれている。

通信に関しては`subprocess.send()`参照

生成された Node.js 子プロセスは、両者の間に確立される IPC 通信チャネルを除いて、親プロセスから独立していることに留意してください。各プロセスには独自のメモリがあり、独自の V8 インスタンスがあります。追加のリソース割り当てが必要になるため、多数の子 Node.js プロセスを生成することは推奨されません。

## テストファイルをindex.test.tsがimportして一括で実行するという方法

#### 情報収集

https://github.com/mochajs/mocha/issues/1792

（現状`ui`が`tdd`なので、`describe`は使わないけど...）

describe()はネストできるのを利用して、別モジュールのdescribe()をimportして実行させるという方法はありなのかも。

問題は、Hooksをどうやって制御するのかという問題。

#### テストモジュールごとにbeforeAll, beforeEachなどHooksを呼出せるか

そして別のテストモジュールで別のHooksが実行されないようにできるか？



#### [Mocha] 実行ライフサイクル

https://mochajs.org/#run-cycle-overview

> In a browser, test files are loaded by <script> tags, and calling `mocha.run()` begins at step 9 below.

SERIAL MODE:

- `global setup fixtures`を実行する
- rootの`suite`に対してMochaは`beforeAll` hooksを一度だけ実行する

#### [Mocha] ROOT HOOKS

https://mochajs.org/#available-root-hooks

> ブラウザでは、rootHooks オブジェクトを介してルートフックを直接設定できます: mocha.setup({ rootHooks: {beforeEach() {...}} })、mocha.setup() を参照してください。


`beforeAll`は、

- SERIAL MODEだとすべてのテストが実行される前に一度だけ実行される
- PARALLEL MODEだとすべてのテストが実行される前にファイルごとに実行される

`beforeEach`は、

- どちらのもーどでも各テスト前に実行される

`afterAll`は、

- SERIAL MODEだとすべてのテストが実行された後に一度だけ実行される
- PARALLEL MODEだとすべてのテストが実行された後にファイルごとに実行される


`afterEach`は、

- どちらのもーどでも各テスト後に実行される

> ヒント: どのモードでもコードが 1 回だけ実行されるようにする必要がある場合は、グローバル フィクスチャを使用します。



## テストランナーを使うという方法

...最早これ以上フレームワークについて調べたくない。

もっと広範に役に立つ知識を選択したいので、

やはりNode.js の child_processを選択することにする。

