# Improvement Preview view

## summary

-   [[問題修正] react-resizable がある方向へリサイズできない問題](#[問題修正]-react-resizableがある方向へリサイズできない問題)
-   [[問題修正] iframe を垂直方向の画面いっぱいまで広げていない](#[問題修正]-iframeを垂直方向の画面いっぱいまで広げていない)
-   [react-resizable:リサイズに制限を設けたいとき](#react-resizable:リサイズに制限を設けたいとき)
-   [browser 窓リサイズ対応](#browser窓リサイズ対応)
-   [スクロールバーを最小限にする](#スクロールバーを最小限にする)
-   [フォントサイズ統一](#フォントサイズ統一)
-   [webpack-dev-server Compiled with problems](#webpack-dev-server-Compiled-with-problems)
-   [lodash をインストールするときの注意点](#lodashをインストールするときの注意点)

## 参考

-   [react-resizable の`infinite loop`エラーに関する issue](https://github.com/WICG/resize-observer/issues/38)

## iframe を垂直方向の画面いっぱいまで広げていない

現状 preview はリサイザブルに囲われていない。

```html
<splitPane>
    <div class="react-resizable" ...><!-- pane --></div>
    <div class="react-resizable" ...><!-- editor section --></div>
    <div class="preview-section" ...>
        <!-- preview section -->
    </div>
</splitPane>
```

今、以下を設定すると preview-section の右側方向へのリサイズができなくなる。

```css
/* iframe */

element.style {
    width: 100%;
    height: 100vh;
}
```

EditorSection.tsx をまるっとコピーしてみた

```TypeScript
import React, { useState } from "react";
import { ResizableBox } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import Preview from "../components/Preview";

const defaultWidth = 400;

const PreviewSection = (): JSX.Element => {
  const [sectionWidth, setSectionWidth] = useState<number>(defaultWidth);

  const onResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
      setSectionWidth(size.width);
  };

  return (
      <ResizableBox
        width={sectionWidth}
        height={Infinity}
        minConstraints={[200, Infinity]}
        onResize={onResize}
        resizeHandles={['e']}
        handle={(h, ref) => (
          <span
              className={`custom-handle custom-handle-${h}`}
              ref={ref}
          />
        )}
      >
        <div
          className="preview-section" style={{ width: sectionWidth }}>
          <Preview />
        </div>
      </ResizableBox>
    );
};

export default PreviewSection;
```

## react-resizable がある方向へリサイズできない問題

結論：`:after`要素を drag 中のみ生成させる

Udemy の講座で解決策が示された。

問題：

次のようなコードで、水平方向へ要素をリサイズさせると、右側方向へのリサイズができなくなる問題。

```TypeScript
// Layout/index.tsx
const Layout = (): JSX.Element => {
    return (
        <>
            <Header />
            <MainContainer>
                <NavigationSection />
                <SplitPane>
                  <Pane />
                  <EditorSection />
                  <PreviewSection />
                </SplitPane>
            </MainContainer>
        </>
    );
};

// EditorSection.tsx
import React, { useState, useRef } from 'react';
import { ResizableBox } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import EditorContext from '../context/EditorContext';

const defaultWidth = '600';

const EditorSection = (): JSX.Element => {
    const [editorSectionWidth, setEditorSectionWidth] = useState<number>(600);

    const onEditorSecResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        setEditorSectionWidth(size.width);
    };

    return (
        <ResizableBox
            width={editorSectionWidth}
            height={Infinity}
            minConstraints={[200, Infinity]}
            maxConstraints={[window.innerWidth * 0.7, Infinity]}
            onResize={onEditorSecResize}
            resizeHandles={['e']}
            handle={(h, ref) => (
                <span
                    className={`custom-handle custom-handle-${h}`}
                    ref={ref}
                />
            )}
        >
            <div
                className="editor-section"
                style={{ width: editorSectionWidth }}
            >
                <EditorContext />
            </div>
        </ResizableBox>
    );
};

export default EditorSection;

// PreviewSection.tsx
import React from 'react';
import Preview from '../components/Preview';

const PreviewSection = (): JSX.Element => {

    return (
        <div className="preview-section">
            <Preview />
        </div>
    );
};

export default PreviewSection;
```

つまり、兄弟要素どうしてである EditorSection と PreviewSection であるが、

前者は React-Resizable の ResizableBox で囲われている。

EditorSection は水平方向へリサイズでき、PreviewSection はその影響を受ける。

解決策：

疑似要素をリサイズ時に生成する

```css
.react-draggable-transparent-selection .preview-section:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0;
}
```

これをするとリサイズが問題なく（いまのところ）行われる。

## react-resizable:リサイズに制限を設けたいとき

react-resizable `ResizableProps`の`maxConstraints`または`minConstraints`で制限を設けることができる。

これを設定することで無限に拡大（縮小）できてしまうリサイズを制限できる。

```TypeScript
// JSX
  <ResizableBox
      width={paneWidth}
      height={Infinity}
      // NOTE: 100pxを最小値とする
      minConstraints={[100, Infinity]}
      // NOTE: window幅の40%までのサイズを最大とする
      maxConstraints={[window.innerWidth * 0.4, Infinity]}
      onResize={onPaneResize}
      resizeHandles={['e']}
      handle={(h, ref) => (
          <span
              className={`custom-handle custom-handle-${h}`}
              ref={ref}
          />
      )}
  >
      <div className="pane" style={{ width: paneWidth }}>
          <FileExplorer />
      </div>
  </ResizableBox>

```

## browser 窓リサイズ対応

react-resizable の maxConstraints と minConstraints の値を、window onresize 時に動的に変更できるようにすることでブラウザ窓のリサイズと連動させる

参考：

https://zenn.dev/megeton/articles/be1c677e174c84

既知の問題：

-   ブラウザの窓のサイズ変更をすると`ResizeObserver loop completed with undelivered notifications.f`

-   window.innerWidth などの state 管理
-   onresize リスナの登録
-   onresize リスナのデバウンス

```TypeScript
// useWindowSize
import React, { useState, useEffect, useRef } from 'react';

const defaultDelay = 500;

/***
 * Returns window.innerWidth and window.innerHeight when timer reached to delay time.
 * While every resize event which does not reached delay time, that event will be ignored.
 * */
export const useWindowSize = () => {
    const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);
    const [innerHeight, setInnerHeight] = useState<number>(window.innerHeight);
    const timer = useRef<any>();

    useEffect(() => {
        // This might always undefined because it's not save value while re-render.
        // let timer: any;
        const onWindowResizeHandler = () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
                setInnerWidth(window.innerWidth);
                setInnerHeight(window.innerHeight);
            }, defaultDelay);
        };

        window.addEventListener('resize', onWindowResizeHandler);

        return () => {
            window.removeEventListener('resize', onWindowResizeHandler);
        };
    }, []);

    return {
        innerWidth,
        innerHeight,
    };
};



// usage
import React, { useState, useRef, useEffect } from 'react';
import { ResizableBox } from 'react-resizable';
import { useWindowSize } from '../hooks';

const defaultWidth = 600;

const EditorSection = (): JSX.Element => {
    // ...
    const { innerWidth } = useWindowSize();

    const onEditorSecResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        setEditorSectionWidth(size.width);
    };

    return (
        <ResizableBox
            width={editorSectionWidth}
            height={Infinity}
            minConstraints={[200, Infinity]}
            // maxConstraints={[window.innerWidth * 0.7, Infinity]}
            maxConstraints={[innerWidth * 0.7, Infinity]}
            onResize={onEditorSecResize}
            resizeHandles={['e']}
            handle={(h, ref) => (
                <span
                    className={`custom-handle custom-handle-${h}`}
                    ref={ref}
                />
            )}
        >
            // ...
        </ResizableBox>
    );
};

```

`maxConstraints={[innerWidth * 0.7, Infinity]}`で動的に変化するブラウザ窓の幅に対して制限を常に変更できる。

とはいえ窓リサイズしても変更しなくていいんだよなぁ。

## スクロールバーを最小限にする

デフォルトスクロールバーは邪魔＆目立ちすぎるのでカスタムする。

https://stackoverflow.com/a/14150577/22007575

https://stackoverflow.com/questions/7725652/css-scrollbar-style-cross-browser?noredirect=1&lq=1



## フォントサイズ統一

アプリケーション全体のサイズ感の話

## webpack-dev-server Compiled with problems

もしくは

`ResizeObserver loop completed with undelivered notifications.`の件。

参考：

-   https://github.com/fs-webdev/create-react-app/pull/336
-   https://github.com/webpack/webpack-dev-server/issues/4777

まずエラー表示をミュートしたい場合：

https://webpack.js.org/configuration/dev-server/#overlay

今回は重要なエラーを逃したくないので、npm script で表示・非表示を切り替えることとする...

```bash
$ npm run start --no-client-overlay
```

なんか cli だと反映されないので仕方なく webpack.config.js に直接追加。

```TypeScript
    devServer: {
        // ...
        client: {
            overlay: false,
        },
```

現状確認できる出力されたエラー内容:

-   バンドル時

```
WARNING in ./node_modules/typescript/lib/typescript.js 3055:91-112
Module not found: Error: Can't resolve 'perf_hooks' in '/home/teddy/sandbox-editor/node_modules/typescript/lib'
WARNING in ./node_modules/typescript/lib/typescript.js 3089:22-44
Critical dependency: the request of a dependency is an expression
WARNING in ./node_modules/typescript/lib/typescript.js 6256:35-54
Critical dependency: the request of a dependency is an expression
WARNING in ./node_modules/typescript/lib/typescript.js 3055:91-112
Module not found: Error: Can't resolve 'perf_hooks' in '/home/teddy/sandbox-editor/node_modules/typescript/lib'
WARNING in ./node_modules/typescript/lib/typescript.js 3089:22-44
Critical dependency: the request of a dependency is an expression
WARNING in ./node_modules/typescript/lib/typescript.js 6256:35-54
Critical dependency: the request of a dependency is an expression
```

-   リサイズ時

```
Uncaught runtime errors:
×
ERROR
ResizeObserver loop completed with undelivered notifications.
    at handleError (webpack://sandbox-editor/./node_modules/webpack-dev-server/client/overlay.js?:252:58)
    at eval (webpack://sandbox-editor/./node_modules/webpack-dev-server/client/overlay.js?:271:7)
```

#### ResizeObserver loop completed with undelivered notifications.

https://github.com/WICG/resize-observer/issues/38

https://github.com/webpack/webpack-dev-server/issues/4804

https://github.com/fs-webdev/create-react-app/pull/336

今のところこのエラーはwebpack-dev-serverの未解決バグであるらしい。

とにかくconfigでエラー表示を非表示にできるからそうしてくれと。

下記のサイトに依れば`lodash.debounce`を使うと出てこなくなるとかんとか。

https://zenn.dev/megeton/articles/be1c677e174c84

未検証。

## lodash をインストールするときの注意点

https://stackoverflow.com/questions/43479464/how-to-import-a-single-lodash-function

lodash をそのままインストールしたアプリケーションを webpack でバンドルすると巨大になるので必要な奴だけインストールするようにするとよい。

yarn add lodash.debounce
