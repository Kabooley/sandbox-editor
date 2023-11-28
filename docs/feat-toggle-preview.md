# Preview セクションを非表示・再表示可能にする

## summary

-   [開発メモ](#開発メモ)
-   [機能説明](#機能説明)
-   [知識](#知識)

## 開発メモ

TODO: pane, preview 閉じてブラウザをリサイズした後に preview を再表示すると editor-section の幅が修正されない点の修正

## 決めたこと

-   window 幅の取得には必ず`window.innerWidth`だけを使う（window.screen.width は使わない）

-   editor-section の幅最大値 + pane の幅最大値 + navigation の幅が、window.screen.width を超えないようにする。(preview-section を閉じていないときは)

editor-section: window.innerWidth \* 0.7
pane: 400px

-   react-resizale の ResizableBox を条件によってリサイズ無効にするために、`minConstraints`プロパティをそのペインの幅そのものにする、onResize ハンドラを条件によっては実行させないで return させる

-   `EditorSection.tsx`の`editorSectionWidth`はコンポーネント管理ではなく`LayoutContext`管理とする
-   `Pane.tsx`の`paneWidth`はコンポーネント管理ではなく`LayoutContext`管理とする

## 機能説明

#### `LayoutContext.tsx`

```TypeScript
// LayoutContext.tsx
import React, { createContext, useContext, useReducer, Dispatch } from "react";

// --- Types ---

type ViewContexts = "explorer" | "dependencies" | "none";

interface iState {
  // Flag of display or hide Pane section
  // openExplorer: boolean;
  // Enable or disable pointer events on iframe[title="preview"]
  pointerEventsOnPreviewIframe: boolean;
  // Contents of pane. "explorer", "dependency list", or hide if it's "none".
  currentContext: ViewContexts;
  // Switch status of displaying Preview
  isPreviewDisplay: boolean;
  // width of div.editor-section
  editorWidth: number;
  // width of div.pane. This will 0 when pane is close
  paneWidth: number;
  // width of div.pane when it will close
  paneWidthOnClose: number;
  // width of div.preview-section when it will close
  previewWidthOnClose: number;
}

enum Types {
  DisablePointerEventsOnIframe = "DISABLE_POINTER_EVENTS_ON_IFRAME",
  EnablePointerEventsOnIframe = "ENABLE_POINTER_EVENTS_ON_IFRAME",
  ChangeContext = "CHANGE_CONTEXT",
  TogglePreview = "TOGGLE_PREVIEW",
  UpdateEditorWidth = "UPDATE_EDITOR_WIDTH",
  UpdatePaneWidth = "UPDATE_PANE_WIDTH"
}


type iLayoutActionPayload = {
  [Types.DisablePointerEventsOnIframe]: {};
  [Types.EnablePointerEventsOnIframe]: {};
  [Types.ChangeContext]: {
    context: ViewContexts;
  };
  [Types.TogglePreview]: {};
  [Types.UpdateEditorWidth]: {
    width: number;
  };
  [Types.UpdatePaneWidth]: {
    width: number;
  };
};

type iLayoutActions = ActionMap<iLayoutActionPayload>[keyof ActionMap<
  iLayoutActionPayload
>];

// --- Definitions ---


const getWindowWidth = () => {
  return window.innerWidth;
};

const initialLayout = {
  editorLayout: {
    // NOTE: EditorSection.tsxにも同データがある。異なることがないように。
    defaultWidth: 600,
    minimumWidth: 100,
    maximumWidth: window.screen.width * 0.7
  },
  paneLayout: {
    // NOTE: Pane.tsxにも同データがある。異なることがないように。
    defaultWidth: 240,
    minimunWidth: 190,
    maximumWidth: window.screen.width * 0.26
  },
  // TODO: cssの値と整合性とるように。cssの方は`4.8rem`である。
  navigation: {
    width: 48
  }
};

const navigationWidth = initialLayout.navigation.width;

const LayoutContext = createContext<iState>({
  pointerEventsOnPreviewIframe: true,
  currentContext: "explorer",
  isPreviewDisplay: true,
  editorWidth: initialLayout.editorLayout.defaultWidth,
  paneWidth: initialLayout.paneLayout.defaultWidth,
  paneWidthOnClose: initialLayout.paneLayout.defaultWidth,
  previewWidthOnClose:
    getWindowWidth() -
    initialLayout.editorLayout.defaultWidth -
    initialLayout.paneLayout.defaultWidth -
    navigationWidth
});

// ...

function layoutReducer(state: iState, action: iLayoutActions) {
  switch (action.type) {
    // ...
    /***
     *
     * */
    case Types.ChangeContext: {
      const { context } = action.payload;
      // On close pane:
      if (context === state.currentContext) {
        const _paneWidth = state.paneWidth;
        // Expand editorWidth to fit screen excluding Navigation if preview is closing.
        if (!state.isPreviewDisplay) {
          return {
            ...state,
            currentContext: "none",
            paneWidthOnClose: _paneWidth,
            paneWidth: 0,
            editorWidth: getWindowWidth() - navigationWidth
          };
        }
        // Share pane width with editorWidth and preview width if preview is not closing.
        else {
          return {
            ...state,
            currentContext: "none",
            paneWidthOnClose: _paneWidth,
            paneWidth: 0
          };
        }
      }
      // On open pane or just change context:
      if (state.currentContext === "none") {
        // In case preview is closing:
        // pane occupies width with state.paneWidthOnClose, Navigation is navigationWidth, editorWidth is rest when preview is closing.
        if (!state.isPreviewDisplay) {
          return {
            ...state,
            currentContext: context,
            paneWidth: state.paneWidthOnClose,
            editorWidth:
              getWindowWidth() - navigationWidth - state.paneWidthOnClose
          };
        }
        // In case preview is opening:
        else {
          let _editorWidth = state.editorWidth;
          // In order not to let editorWidth over its maximumWidth limit.
          if (_editorWidth > initialLayout.editorLayout.maximumWidth) {
            _editorWidth = initialLayout.editorLayout.maximumWidth;
          }
          return {
            ...state,
            currentContext: context,
            paneWidth: state.paneWidthOnClose,
            editorWidth: _editorWidth
          };
        }
      }
      // Just change context except "none"
      return {
        ...state,
        currentContext: context
      };
    }
    /***
     *
     * */
    case Types.TogglePreview: {
      // DEBUG:
      console.log("[LayoutContext] toggle preview:");

      // on close preview:
      if (state.isPreviewDisplay) {
        const _previewWidthOnClose =
          getWindowWidth() -
          navigationWidth -
          state.paneWidth -
          state.editorWidth;
        if (state.currentContext === "none") {
          // In case pane is closing
          // Editor expand to fill screen excluding navigation.
          return {
            ...state,
            isPreviewDisplay: false,
            previewWidthOnClose: _previewWidthOnClose,
            editorWidth: getWindowWidth() - navigationWidth
          };
        } else {
          // In case pane is opening
          // Editor expand to fill part of preview-section.
          return {
            ...state,
            isPreviewDisplay: false,
            previewWidthOnClose: _previewWidthOnClose,
            editorWidth: getWindowWidth() - navigationWidth - state.paneWidth
          };
        }
      }
      // On open preview:
      else {
        if (state.currentContext === "none") {
          // In case pane is closing
          // EditorSection width shrink to length of the preview and navigation removed.
          const _editorWidth =
            getWindowWidth() - navigationWidth - state.previewWidthOnClose;
          return {
            ...state,
            isPreviewDisplay: true,
            editorWidth: _editorWidth
          };
        } else {
          // In case pane is opening.
          // EditorSection width shrink to length of the preview and pane, navigation removed.
          let _editorWidth =
            getWindowWidth() -
            navigationWidth -
            state.paneWidth -
            state.previewWidthOnClose;
          // In order not to let editor width be less tan its minimum size.
          if (_editorWidth < initialLayout.editorLayout.minimumWidth) {
            _editorWidth = initialLayout.editorLayout.minimumWidth;
          }
          return {
            ...state,
            isPreviewDisplay: true,
            editorWidth: _editorWidth
          };
        }
      }
    }
    /****
     *
     ***/
    case Types.UpdateEditorWidth: {
      const { width } = action.payload;
      return {
        ...state,
        editorWidth: width
      };
    }
    case Types.UpdatePaneWidth: {
      const { width } = action.payload;
      return {
        ...state,
        paneWidth: width
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

const initialState: iState = {
  pointerEventsOnPreviewIframe: true,
  currentContext: "explorer",
  isPreviewDisplay: true,
  editorWidth: initialLayout.editorLayout.defaultWidth,
  paneWidth: initialLayout.paneLayout.defaultWidth,
  paneWidthOnClose: initialLayout.paneLayout.defaultWidth,
  previewWidthOnClose:
    getWindowWidth() -
    initialLayout.editorLayout.defaultWidth -
    initialLayout.paneLayout.defaultWidth -
    navigationWidth
};

// ...
```

#### Types.ChangeContext, Types.TogglePreview 両アクションについて

NOTE:計算はすべてハードコーディングされている。一部の変更は計算式の作り直しになるので注意。

pane を表示非表示にするかどうかを決定するがその際に`div.editor-section`の幅を適切に変更させる。

その決定手順が以下の通り。

-   `div.preview-section`を非表示にするとき：

    pane が閉じている: `div.editor-section`は Navigation を除外した水平方向いっぱいに表示する

    pane が開いている: `div.editor-section`は Navigation, `div.pane`を除外した水平方向いっぱいに表示する

-   `div.preview-section`を再表示するとき：

    pane が閉じている：`div.editor-section`は Navigation、`div.preview-section`を除外した水平方向いっぱいに表示する
    pane が閉じている：`div.editor-section`は Navigation、`div.pane`, `div.preview-section`を除外した水平方向いっぱいに表示する

*   `div.pane`を非表示にするとき：

    `div.preview-section`が閉じている：`div.editor-section`は Navigation を除外した水平方向いっぱいに表示する

    `div.preview-section`が開いている：`div.editor-section`は Navigation、`di.preview-section`を除外した水平方向いっぱいに表示する

*   `div.pane`を再表示するとき：

    `div.preview-section`が閉じている：`div.editor-section`は Navigation、`div.pane`を除外した水平方向いっぱいに表示する
    `div.preview-section`が開いている：`div.editor-section`は Navigation、`div.pane`, `div.preview-section`を除外した水平方向いっぱいに表示する

#### `div.editor-section`は`div.preview-section`が非表示の時にリサイズ無効とした

リサイズ可能のままにしておくとレイアウトが総崩れになるため。

`react-resizable`のリサイズを無効化させるために、`div.editor-section`の`ResizableBox`のプロパティ、

`maxConstraints`と`minConstraints`の両方の値を`div.preview-section`が非表示の間は`editorWidth`と同じ値になるようにした。

```TypeScript
import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";
import { useWindowSize } from "../hooks";
import EditorContext from "../context/EditorContext";
import { useLayoutDispatch, useLayoutState } from "../context/LayoutContext";
import { Types as LayoutContextActionType } from "../context/LayoutContext";

// cssと異なる値にしないこと
const defaultWidth = 600;
const minimumWidth = 100;

const EditorSection = (): JSX.Element => {
  const { editorWidth, isPreviewDisplay } = useLayoutState();
  const dispatch = useLayoutDispatch();
  const { innerWidth } = useWindowSize();

  const onEditorSecResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
    // NOTE: previewが非表示のときはリサイズ無効にする
    if (!isPreviewDisplay) return;
    dispatch({
      type: LayoutContextActionType.UpdateEditorWidth,
      payload: {
        width: size.width
      }
    });
  };

  // TODO: move them to LayoutContext
  const _minimumWidth = isPreviewDisplay ? minimumWidth : editorWidth;
  const _maximumWidth = isPreviewDisplay ? innerWidth * 0.7 : editorWidth;

  return (
    <ResizableBox
      width={editorWidth}
      height={Infinity}
      minConstraints={[_minimumWidth, Infinity]}
      maxConstraints={[_maximumWidth, Infinity]}
      onResize={onEditorSecResize}
      resizeHandles={["e"]}
      handle={(h, ref) => (
        <span className={`custom-handle custom-handle-${h}`} ref={ref} />
      )}
    >
      <div
        className="editor-section"
        style={{width: editorWidth}}
      >
        <EditorContext width={editorWidth} />
      </div>
    </ResizableBox>
  );
};
```

## 知識

#### window.inenrWidth vs window.screen.width

https://stackoverflow.com/a/37443508/22007575

window.innerWidth:

-   ブラウザがリサイズしたらリサイズした後のサイズを返す
-   ブラウザのフォントサイズが変更されたらフォントサイズ変更を反映したサイズを返す
-   垂直方向スクロールバーの幅を含む

window.screen.width:

-   端末の物理的なスクリーンのピクセル数を返すのでブラウザのリサイズもフォントサイズの変更も関係なく常に同じ値を返す
