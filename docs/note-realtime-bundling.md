# Note Real time bundling

目指すもの：ユーザの入力内容に応じて即時エディタのコード全体のバンドリングリクエストを送信し、previewへ結果を反映させる。

## TODO

- TODO: [ユーザ入力追跡機能](#ユーザ入力追跡機能)

## ユーザ入力追跡機能


#### 現状の入力の取得方法

MonacoEditor.tsx
    `editorInstance.onDidChangeModelContante(this._handleEditFile)`
    `this.props.onEditorContentChange(value, path)`

EditorContainer.tsx
    ユーザの入力内容を即時該当fileへ反映させるため入力内容をcontextへdispatchしている
    `_onEditorContanteChange::this.props.dispatchFiles({filesContextTypes.Change})`

#### バンドリング・コンテキスト

`./src/context/BundleContext.tsx`

ProviderをEditorContainerとPreviewの両者の上位に置いたのでバンドリング情報を両者にまたがって提供できる

EditorContainer.tsxまたはMonacoEditor.tsxでbundle.workerでコード送信

workerから結果を取得してBundleContextへ結果をdispatch

context経由でpreviewへ反映させる

#### 実装：入力追跡機能

TODO: class component における setTimeoutの使い方

EditorContainer.tsx

timerをセットする必要があるので、副作用を起こせるcomponentDidUpdateで定義する必要があるのかも。

```TypeScript
state = {
    // ...
    timer: /* webapi.setTimeout timer */
};

componentDidUpdate(prevProp: iProps, prevState: iState) {
    const { files } = this.props;

    const selectedFile = files.find((f) => f.isSelected());
    if (prevState.currentFilePath !== selectedFile?.getPath()) {
        selectedFile &&
            this.setState({
                currentFilePath: selectedFile.getPath(),
                currentCode: selectedFile.getValue(),
            });
    }

    const prevFile = prevProp.files.find(f => f.getPath() === selectedFile.getPath());
    if(prevFile.getValue() !== selectedFile.getValeu()) {
        let timer = setTimeout(() => {
            this._bundleWorker.postMessage({
                // ...
            });
        }, 750);
    }
}

_setTimer(callback: () => void, delay: number) {
    this._timer = setTimeout(callback(), delay);
};

_resetTimer() {
    this._timer
}

```

参考： stephan-portfolio-course

```TypeScript

  useEffect(() => {
    if(!bundle) {
      createBundle(cell.id, cell.content);
      return;
    }

    const timer = setTimeout(async () => {
      createBundle(cell.id, cell.content);
    }, 750);

    return () => {
      clearTimeout(timer);
    };
  }, [cell.content, cell.id, createBundle]);

```