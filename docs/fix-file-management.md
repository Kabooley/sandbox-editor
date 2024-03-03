# Fix: file management

## TODOs

-   [TODO: EditorContainer.tsx の addExtraLibs をファイルの更新のたびに実行しなくていいのか確認](#EditorContainer.tsx-のaddExtraLibsをファイルの更新のたびに実行しなくていいのか確認)
-   [TODO: monaco-editor との連携機能が完全でないので完成させること](#monaco-editorとの連携機能が完全でないので完成させること)
- [TODO: fileをリネームしたときにmodelを更新するようにする](#fileをリネームしたときにmodelを更新するようにする)

低優先度：

-   [TODO:](#)
-   [TODO:](#)
-   [TODO:](#)

本ブランチ外の問題：

-   `Explorer`の`Workspace`で新規ファイルを作成したらそのファイルを`selected: true`にすること。
-   `Explorer`で新規フォルダを作ったら workspace 上そのフォルダを選択している状態にすること。
-   `Explorer`で新規アイテムを追加するときインデントが一段階不足しているので修正。
-   `Explorer`で新規アイテムをいずれかのフォルダに追加したらそのフォルダは開いている状態にすること。
-   エディタ上に`App.tsx`が開かれているとして現在エディタは index.tsx を表示しているとする、Explorer の Workspace 上の App.tsx ファイルをクリックしてもエディタに App.tsx が表示してくれない(つまり、現状タブを選択することでしかファイルの表示切替ができない)

## Summary

-   [現状の MonacoEditor の挙動のおさらい](#現状のMonacoEditorの挙動のおさらい)
-   [snackexpo の monaco-editor の挙動のおさらい](#snackexpoのmonaco-editorの挙動のおさらい)

## 参考

snack expo の snack/website/src/client/components/Editor/MonacoEditor.tsx

## TODO: 現状の MonacoEditor の挙動のおさらい

mount 時:

-   `monaco.editor.create`でエディタインスタンスを生成する
-   `this._refEditor`でインスタンスを参照させておく
-   `this._disposable`に各イベントリスナを登録しておく
-   選択されているファイルがあれば`this._openFile(file)`
-   すべての仮想ファイルを`this._initializeFile(file)`
-   `resize`イベントハンドラをエディタインスタンスにつけておく

```TypeScript
// this._initializeFile()
/***
 * 渡されたfileをmonaco-editorのmodelとして登録する。
 *
 * @param {File} file - model登録するFile.
 *
 * 引数のfileの`monaco.editor.ITextModel`を生成する。
 * modelが生成済の場合、modelの変更内容をmodelに反映させる。
 * monaco-editorはmodelを生成すれば内部的にmodelを保存してくれて、
 * あとでmonaco.editor.getModels()などから取り出すことができる。
 *
 *
 * */


// _openFile()
/***
 * 渡されたFileに該当するmodelを現在のeditorインスタンスにアタッチする（表示する）
 *
 * */

```

update 時：

```TypeScript
/***
 *
 *
 * */
componentDidUpdate(prevProps: iProps, prevState: iState) {
    const { files, path, onEditorContentChange, ...options } = this.props;

    // props.pathによって決定される、選択されていなくてはならないファイル
    const selectedFile = files.find((f) => f.getPath() === path);
    // const previousFile = prevProps.files.find(f => f.getPath() === prevProps.path);

    if (this._refEditor) {
        console.log(`[MonacoEditor][did update] Selecting ${path}`);

        this._refEditor.updateOptions(options);

        // 現在editorに展開しているファイルのmodel
        const model = this._refEditor.getModel();
        const value = selectedFile?.getValue();

        // Change model and save view state if path is changed
        //
        // 多分ここの演算子は`!==`だったんじゃないかなぁ
        if (path === prevProps.path) {
            // Save the editor state for the previous file so we can restore it when it's re-opened
            editorStates.set(
                prevProps.path,
                this._refEditor.saveViewState()
            );

            selectedFile && this._openFile(selectedFile, true);
        } else if (model && value !== model.getValue()) {
            console.log(`[MonacoEditor][did update] excuteEdits ${path}`);

            // @ts-ignore
            this._refEditor.executeEdits(null, [
                {
                    range: model.getFullModelRange(),
                    text: value!,
                },
            ]);
        }
    }
}


```

## EditorContainer.tsx の addExtraLibs をファイルの更新のたびに実行しなくていいのか確認

`EditorContainer.tsx`の addExtraLibs の役割は、files の内容の自身への登録である。

これは`TypingLibsContext.tsx`の行っている addExtraLibs とは別で実行している。

（TypingLibsContext は依存関係を、EditorContainer では仮想ファイルを扱う。）

addExtraLibs に登録してある仮想ファイルは、その仮想ファイルの更新のたびに同期的に自動的に更新内容を反映してくれるわけではないので、手動で更新させなくてはならないはず。

なのでおそらく修正箇所は以下の通り：

-   `addExtraLibs`のコメントアウト部分を戻す
-   `componentDidMount`でファイルの更新を検査して更新アリのファイルを`addExtraLibs`へ送る。

```TypeSCript
    /***
     * Register path and code to monaco.language.[type|java]script addExtraLibs.
     * Reset code if passed path has already been registered.
     * */
    addExtraLibs(code: string, path: string) {
        // console.log(`[EditorContainer] Add extra Library: ${path}`);

        // const cachedLib = typingLibs.current.get(path);
        // if (cachedLib) {
        //     cachedLib.js.dispose();
        //     cachedLib.ts.dispose();
        // }
        // Monaco Uri parsing contains a bug which escapes characters unwantedly.
        // This causes package-names such as `@expo/vector-icons` to not work.
        // https://github.com/Microsoft/monaco-editor/issues/1375
        let uri = monaco.Uri.from({
            scheme: 'file',
            path: path,
        }).toString();
        if (path.includes('@')) {
            uri = uri.replace('%40', '@');
        }

        const js = monaco.languages.typescript.javascriptDefaults.addExtraLib(
            code,
            uri
        );
        const ts = monaco.languages.typescript.typescriptDefaults.addExtraLib(
            code,
            uri
        );
        // typingLibs.current.set(path, { js, ts });
    }
```

TODO: ファイル更新のたびに extralibs はどうなっているのか確認すること

## monaco-editor との連携機能が完全でないので完成させること

以下の３つ：

-   model 切り替え
-   model を閉じる
-   model を開く

現状確認できるバグ：

#### model を閉じる

selected: true の File が一つもない場合に対応する。

`filesOpening`が空の場合は`MonacoEditor`を返す代わりに`EditorNoSelectedFile`を返す。

`EditorNoSelectedFile`を返すことになる場合、

`MonacoEditor`はアンマウントされてすべての model が dispose される。

`MonacoEditor`を再度マウントするとき、改めて model が生成される。

```TypeScript
// EditorContainer.tsx
    render() {
        const selectedFilePath = this.props.files.find((f) => f.isSelected());
        const filesOpening = this.getFilesOpening(this.props.files);

        if (filesOpening.length) {
            return (
                <div className="editor-container">
                    <TabsAndActionsContainer
                        selectedFile={selectedFilePath}
                        onChangeSelectedTab={this._onChangeSelectedTab}
                        width={this.props.width}
                        filesOpening={filesOpening}
                    />
                    <MonacoEditor
                        files={this.props.files}
                        selectedFile={selectedFilePath}
                        onEditorContentChange={this._onEditorContentChange}
                        onDidChangeModel={this._onDidChangeModel}
                        {...editorConstructOptions}
                    />
                </div>
            );
        } else {
            return (
                <div className="editor-container">
                    <TabsAndActionsContainer
                        selectedFile={selectedFilePath}
                        onChangeSelectedTab={this._onChangeSelectedTab}
                        width={this.props.width}
                        filesOpening={filesOpening}
                    />
                    <EditorNoSelectedFile />
                </div>
            );
        }
    }
```

snack expo では選択されたファイルがない場合は`NoSelectedFile`というコンポーネントを MonacoEditor のコンポーネントの代わりに返すのを参考にした。

https://github.com/expo/snack/blob/20797c84072296c62482f3ab1d29f054c089d3ba/website/src/client/components/EditorView.tsx#L605

## 走り書き

#### form

```TypeScript
import React, { useState, useEffect } from "react";

const Form: React.FC<{}> = () => {
  const [value, setValue] = useState<string>('');
  const [submitted, setSubmitted] = useState<string>('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setValue(e.currentTarget.value);
  }

  const onSubmit= (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      form: { value: string }
    };
    setSubmitted(target.form.value);
    setValue("");
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input type="text" value={value} onChange={onChange} name="form" />
      </form>
      <div>
        <span>{submitted}</span>
      </div>
    </div>
  );
}

export default Form;
```

## fileをリネームしたときにmodelを更新するようにする



## snackexpo の monaco-editor の挙動のおさらい

mount 時：

-   すべてのファイルに対して `this._initializeFile()`を呼び出す

`this._initializeFile`:

引数の File の model を生成する

model が生成済の場合、引数 file の変更内容を既存 model に反映させる。
既存の model がなかった場合、新規の model を作成する。

monaco-editor は model を生成すれば内部的に model を保存してくれて、あとで monaco.editor.getModels()などから取り出すことができる。

update 時：

-   選択されているファイルが変更されていたら、以前の選択されていたファイルの editorstate を保存する（`editorStates.set(prevProps.selectedFile, this.\_editor.saveViewState()）

-   選択されているファイルが変更されたら、エディタの表示を切り替えるために this.\_openFile を呼出す

-   選択されているファイルが変更されていないけれど、内容が更新されている場合、this.\_editor.executeEdits()を呼び出して更新内容を model へ反映させる

-   files に変更があれば（この条件分岐は意味がない気がする。React においてオブジェクト配列同士の比較は必ず一致しないだろ）全てのファイルに対して this.\_initializeFile()を呼び出す

-   独自 linter の結果を updateMarkers で反映させる
-   依存関係の変更があれば依存関係を取得させる
-   mode に変更があればモードを切り替える
-   theme に変更ああればテーマを切り替える

ここからわかること：

model は file の内容更新に合わせて手動で更新しなくてはならない。

疑問：

model の生成と更新を完全に行えばファイルの内容を addExtraLibs へ登録する必要がない？
