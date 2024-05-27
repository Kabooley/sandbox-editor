/****************************************************************
 * TODOs:
 * - .tabのファイル名の前にiconつける
 * - tab表示中のファイル名と同じ名前のファイルをtabに追加するとき、それらにpath情報を表示させる
 *
 * *************************************************************/
import React, { useRef, useState, useEffect } from 'react';
import DragNDrop from '../VSCodeExplorer/DragNDrop';
import { CollapseIcon } from './CollapseIcon';
import { MoreActionsMenu } from './MoreActionsMenu';
import {
    Types as FilesContextType,
    useFilesDispatch,
} from '../../context/FilesContext';
import { getFilenameFromPath, moveInArray, getFileIconName } from '../../utils';
import type { File } from '../../data/files';
import ScrollableElement from '../ScrollableElement';
import Action from '../VSCodeExplorer/Action';
import { Icon } from '../Icon';
import closeButtonIcon from '../../assets/vscode/dark/close.svg';
import ellipsisIcon from '../../assets/vscode/dark/ellipsis.svg';

import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
    selectLayoutState,
    layoutSlice,
    layoutActions,
} from '../../slices/layoutSlice';

// import {
//     Types as LayoutContextType,
//     useLayoutDispatch,
//     useLayoutState,
// } from '../../context/LayoutContext';

// NOTE: 無理やり型を合わせている。
// 本来`child: Node`でclassNameというpropertyを持たないが、iJSXNode.classNameをoptionalにすることによって
// 回避している
interface iJSXNode extends Node {
    className?: string;
}

interface iProps {
    // Selected file path
    // path: string;
    selectedFile: File | undefined;
    onChangeSelectedTab: (path: string) => void;
    // Get width of parent which may resize dynamically.
    width: number;
    // Array<File> concist of elements which isSelected field is true
    filesOpening: File[];
}

