# Feature implementation: Footer

アプリケーションのフッターを作成する。

## 参考

VSCode 公式 UI 各部名称:

https://code.visualstudio.com/docs/getstarted/userinterface

statusbar: 開いているプロジェクトおよび編集中のファイルに関する情報
sidebar: エラー数や警告数や git branch など

## summary

-   editor status including errors
-   problems prompt
-   [current cursor position](#cursor-position)
-   [amount of spaces for tab key](#tab-size)
-   [prettier format button](#format-manually-button)
-   [displaying current model's file language](#display-current-file-language)
-   editor setting

多分要らない

-   character encoding code
-   select end of line sequence

## TODOs

-   monaco 自体をグローバル管理した方がいい？

## footer section

## status

参考：

snack の panel コンポーネント：
https://github.com/expo/snack/blob/8c8d25140973a7c3ceb300f9c249312a4cb112ad/website/src/client/components/EditorPanels.tsx#L12

stack trace の参考になるかも？:
https://github.com/expo/snack/blob/8c8d25140973a7c3ceb300f9c249312a4cb112ad/website/src/client/components/ProblemsPanel.tsx#L4

#### Error

https://github.com/microsoft/monaco-editor/issues/906

https://github.com/microsoft/monaco-editor/issues/1541

https://github.com/microsoft/monaco-editor/issues/906

https://github.com/expo/snack/blob/8c8d25140973a7c3ceb300f9c249312a4cb112ad/website/src/client/components/Editor/MonacoEditor.tsx#L640

https://github.com/microsoft/TypeScript-Website/blob/7641e4f0bb477b5d8ff7d78d421e441af0ba7370/packages/playground/src/sidebar/showErrors.ts#L6

-   monaco.editor.getModelmarkers()からエラー（警告他）を取得する
-   moanco.editor.onDidchangeModelMarkers()のタイミングで更新する
-   IMarkerData から、Panel へ表示するエラースタックとレースを組み立てる

文法エラー等があれば、`2 SyntaxError, 1 Warning`のような表記を statusbar へ表示する。

エラースタックなど詳細を prompt や problems へ表示させる

```JavaScript
// monaco-editor getModelMarkersの戻り値の中身：

[
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "6133",
        "severity": 1,
        "message": "'asshole' is declared but its value is never read.",
        "startLineNumber": 5,
        "startColumn": 1,
        "endLineNumber": 5,
        "endColumn": 31,
        "relatedInformation": [],
        "tags": [
            1
        ]
    },
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "1192",
        "severity": 8,
        "message": "Module '\"file:///src/App\"' has no default export.",
        "startLineNumber": 4,
        "startColumn": 8,
        "endLineNumber": 4,
        "endColumn": 11,
        "relatedInformation": [],
        "tags": []
    },
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "2307",
        "severity": 8,
        "message": "Cannot find module './youare' or its corresponding type declarations.",
        "startLineNumber": 5,
        "startColumn": 21,
        "endLineNumber": 5,
        "endColumn": 31,
        "relatedInformation": [],
        "tags": []
    },
    {
        "resource": {
            "$mid": 1,
            "fsPath": "\\src\\index.tsx",
            "_sep": 1,
            "external": "file:///src/index.tsx",
            "path": "/src/index.tsx",
            "scheme": "file"
        },
        "owner": "typescript",
        "code": "2786",
        "severity": 8,
        "message": "'React.StrictMode' cannot be used as a JSX component.\n  Its return type 'ReactNode' is not a valid JSX element.\n    Type 'undefined' is not assignable to type 'Element | null'.",
        "startLineNumber": 12,
        "startColumn": 6,
        "endLineNumber": 12,
        "endColumn": 22,
        "relatedInformation": [],
        "tags": []
    }
]
```

上記のようなオブジェクトが配列で返される

Enumeration MarkerSeverity

https://microsoft.github.io/monaco-editor/typedoc/enums/MarkerSeverity.html#Hint

Error: 8
Hint: 1
Info: 2
Warning: 4

snack のエラーと警告の取得方法：

```TypeScript
// https://github.com/expo/snack/blob/8c8d25140973a7c3ceb300f9c249312a4cb112ad/website/src/client/types.tsx#L138

export enum AnnotationSeverity {
  LOADING = -1,
  IGNORE = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  FATAL = 4,
}

export type AnnotationAction = {
  title: string;
  icon?: React.ComponentType<any>;
  run: () => void;
};

export type AnnotationLocation = {
  fileName: string;
  startLineNumber: number;
  endLineNumber: number;
  startColumn: number;
  endColumn: number;
};

export type Annotation = {
  message: string;
  severity: AnnotationSeverity;
  source: 'Device' | 'Web' | 'JSON' | 'ESLint' | 'Dependencies';
  location?: AnnotationLocation;
  action?: AnnotationAction;
};

```

#### marker からスタックとレースの組み立て

```bash
# スタックトレース例
/Users/hoo/bar/hoge.js:10:3
    hoge(): asshole {
            ^

ReferenceError: 'asshole' is not defined
    at hoge (/Users/hoo/bar/hoge.js:10:3)
    at hoge (/Users/hoo/bar/hoge.js:10:3)
    at hoge (/Users/hoo/bar/hoge.js:10:3)
    at hoge (/Users/hoo/bar/hoge.js:10:3)
    at hoge (/Users/hoo/bar/hoge.js:10:3)
    at hoge (/Users/hoo/bar/hoge.js:10:3)
    at hoge (/Users/hoo/bar/hoge.js:10:3)
```

#### marker 取得タイミング

`monaco.editor.onDidChangeMarkers`を使え。

```TypeScript
// MonacoEditor.tsx

    this._disposables.push(
        monaco.editor.onDidChangeMarkers(this._handleChangeMarkers)
    );

    _handleChangeMarkers() {
        const model = this._refEditor && this._refEditor.getModel();
        if (model === null) return;
        const uri = model.uri;
        const markers = monaco.editor.getModelMarkers({ resource: uri });

        // DEBUG:
        console.log(`[MonacoEditor][_handleChangeMarkers] ${uri}`);
        console.log(markers);
    }

```

## tab size

https://github.com/Microsoft/monaco-editor/issues/270#issuecomment-273263768

https://stackoverflow.com/questions/41107540/how-can-i-set-the-tab-width-in-a-monaco-editor-instance

tabSize は model 毎に生成されるので、モデルが切り替わったらそのたび tab サイズ表記を更新する必要がある。

-   onchangemodel
-   onchangemodeloptions(そんなものがあるかはさておき)

上記のようなタイミングでタブサイズ表記を更新。

現在のモデルを取得する方法:

```TypeScript
// editorインスタンスを取得しているなら
const currentModel = editorInstance.getModel();
// 現在のモデルのパスがわかっているならば
const currentModel = monaco.editor.getModels().find(m => m.uri.path === modelsPath);

```

## cursor position

https://github.com/microsoft/monaco-editor/issues/2588

https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.ICursorPositionChangedEvent.html

https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneCodeEditor.html#onDidChangeCursorPosition

これを使うには、monaco-editor の editor インスタンスが必要になる。

現在の editor インスタンスを参照する方法：

https://github.com/microsoft/monaco-editor/issues/435

> There is no way AFAIK. A reference to the editor object returned by monaco.editor.create must be saved.

と開発メンバが言っているのでその通りなのかと。

```TypeScript
// MonacoEditor.tsx
/**
 * - TODO: pass callback to listener of monaco.IStandaloneCodeEditor.onDidChangeCursorPosition().
 *
 * */
    componentDidMount() {
        const { files, path, onEditorContentChange, ...options } = this.props;

        // Generate Editor instance.
        const editor = monaco.editor.create(
            this._refEditorNode.current as HTMLDivElement,
            options
        );
        this._refEditor = editor;

        this._disposables = [editor];

        this._disposables.push(
            editor.onDidChangeModelContent(this._handleEditFile)
        );
        this._disposables.push(
            editor.onDidChangeModel(this._handleChangeModel)
        );

        // NOTE: new added.
        this._disposable.push(
            editor.onDidChangeCursorPosition(this._handleChangeCursorPosition)
        );

        // ...
    }

    // handler might be like this...
    _handleChangeCursorPosition(e: monaco.editor.ICursorPositionChangedEvent) {
        const { position } = e;
        this.props.getCursorPosition(position);
    }
```

```JavaScript
// ICursorPositionChangedEventの中身。
{
    "position": {
        "lineNumber": 4,
        "column": 1
    },
    "secondaryPositions": [],
    "reason": 0,
    "source": "keyboard"
}
```

どうらや`position`の情報が必要なものみたい。

## format manually button

手動で format させるボタン

## display current file language

model からひっぱってくることになる。

## styling

参考：codesandbox のフッタ。

```css
.footersection {
    background-color: rgb(52, 52, 52);
    color: rgb(255, 255, 255);
    position: fixed;
    display: flex;
    bottom: 0px;
    right: 0px;
    left: 0px;
    width: 100%;
    height: 22px;

    /* monaco-editorが上に乗っかって表示されるので */
    z-index: 10;
}
```


{
    min-height: 100%;
    height: 100%;
    background: #040404;
    color: #999;
    font-size: 16px!important;
}