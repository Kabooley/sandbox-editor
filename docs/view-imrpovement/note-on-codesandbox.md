# codesandboxでの開発ノート

## Summary

- [依存関係変更内容](#依存関係変更内容)
- [ブラウザのデフォルトkeyboardbindingを一時的にリセットする方法](#ブラウザのデフォルトkeyboardbindingを一時的にリセットする方法)
- [新機能：paneの表示非表示トグル機能](#新機能：paneの表示非表示トグル機能)
- [](#)

## TODOs

- [新機能：modalとfocus管理](#新機能：modalとfocus管理)
- [JavaScriptで参照するcssの定数は一つのファイルにまとめてimportするようにしましょう](#JavaScriptで参照するcssの定数は一つのファイルにまとめてimportするようにしましょう)
- [新機能：TabsAndActionsにactionバーをつける](#新機能：TabsAndActionsにactionバーをつける)



- 済：previewの表示非表示トグルボタン消えているので修正
- 済：Resizeハンドルeのhoverスタイルが消えているので修正して

- ScrollableElememntのscrollbar thumbが消えているので修正
- workspaceの新規ファイル・フォルダ作成のカラムのインデントが1段足りていないのでそれの修正
- PaneHeaderの左のiconの位置がしたすぎるので修正
- OpenEditorのPaneHeaderのaction機能の実装
- WorkspaceのPaneHeaderのフォルダをすべて閉じる機能の実装
- カラーテーマの模索


## 依存関係変更内容

```diff
    "dependencies": {
+       "keyboardjs": "^2.7.0",
+       "react-use": "^17.5.0",
    },
```

## 新機能：paneの表示非表示トグル機能

keyboardjsとreact-useをインストールした。

MainContainer.tsxで`react-use`の`useKey`を使って

`Ctrl + Shift > d`, `Ctrl + b`のキーバインディングに反応できるようにした。

詳しくは[ブラウザのデフォルトkeyboardbindingを一時的にリセットする方法](#ブラウザのデフォルトkeyboardbindingを一時的にリセットする方法)。

```TypeScript
const MainContainer: React.FC<iProps> = ({ children }) => {
  const dispatchLayoutAction = useLayoutDispatch();
  useKey(
    (e) => e.ctrlKey && e.keyCode === KEYCODES_FOR_CHROME.d && e.shiftKey,
    (e) => {
      e.preventDefault();
      dispatchLayoutAction({
        type: ActionTypesOfLayoutContext.TogglePreview,
        payload: {},
      });
    }
  );
  useKey(
    (e) => e.ctrlKey && e.keyCode === KEYCODES_FOR_CHROME.b,
    (e) => {
      e.preventDefault();
      dispatchLayoutAction({
        type: ActionTypesOfLayoutContext.ToggleSidebar,
        payload: {},
      });
    }
  );

  return <div className="main-container">{children}</div>;
};
```

## ブラウザのデフォルトkeyboardbindingを一時的にリセットする方法

参考：

https://stackoverflow.com/questions/24764626/any-way-to-prevent-disable-ctrl-key-shortcuts-in-the-browser?rq=3

https://github.com/codesandbox/codesandbox-client/blob/5ad505da4f134ea3e663bb2df38cd4c03f2be483/packages/app/src/app/pages/Sandbox/Editor/Content/index.tsx#L78

デフォルトの挙動を阻止する方法：

- `keydownEvent.preventDefault()`を呼び出す
- `document.onkeydown = function() {return false;}`する

browserのデフォルト挙動防止できないやりかた

```TypeScript
import React, { useEffect } from "react";
import useKeyboardJs from "react-use/lib/useKeyboardJs";

const [isPressedCtrlShiftD, eventCtrlShiftD] =
useKeyboardJs("ctrl + shift > d");

useEffect(() => {
if (isPressedCtrlShiftD && eventCtrlShiftD) {
    eventCtrlShiftD.preventDefault();

    dispatchLayoutAction({
    type: ActionTypesOfLayoutContext.TogglePreview,
    payload: {},
    });
}
}, [isPressedCtrlShiftD]);

```

browserのデフォルト挙動防止できるやりかた

```TypeScript
import useKey from "react-use/lib/useKey";

  useKey(
    // この方法なら複数keyに対応できる
    (e) => e.ctrlKey && e.keyCode === 68 && e.shiftKey,
    (e) => {
      e.preventDefault();
      console.log("[MainContainer] useKey ctrl shift d");
    }
  );

```

## 新機能：modalとfocus管理

explorerでファイルを削除するとき等にモーダルを表示させて確認を取るようにする。

参考：

https://react.dev/reference/react-dom/createPortal#rendering-a-modal-dialog-with-a-portal

https://github.com/reactjs/react-modal/tree/master

https://ja.react.dev/reference/react-dom/createPortal

dispatchLayoutAction => layoutcontext update modal to show => 