// According to `sass/components/_tabsAndActions.scss`.
const containerHeight = 28;

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
    const dispatchFilesAction = useFilesDispatch();
    const refTabArea = useRef<HTMLDivElement>(null);
    const refTabs = useRef<HTMLDivElement[]>([]);
    const { isPreviewDisplay } = useAppSelector(selectLayoutState);
    const dispatch = useAppDispatch();

    /**
     * Update scrollableWidth, scrollWidth, refTabs array length.
     * */
    useEffect(() => {
        if (refTabs.current) {
            refTabs.current = refTabs.current.slice(0, filesOpening.length);
        }
    }, []);

    /**
     * Update scrollableWidth, scrollWidth, refTabs array length.
     * */
    useEffect(() => {
        if (refTabs.current) {
            refTabs.current = refTabs.current.slice(0, filesOpening.length);

            // // TODO: selectedされたfileは常にview上に表示されるようにする（手動スクロールしたとき以外）
            // const refSelectedFile = refTabs.current.find(
            //     (tab) => tab.className === 'tab active'
            // );
            // if (refSelectedFile !== undefined) {
            //     refSelectedFile.scrollIntoView();
            // }
        }
    }, [filesOpening]);

    /**
     * Handle clicking on tab.
     * */
    const changeTab = (
        selectedTabNode: HTMLSpanElement,
        desiredFilePath: string
    ) => {
        // console.log("[TabsAndActionsContainer] change tab. selected tab node:");
        // console.log(selectedTabNode);

        // 一旦すべてのtabのclassNameを'tab'にする
        for (var i = 0; i < refTabArea.current!.childNodes.length; i++) {
            var child: iJSXNode = refTabArea.current!.childNodes[i];
            if (/tab/.test(child.className!)) {
                child.className = 'tab';
            }
        }
        // 選択されたtabのみclassName='tab active'にする
        selectedTabNode.className = 'tab active';
        onChangeSelectedTab(desiredFilePath);
    };

    const onClose = (e: React.MouseEvent<HTMLLIElement>, path: string) => {
        e.stopPropagation();
        e.preventDefault();

        console.log(`[TabsAndActions][onClose] ${path}`);

        dispatchFilesAction({
            type: FilesContextType.Close,
            payload: {
                path: path,
            },
        });
    };

    const handleReorderTab = (from: number, to: number) => {
        const reorderedOpeningFiles = moveInArray<File>(filesOpening, from, to);
        const payloads = reorderedOpeningFiles.map((f, index) => {
            return {
                targetFilePath: f.getPath(),
                changeProp: {
                    tabIndex: index,
                },
            };
        });

        // // DEBUG:
        // console.log(
        //   `[TabsAndActions] Reorder tabs on TabsAndActions: from ${from} to ${to}`
        // );
        // console.log(reorderedOpeningFiles);
        // console.log(payloads);

        dispatchFilesAction({
            type: FilesContextType.ChangeMultiple,
            payload: payloads,
        });
    };

    /********************************************************
     *  DND Methods
     ********************************************************/

    /***
     * Fires when the user starts dragging an item.
     * */
    const onDragStart = (e: React.DragEvent, id: number) => {
        // console.log(`[Tabs] on drag start ${id}`);

        setDragging(true);
        e.dataTransfer.setData('draggingId', '' + id);
    };

    /**
     * Fires when dragged item evnters a valid drop target.
     * */
    const onDragEnter = (e: React.DragEvent) => {};

    /***
     * Fires when a draggaed item leaves a valid drop target.
     * */
    const onDragLeave = (e: React.DragEvent) => {};

    /**
     * Fires when a dragged item is being dragged over a valid drop target,
     * every handred milliseconds.
     * */
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    /***
     * Fires when a item is dropped on a valid drop target.
     * @param {number} droppedId - TabIndex number of dropped area tab.
     *
     * */
    const onDrop = (e: React.DragEvent, droppedId: number) => {
        const draggedItemId = e.dataTransfer.getData('draggingId');
        e.dataTransfer.clearData('draggingId');

        // console.log(`[Tabs] on dropped ${draggedItemId} on ${droppedId}`);

        handleReorderTab(Number(draggedItemId), droppedId);
        setDragging(false);
    };

    // Disable pointer events on window
    const disablePointerEventOnIframe = () => {
        dispatch(layoutActions.DisablePointerEventsOnIframe());
    };

    // Enable pointer events on window
    const enablePointerEventOnIframe = () => {
        dispatch(layoutActions.EnablePointerEventsOnIframe());
    };

    const handleTogglePreview = () => {
        dispatch(layoutActions.TogglePreview());
    };

    const handleCloseAll = () => {
        dispatchFilesAction({
            type: FilesContextType.CloseAll,
            payload: {},
        });
    };

    /********************************************
     * RENDERER
     * ******************************************/

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
                        <DragNDrop
                            key={index}
                            id={'' + index}
                            index={index}
                            isDraggable={true}
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragEnter={onDragEnter}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => onDrop(e, index)}
                            onDragOver={onDragOver}
                        >
                            <div
                                className={
                                    f.getPath() === selectedFile?.getPath()
                                        ? 'tab active'
                                        : 'tab'
                                }
                                ref={(el: HTMLDivElement) =>
                                    (refTabs.current[index] = el)
                                }
                                onClick={() =>
                                    changeTab(
                                        refTabs.current[index],
                                        f.getPath()
                                    )
                                }
                                key={index}
                            >
                                <div className="monaco-icon-label">
                                    <div className="codicon">
                                        <Icon
                                            name={getFileIconName(f.getPath())}
                                            size="16px"
                                        />
                                    </div>
                                    <div className="monaco-icon-label__container">
                                        <span className="label-name">
                                            {getFilenameFromPath(f.getPath())}
                                        </span>
                                        {/* <span className="label-description">{f.getPath()}</span> */}
                                    </div>
                                </div>
                                <div className="actions hover-to-appear">
                                    <div className="actions-bar">
                                        <ul className="actions-container">
                                            <Action
                                                handler={(e) =>
                                                    onClose(e, f.getPath())
                                                }
                                                icon={closeButtonIcon}
                                                altMessage="Close a tag"
                                            />
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </DragNDrop>
                    ))}
                </div>
            </ScrollableElement>
            <div className="tabs-actions">
                <div className="actions-bar">
                    <ul className="actions-container">
                        {actions.map((action) => action())}
                    </ul>
                </div>
            </div>
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

export default TabsAndActionsContainer;
