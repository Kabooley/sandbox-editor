# Fix: file management

## TODOs

-   [TODO: monaco-editor との連携機能が完全でないので完成させること](#monaco-editorとの連携機能が完全でないので完成させること)
-   [TODO: file をリネームしたときに model を更新するようにする](#fileをリネームしたときにmodelを更新するようにする)
-   [Workspace 上のファイルクリックで selected を更新するようにすること](#Workspace上のファイルクリックでselectedを更新するようにすること)

低優先度：

-   [TODO:](#)
-   [TODO:](#)
-   [TODO:](#)

本ブランチ外の問題：

-   `Explorer`で新規フォルダを作ったら workspace 上そのフォルダを選択している状態にすること、且つ開いている状態にすること。
-   `Explorer`で新規アイテムを追加するときインデントが一段階不足しているので修正。
-   `Explorer`で新規アイテムをいずれかのフォルダに追加したらそのフォルダは開いている状態にすること。
-   エディタ上に`App.tsx`が開かれているとして現在エディタは index.tsx を表示しているとする、Explorer の Workspace 上の App.tsx ファイルをクリックしてもエディタに App.tsx が表示してくれない(つまり、現状タブを選択することでしかファイルの表示切替ができない)

## Summary

-   [エディタでファイル内容が更新された時の処理内容](#エディタでファイル内容が更新された時の処理内容)
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

## EditorContainer.tsx

#### エディタでファイル内容が更新された時の処理内容

ある file の`value`が更新されたら...

-   FilesContext.tsx の CHANGE_FILE アクションがディスパッチされる --> files の該当ファイルの value が更新される

-   EditorContainer.tsx の\_debouncedAddTypings()が呼び出される --> addExtraLibs が呼び出されてエディタで更新された file に該当する`IExtraLibs`が更新される

-   EditorContainer.tsx の\_debouncedBundle()が呼び出される --> 更新内容に応じてバンドルされる

ということでエディタで編集されたファイルは自動的に monaco の addExtraLib()で登録される。

```TypeScript
// EditorContainer.tsx

    /**
     * Dispatches code to FilesContext to update file's value.
     *
     * @param {string} code - current model code onDidChangeModelContent.
     * @param {string} path - File path of current model.
     *
     * */
    _onEditorContentChange(code: string, path: string) {
        this.props.dispatchFiles({
            type: filesContextTypes.Change,
            payload: {
                targetFilePath: path,
                changeProp: {
                    newValue: code,
                },
            },
        });
        this._debouncedBundle();
        this._debouncedAddTypings(code, path);
    }
```

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

## Workspace 上のファイルクリックで selected を更新するようにすること

既 opening ファイルをクリックしたらエディタ上で該当ファイルを表示するように selected を更新すること。

ちなみに OpenEditor ではできる。

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

## file をリネームしたときに model を更新するようにする

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
