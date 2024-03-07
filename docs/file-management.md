# file management

テキス・トエディタとして sandbox-editor が扱う仮想ファイルの管理について、

ファイルの追加、削除、変更でそれぞれどういった処理がされるのか記録する。

他。

## TODOs

-   [TODO: ](#)
-   [TODO: ](#)
-   [TODO: ](#)

低優先度：

-   [TODO: package.json が依存関係の更新で裏側で更新されても extraLibs の package.json は更新されていない件](#package.jsonが依存関係の更新で裏側で更新されてもextraLibsのpackage.jsonは更新されていない件)
-   [TODO: FilesContext で File の利用をやめてそのままオブジェクトを利用する](#FilesContextでFileの利用をやめてそのままオブジェクトを利用する)
-   [TODO: ReactJSX の色付け](#ReactJSXの色付け)

本ブランチ外の問題、未実装内容：

-   `Explorer`で新規フォルダを作ったら workspace 上そのフォルダを選択している状態にすること、且つ開いている状態にすること。
-   `Explorer`で新規アイテムを追加するときインデントが一段階不足しているので修正。
-   `Explorer`で新規アイテムをいずれかのフォルダに追加したらそのフォルダは開いている状態にすること。
-   エディタ上に`App.tsx`が開かれているとして現在エディタは index.tsx を表示しているとする、Explorer の Workspace 上の App.tsx ファイルをクリックしてもエディタに App.tsx が表示してくれない(つまり、現状タブを選択することでしかファイルの表示切替ができない)

-   Explorer の未実装機能を実装する
-   HEADER に preview のトグルボタン、Explorer のトグルボタン、アプリケーションのタイトル
-   FOOTER の機能を最低限にする
-   icon をそろえる
-   TabsAndActions のアクションバー
-   EditorSelectedNoFIle の状態の Editor 表示領域の表示内容
-   ショートカット(タブ移動、)
-

## Summary

-   [参考](#参考)
-   [files 管理](#files管理)

-   [エディタでファイル内容が更新された時の処理内容](#エディタでファイル内容が更新された時の処理内容)
-   [現状の MonacoEditor の挙動のおさらい](#現状のMonacoEditorの挙動のおさらい)
-   [snackexpo の monaco-editor の挙動のおさらい](#snackexpoのmonaco-editorの挙動のおさらい)

## 参考

snack expo の snack/website/src/client/components/Editor/MonacoEditor.tsx

#### snackexpo の monaco-editor の挙動のおさらい

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

## files 管理

-   [作成](#作成)
-   [削除](#削除)
-   [value 変更](#value変更)
-   [path 変更](#path変更)

#### value 変更

トリガー：

-   [1. ユーザがエディタでファイルを編集した](#1.-ユーザがエディタでファイルを編集した)
-   [2. `package.json`が依存関係取得結果反映のために内部的に編集された](#2.-`package.json`が依存関係取得結果反映のために内部的に編集された)

##### 1. ユーザがエディタでファイルを編集した

エディタ編集に因るファイル変更で処理されること：

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

##### 2. `package.json`が依存関係取得結果反映のために内部的に編集された

sandbox-editor はマウント時、または直接仮想ファイルの`package.json`が編集されたとき依存関係取得処理が内部的に実施されて、その取得結果を自動的に仮想ファイルの`package.json`へ反映する。

そのためユーザによる編集によって変更されたのち、依存関係を取得し依存関係の取得が実際成功したか失敗したか、バージョンが直されたかするとユーザによる編集内容通りにファイルが変更されない場合もある。

詳しくは依存関係管理に関する`docs/improve-dependency-management.md`を参照。

#### 削除

トリガー:

-   Explorer/Workspace のファイルリストのアクションで削除ボタンが押された

file 削除がトリガーされたら起こること：

-   LayoutContext.tsx で削除の確認モーダルを表示する
-   (確認が取れたら)FilesContext.tsx で context の files から該当ファイルを削除する
-   EditorContainer.tsx で登録してある`monaco-editor`の`IExtraLibs`から該当ファイルを dispose する。

files から該当ファイルを削除するだけではなく、monaco-eidtor の extralibs に登録してある情報を手動で削除しておかないと該当ファイルが extralibs に残り続けてしまう。

```TypeScript
// src/components/VSCodeExplorer/Workspace/index.tsx
    const handleDeleteNode = (_explorer: iExplorer) => {
        const isDeletionTargetFolder = _explorer.isFolder;
        const descendantPaths: string[] = getAllDescendants(_explorer).map(
            (d) => d.path
        ) as string[];

        const deletionTargetPathArr = _explorer.path.split('/');

        const deletionTargetFiles: File[] = files.filter((f) => {
            // In case deletion target is folder and f is also folder.
            if (f.isFolder() && isDeletionTargetFolder) {
                const comparandPathArr = f.getPath().split('/');
                if (deletionTargetPathArr.length > comparandPathArr.length)
                    return false;

                let completeMatch: boolean = true;
                deletionTargetPathArr.forEach((p, index) => {
                    completeMatch =
                        p === comparandPathArr[index] && completeMatch;
                });

                // return completeMatch ? false : true;
                return completeMatch ? true : false;
            }
            // In case deletion target is a file, not any folder.
            else if (!descendantPaths.length) {
                return f.getPath() === _explorer.path;
            }
            // In case deletion target is folder but f is not folder.
            return descendantPaths.find((d) => d === f.getPath())
                ? true
                : false;
        });

        const callback = () => {
            // やってほしいこと
            filesDispatch({
                type: Types.DeleteMultiple,
                payload: {
                    requiredPaths: deletionTargetFiles.map((d) => d.getPath()),
                },
            });

            // モーダルの解除
            dispatchLayoutContextAction({
                type: LayoutContextActionType.RemoveModal,
                payload: {
                    modalType: isDeletionTargetFolder
                        ? ModalTypes.DeleteAFolder
                        : ModalTypes.DeleteAFile,
                },
            });
        };

        dispatchLayoutContextAction({
            type: LayoutContextActionType.ShowModal,
            payload: {
                modalType: isDeletionTargetFolder
                    ? ModalTypes.DeleteAFolder
                    : ModalTypes.DeleteAFile,
                callback: callback,
                fileName: _explorer.name,
            },
        });
    };

```

```TypeScript
// src/components/EditorContainer.tsx
    componentDidUpdate(prevProp: iProps, prevState: iState) {

        if (prevProp.files.length > this.props.files.length) {
            console.log('[EditorContainer] SOme file must have deleted.');
            const prevFilesPath = prevProp.files.map((pf) => pf.getPath());
            const currentFilesPath = this.props.files.map((pf) => pf.getPath());
            // deletedFile: prevFilesPathには存在してcurrentFilesPathには存在しない要素からなる配列
            const deletedFiles = prevFilesPath.filter(
                (pf) => currentFilesPath.indexOf(pf) === -1
            );
            deletedFiles.forEach((df) => this._removeFileFromExtraLibs(df));
        }
    }

    /***
     * Dispose monaco-editor IExtraLibs.
     *
     * */
    _removeFileFromExtraLibs(path: string) {
        console.log(`[EditorContainer][removeFileFromExtraLibs] ${path}`);

        const cachedLib = extraLibs.get(path);
        if (cachedLib) {
            cachedLib.js.dispose();
            cachedLib.ts.dispose();
            extraLibs.delete(path);
        }
    }
```

## EditorContainer.tsx

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

#### emoji search

```TypeScript

import React, { useState } from "react";

const Header: React.FC<{}> = () => {
  return (
      <header className="component-header">
        <img
          src="//cdn.jsdelivr.net/emojione/assets/png/1f638.png"
          width="32"
          height="32"
          alt=""
        />
        Emoji Search
        <img
          src="//cdn.jsdelivr.net/emojione/assets/png/1f63a.png"
          width="32"
          height="32"
          alt=""
        />
      </header>
  );
}

// -----


import React from "react";
import PropTypes from "prop-types";

import "./SearchInput.css";

interface iProps {
  textChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default class SearchInput extends React.Component<iProps, {}> {
  static propTypes = {
    textChange: PropTypes.func
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.textChange(e);
  };

  render() {
    return (
      <div className="component-search-input">
        <div>
          <input onChange={this.handleChange} />
        </div>
      </div>
    );
  }
}

// ----


import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Clipboard from "clipboard";

import EmojiResultRow from "./EmojiResultRow";
import "./EmojiResults.css";

interface iProps {
  emojiData: {
    title: string;
    symbol: string;
  }[];
}

export default class EmojiResults extends React.Component<iProps, {}> {

  componentDidMount() {
    this.clipboard = new Clipboard(".copy-to-clipboard");
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  render() {
    return (
      <div className="component-emoji-results">
        {this.props.emojiData.map(emojiData => (
          <EmojiResultRow
            key={emojiData.title}
            symbol={emojiData.symbol}
            title={emojiData.title}
          />
        ))}
      </div>
    );
  }
}
```
