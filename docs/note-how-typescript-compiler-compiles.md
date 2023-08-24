# Note: TypeScript Compiler Compiles

https://github.com/microsoft/TypeScript-Compiler-Notes

## Compile Process

start
- Read tsconfig.json: プログラムのセットアップ
- Pre-process Files: importをたどってすべてのたどれるファイルを見つける
- Tokenize and Parse: テキストを後から使うためにSyntaxTreeへ変換する
- Binder: SyntaxTreeの識別子をsymbolへ変換する
- Type Check: 
- Transform: syntaxtreeをtsconfigの設定に沿うように変更する
- Emit: syntaxtreeを.jsや.d.tsや他のファイルへ出力する
done

#### SyntaxTreeを生成するために

code(text) --> scanner --> token --> parser --> SyntaxTree

SyntaxTreeの見た目はどんなのか？：

typescript.org/playで確認できる

https://ts-ast-viewer.com/#code/

`SourceFile` オブジェクトは、

ファイル名やソース テキストなどの追加情報を含む、特定のファイルの AST を表します。

つまり、`SourceFile`は一つのファイルにつき一つである。

`SourceFile`にはASTのNode情報や、symbol情報が入っている。


#### Type Checking

this is equivalent in checking syntax tree.

binder:

syntax --> symbolsを生成してnodeを結びつける仕事をしたりする。

つまり、syntax treeに追加情報を施す処理を行う。

Symbolsの生成は、

globaleスコープにある関数スコープへ関数スコープであることの識別子を与えるような仕事である。

以上の過程は、`createSourceFile`APIを呼び出すことで`SourceFile`が生成される過程に含まれる。

今のことろ、Symbolは一つのファイル内部で見られる名前付きのエンティティを表しているが、

複数の宣言で複数のファイルをマージできるため、次のステップでは、`Program`をビルドしてコンパイル内のすべてのファイルのグローバル ビューを構築します。

`Program`は`SourceFile`のコレクションであり、`CompilerOptions`のセットでもある。

`Program`インスタンスから`TypeChecker`が生成できる。

type checker:

tsの75%のコードはtype checkerである。

> これは、異なるファイルのシンボル間の関係を把握し、シンボルにタイプを割り当て、セマンティックな診断 (つまり、エラー) を生成する役割を果たします。 TypeChecker が最初に行うことは、異なる SourceFiles からのすべてのシンボルを 1 つのビューに統合し、共通のシンボル (複数のファイルにまたがる名前空間など) を「マージ」することによって 1 つのシンボル テーブルを構築することです。

ここが複数のファイルにまたがっての型診断処理をしている部分なんだね。



#### Creating Files

emitter:

syntax tree --> filesへ変換する仕事。

エミッタは、特定の`Program`から作成することもできます。エミッタは、指定された SourceFile に対して必要な出力を生成する責任があります。これには、.js、.jsx、.d.ts、および .js.map の出力が含まれます。

transformers:

syntax tree --> syntax tree (without typescript code)

EcmaScriptのバージョンにあわせて変換できる。