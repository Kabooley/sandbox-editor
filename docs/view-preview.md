# Improvement Preview view

## summary

-   [[問題修正] react-resizable がある方向へリサイズできない問題](#[問題修正]-react-resizableがある方向へリサイズできない問題)
-   [[問題修正] iframe を垂直方向の画面いっぱいまで広げていない](#[問題修正]-iframeを垂直方向の画面いっぱいまで広げていない)
-   [react-resizable:リサイズに制限を設けたいとき](#react-resizable:リサイズに制限を設けたいとき)
-   [browser 窓リサイズ対応](#browser窓リサイズ対応)
-   [水平方向スクロールバーを無効化させる](#水平方向スクロールバーを無効化させる)
-   [フォントサイズ統一](#フォントサイズ統一)
-   [webpack-dev-server Compiled with problems](#webpack-dev-server-Compiled-with-problems)
-   [lodash をインストールするときの注意点](#lodashをインストールするときの注意点)
-   [[機能] Actionbar 実装](#[機能]-Actionbar実装)
-   [[機能] FileExplorer を非表示可能にさせる](#[機能]-FileExplorerを非表示可能にさせる)
-   [[機能] Header 実装](#[機能]-Header実装)
-   [[機能] Open Files の実装](#[機能]-Open-Filesの実装)
-   [[機能] vscode footer の実装](#[機能] vscode footer の実装)

TODO: [codesandbox の`test-sandbox-editor-view`を適用したので適用による不具合修正](#codesandbox の`test-sandbox-editor-view`を適用したので適用による不具合修正)

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

## 水平方向スクロールバーを無効化させる

水平方向へ要素をリサイズするとデフォルトのスクロールバーが表示されるが、これをなくす。

各要素内部でのスクロールのみ可能とする。

https://stackoverflow.com/questions/7335444/css-disabled-scrolling

上記の通り、以下を設定すればスクロールバーは表示されなくなった。

```css
html,
body {
    overflow-x: hidden;
}
```

## フォントサイズ統一

アプリケーション全体のサイズ感の話

確認できた問題：

-   ブラウザのズーム機能を使って縮小から拡大すると#root 要素と.main-container 要素が（多分.Header 要素の高さ分）ずれる

しかし codesandbox の`test-sandbox-editor-view`ではおこらなない。

TODO:　両者の比較をして原因を探る。

```


```

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

今のところこのエラーは webpack-dev-server の未解決バグであるらしい。

とにかく config でエラー表示を非表示にできるからそうしてくれと。

下記のサイトに依れば`lodash.debounce`を使うと出てこなくなるとかんとか。

https://zenn.dev/megeton/articles/be1c677e174c84

未検証。

## lodash をインストールするときの注意点

https://stackoverflow.com/questions/43479464/how-to-import-a-single-lodash-function

lodash をそのままインストールしたアプリケーションを webpack でバンドルすると巨大になるので必要な奴だけインストールするようにするとよい。

yarn add lodash.debounce

## codesandbox の`test-sandbox-editor-view`を適用したので適用による不具合修正

-   key を配列レンダリングしている要素へ与えましょう
-   済）FilesContext の OPEN ディスパッチの機能が tabs 表示迄きていない
-   Pane の各セクションの開閉動作が遅い
-   Tabs の水平方向スクロールバーをホバーすると Editor 要素が下方向へ動く
-   済）Tabs で複数`.tabs.active`になる
-   Pane の各セクションタイトルの文字が大きすぎる

## [Refoctoring] FilesContext.tsx の File 配列の更新方法

class インスタンスの複製の正しい方法は？

正しい方法なんてないもしくはあってもパフォーマンスが著しく悪い場合、

state は class インスタンスを使わないで直接オブジェクトを扱った方がいいかも？

```TypeScript
// File

```

```TypeScript

```

## [機能] Open Files の実装

-   済）iExplorer に isOpening プロパティを追加する
-   済）TreeColumn が受け取るデータを iExplorer だけになるように OpenFiles コンポーネントを Exolorer 以下にする(ファイルの整理)
-   TreeColumnIconName で表示するアイコンを拡張子に応じて変更できるようにする
-   OPenFiles の実装。。。あとは Functions の機能を実装するだけ
-   済）Pane をリサイズすると Pane のコンテンツが折り返されて表示されてしまいコンテンツのカラムが崩れる
-   FileExplorer の表示領域を垂直方向に固定したい
-   済）collapse が true の時は SectionTitle の functions は無効化すべし
-   OpeEditor で map レンダリングさせるように key を渡すこと
-   済）FileExplorer からファイルを開くときに isSelected が更新されていない
-   Tabs をホバーすると表示されるスクロールバーが現れることで EditorContainer が下に下がる

-   済）[bug] OpenFiles でファイルを close すると、それが isSelected だった場合、`isSelected`が真のファイルが失われる
-   済）[bug] Tabs でクローズボタンをクリックすると、`CHANGE_SELECTED_FILE`も反応してしまう
-   [bug] ウェブページをブラウザでフォントサイズ変更するとなぜか高さが 100%じゃなくなる

#### Pane をリサイズすると Pane のコンテンツが折り返されて表示されてしまいコンテンツのカラムが崩れる

あとファイル名が長すぎる場合に省略できるようにしないとこれまた崩れるよ

ひとまず files へ超長いファイル名のファイルを追加

`src/superUltraHyperTooLongBaddaaasssssFile.ts`

## [css tips] 改行させない方法

https://csshtml.work/white-space-nowrap/

```css
div {
    white-space: nowrap;
}
```

他上記のサイトが参考になった。

#### 実践

https://stackoverflow.com/questions/13867717/how-to-make-divs-percentage-width-relative-to-parent-div-and-not-viewport

## [css tips] はみ出た文字列を 3 点リーダー表示してくれるやつ

https://csshtml.work/white-space-nowrap/

```css
span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    /* 幅も指定しないといけないばあいもあるかも */
    width: 100px;
}
```

これで、100px からはみ出た文字列がある場合、そこが 3 点リーダになる。

## [Tips] All about Window size

TODO: よく理解してなんでフォントサイズを変更するとあとから y 軸方向にスクロールバーが出現するのか追求する

window.innerWidth, document.documentElement.clientWidth, viewport?

こやつらは何が違うのじゃ？

https://stackoverflow.com/questions/33770549/viewport-vs-window-vs-document

https://stackoverflow.com/questions/6942785/window-innerwidth-vs-document-documentelement-clientwidth

https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth

> インライン要素および CSS のない要素の場合、Element.clientWidth プロパティは 0 です。それ以外の場合は、要素の内側の幅 (ピクセル単位) になります。パディングは含まれますが、境界線、マージン、垂直スクロールバー (存在する場合) は除外されます。

https://developer.mozilla.org/en-US/docs/Glossary/Layout_viewport

> レイアウト ビューポートは、ブラウザが Web ページを描画するビューポートです。基本的に、これは表示可能なものを表しますが、ビジュアル ビューポートはユーザーの表示デバイスに現在表示されているものを表します。 これは、たとえばモバイル デバイスでは通常、ピンチ ジェスチャを使用してサイトのコンテンツをズームインおよびズームアウトすることができるため、重要になります。レンダリングされたドキュメントはまったく変更されないため、ユーザーがズーム レベルを調整してもレイアウト ビューポートは同じままになります。代わりに、ビジュアル ビューポートが更新され、表示できるページの領域が示されます。

https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#see_also

> 読み取り専用の Window プロパティ innerWidth は、ウィンドウの内部幅 (つまり、ウィンドウのレイアウト ビューポートの幅) をピクセル単位で返します。これには、垂直スクロール バーが存在する場合は、その幅も含まれます。

#### ウェブページのサイズとウィンドウの表示領域サイズがことなると違ってくる

-   viewport はユーザの利用端末の表示可能領域全体である
-   Window は viewport と同じで、スクロールバーの幅も含む
-   document(の幅や高さは)は web ページのサイズを示す。viewport より大きくなりうる。

document.getClientRect は要素の大きさであり window 幅（高さ）は関係ない。
