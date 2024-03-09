# Note monaco-editor

## Summary

- [`model`管理](#`model`管理)

## `model`管理

monaco-editor のエディタに展開しているファイルのことを`model`と呼ぶ。

(厳密には`monaco.editor.ITextModel`という型の monaco-editor 独自の値)。

この`model`と sandbox-editor の仮想ファイルとの連携について。

この`model`はアプリケーションでは`EditorContainer.tsx`と`MonacoEditor.tsx`が主に取り扱う。

#### model を閉じる

FilesContext.tsx から提供された更新された fiels の中に、

selected: true の File が一つもない場合に対応する。

ただし、**monaco-editor には`model`を閉じるという機能はない**。

monaco-editor は`setModel`と`getModel`しかない。

そのため、開いているファイルが一つもないという状況を作るには monaco-editor の editor インスタンス自体を閉じる必要がある。

そこで、

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
