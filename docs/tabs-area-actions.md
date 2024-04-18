# Tabs area actions

タブ領域のアクション機能の説明。

## Summary

- [preview toggle action](#preview-toggle-action)
- [close files action](#close-files-action)
- [ホバーｽﾀｲﾘﾝｸﾞの修正](#修正-actions-item--imghoverを無効にする)

## TODOs

- TODO: footerにあるprettierフォーマットボタンをこのtabsactionsへ移動する

## preview toggle action

`src/components/TabsAndActions/index.tsx`

tabs areaの右端にアイコン群が存在する。それぞれ固有のアクションを担っており

その一つにpreview画面を表示・非表示にさせるアクションがある

動作内容は以下のコードの通り、

アクションボタンがクリックされると、

`handleTogglePreview()`が呼び出されてLayoutContextへpreviewをトグルするアクションがディスパッチされる。

```TypeScript

const TabsAndActionsContainer = ({
    selectedFile,
    onChangeSelectedTab,
    width,
    filesOpening,
}: iProps) => {
    // ...

    const handleTogglePreview = () => {
        dispatchLayout({
            type: LayoutContextType.TogglePreview,
            payload: {},
        });
    };

    // ...

    const renderTogglePreviewAction = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            handleTogglePreview();
        };
        return (
            <Action handler={clickHandler} icon={null} altMessage="">
                <CollapseIcon isCollapsing={!isPreviewDisplay} />
            </Action>
        );
    };

    const actions = [renderActionThreeDots, renderTogglePreviewAction];

    return (
        // ...
    );
};

export default TabsAndActionsContainer;
```

## close files action

tabs areaの水平方向の3点リーダをクリックすると`MoreActionsMenu`コンポーネントの内容がレンダリングされる。

ユーザが3点リーダをクリックする

ユーザがクリックした時点でのマウスのpageX, pageY座標を取得し、その座標を基準にメニューを表示させる(state: `mouseCoord`)

`MoreActionsMenu.tsx`のメニューが表示される

メニュー内容は`menuItems`に含める

メニュー要素はposition: fixedで表示される



```TypeScript
import React, { useRef, useState, useEffect } from 'react';
import DragNDrop from '../VSCodeExplorer/DragNDrop';
import { CollapseIcon } from './CollapseIcon';
import { MoreActionsMenu } from './MoreActionsMenu';

const TabsAndActionsContainer = ({
    selectedFile,
    onChangeSelectedTab,
    width,
    filesOpening,
}: iProps) => {
    // Dragging Tab. Not slider.
    const [dragging, setDragging] = useState<boolean>(false);
    const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [displayMenu, setDisplayMenu] = useState<boolean>(false);
    const { isPreviewDisplay } = useLayoutState();
    const dispatch = useFilesDispatch();
    const dispatchLayout = useLayoutDispatch();
    const refTabArea = useRef<HTMLDivElement>(null);
    const refTabs = useRef<HTMLDivElement[]>([]);


    const renderActionThreeDots = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            setMouseCoord({ x: e.pageX, y: e.pageY });
            setDisplayMenu(true);
        };
        return (
            <Action
                handler={clickHandler}
                icon={ellipsisIcon}
                altMessage="Toggle tabs action menu"
            />
        );
    };

    const menuItems = [{ title: 'Close All', handleClick: handleCloseAll }];

    return (
        <div className="scrollable-tabs" style={{ width: `${width}px` }}>
            <ScrollableElement
                width={width}
                height={containerHeight}
                onChildrenResizeEvent={filesOpening.length}
                onParentResizeEvent={width}
                disableVerticalScrollbar={true}
                optionalStyles={{
                    horizontalScrollbarThumbHeight: containerHeight / 4,
                }}
                onDragStart={disablePointerEventOnIframe}
                onDragEnd={enablePointerEventOnIframe}
            >
                <div className="tabs-area" ref={refTabArea}>
                    {filesOpening.map((f, index) => (
                        // ...
                    ))}
                </div>
            </ScrollableElement>
                // ...
            {displayMenu ? (
                <MoreActionsMenu
                    menuItems={menuItems}
                    x={mouseCoord.x}
                    y={mouseCoord.y}
                    hideMenu={setDisplayMenu}
                />
            ) : null}
        </div>
    );
};
```


## [修正] `.actions-item > img:hover`を無効にする

現在className `.action-item`の要素はホバーしたら必ず問答無用で`.actions-item > img:hover`を適用することになっている

場面によっては:hoverのスタイルを無効にしたい場合があるので

`.actions-item > img:hover`の全体適用を無効にする。

代わりに場面に応じてホバースタイルを定義することにする。


メモ：

```css
/* src/sass/_pane.scss */
.action-item > img:hover {
    background-color: $color-hovered-item-primary;
    outline: 1px dashed blue;
    outline-offset: -1px;
}
```


#### [修正] `src/sass/components/_pane.scss`

```HTML
<!-- <Stack> -->
<div className="stack">
    <div className="pane-header">
        <div className="codicon"></div>
        <h3></h3>
        <div className="display actions">
            <div className="actions-bar">
                <ul className="actions-container">
                    <li className="action-item">
                        <img/>
                        <!-- or -->
                        <svg></svg>
                    </div>
                </ul>
            </div>
        </div>
    </div>
    <div className="collapsible"></div>
</div>
```

.action-itemのホバースタイリングを共通ではなく固有にするために以下のように修正した。

```css
.pane-header {
    align-items: center;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    font-size: 11px;
    font-weight: 700;
    overflow: hidden;
    height: $height-pane-header;

    & > .codicon {
        margin: 1px 4px 2px 0;
    }

    /* 修正は以下の部分 */
    & > .actions {
        & > .actions-bar {
            & > .actions-container {
                & > .action-item {
                    & > img:hover {
                        background-color: $color-action-item-hover;
                        outline: 1px dashed blue;
                        outline-offset: -1px;
                    }
                }
            }
        }
    }
}
```
