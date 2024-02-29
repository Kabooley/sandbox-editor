# Fix: file management

## TODOs

-   [TODO: 新規ファイルを workspace で生成してエディタに表示させたのち、エディタ表示ファイルを切り替えると新規ファイルの内容が切り替えたファイルになる件](#TODO:-新規ファイルをworkspaceで生成してエディタに表示させたのち、エディタ表示ファイルを切り替えると新規ファイルの内容が切り替えたファイルになる件)
-   [TODO: 現状の MonacoEditor の挙動のおさらい](#TODO:-現状のMonacoEditorの挙動のおさらい)
-   [TODO: タブの閉じるボタンで閉じるとエラーになる件](#タブの閉じるボタンで閉じるとエラーになる件)
-   [TODO: EditorContainer.tsx の addExtraLibs メソッドで dispose しなくていいのか確認](#EditorContainer.tsxのaddExtraLibsメソッドでdisposeしなくていいのか確認)
-   [TODO:](#)
-   [TODO:](#)

低優先度：

-   [TODO:](#)
-   [TODO:](#)
-   [TODO:](#)

本ブランチ外の問題：

-   `Explorer`の`Workspace`で新規ファイルを作成したらそのファイルを`selected: true`にすること。
-   `Explorer`で新規フォルダを作ったら workspace 上そのフォルダを選択している状態にすること。
-   `Explorer`で新規アイテムを追加するときインデントが一段階不足しているので修正。
-   `Explorer`で新規アイテムをいずれかのフォルダに追加したらそのフォルダは開いている状態にすること。

## TODO: 新規ファイルを workspace で生成してエディタに表示させたのち、エディタ表示ファイルを切り替えると新規ファイルの内容が切り替えたファイルになる件

EditorContainer.tsx で`onDidChangeModel()関数が定義されていなかった...

#### 参考

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

## form

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

## EditorContainer.tsx の addExtraLibs メソッドで dispose しなくていいのか確認

コメントアウトしているけど、ファイルの更新内容を反映させる場合 cachedLib は dispose するべきなのでは？

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
