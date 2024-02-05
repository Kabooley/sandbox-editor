/****************************************************************
 * TODOs:
 * - .tabのファイル名の前にiconつける
 * - tab表示中のファイル名と同じ名前のファイルをtabに追加するとき、それらにpath情報を表示させる
 *
 * *************************************************************/
import React, { useRef, useState, useEffect } from 'react';
import DragNDrop from '../VSCodeExplorer/DragNDrop';
import {
    Types as FilesContextType,
    useFilesDispatch,
} from '../../context/FilesContext';
import {
    Types as LayoutContextType,
    useLayoutDispatch,
} from '../../context/LayoutContext';
import { getFilenameFromPath, moveInArray } from '../../utils';
import type { File } from '../../data/files';
import ScrollableElement from '../ScrollableElement';
import Action from '../VSCodeExplorer/Action';
import closeButtonIcon from '../../assets/vscode/dark/close.svg';
import chevronRightIcon from '../../assets/vscode/dark/chevron-right.svg';
import ellipsisIcon from '../../assets/vscode/dark/ellipsis.svg';

// NOTE: 無理やり型を合わせている。
// 本来`child: Node`でclassNameというpropertyを持たないが、iJSXNode.classNameをoptionalにすることによって
// 回避している
interface iJSXNode extends Node {
    className?: string;
}

interface iProps {
    // Selected file path
    path: string;
    onChangeSelectedTab: (path: string) => void;
    // Get width of parent which may resize dynamically.
    width: number;
    // Array<File> concist of elements which isSelected field is true
    filesOpening: File[];
}

// According to `sass/components/_tabsAndActions.scss`.
const containerHeight = 28;

const TabsAndActionsContainer = ({
    path,
    onChangeSelectedTab,
    width,
    filesOpening,
}: iProps) => {
    // Dragging Tab. Not slider.
    const [dragging, setDragging] = useState<boolean>(false);
    const dispatch = useFilesDispatch();
    const dispatchLayout = useLayoutDispatch();
    const refTabArea = useRef<HTMLDivElement>(null);
    const refTabs = useRef<HTMLDivElement[]>([]);

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

        dispatch({
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

        dispatch({
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
        dispatchLayout({
            type: LayoutContextType.DisablePointerEventsOnIframe,
            payload: {},
        });
    };

    // Enable pointer events on window
    const enablePointerEventOnIframe = () => {
        dispatchLayout({
            type: LayoutContextType.EnablePointerEventsOnIframe,
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
            // TODO: implement this.
            // handleThreeDotsMenuOpen(e);
        };
        return (
            <Action
                handler={clickHandler}
                icon={ellipsisIcon}
                altMessage="Toggle tabs action menu"
            />
        );
    };

    const actions = [renderActionThreeDots];

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
                                    f.getPath() === path ? 'tab active' : 'tab'
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
                                        <img src={chevronRightIcon} />
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
        </div>
    );
};

/**
 * https://react.dev/reference/react/memo#parameters
 *
 * Component wrapped by React.memo will return previous its output if arePropsEqual returns true.
 * If arePropsEqual return false, then componet will return updated output.
 *
 * NOTE: Pasing second arguments of React.memo() means
 * that you should check all props are equal to previous props.
 *
 * Check list
 * - Is openingFiles.length equal?
 * - Is selectedFile equal?
 * - Is parent width equal?
 * - Is each tabIndex of openingFiles equal?
 * */
const arePropsEqual = (
    prevProps: Readonly<iProps>,
    currentProps: Readonly<iProps>
): boolean => {
    const isEqualNumberOfFiles =
        prevProps.filesOpening.length !== currentProps.filesOpening.length;
    // ? false
    // : true;
    // 0: exact match, -1, 1: unmatch
    const isSameSelectedFile = prevProps.path
        .toLocaleLowerCase()
        .localeCompare(currentProps.path.toLocaleLowerCase())
        ? false
        : true;

    // const isEqualWidth = prevProps.width === currentProps.width ? true : false;
    const isEqualWidth = prevProps.width === currentProps.width;

    let isTabOrderEqual = true;
    if (isEqualNumberOfFiles) {
        currentProps.filesOpening.sort(function (a: File, b: File) {
            if (a.getTabIndex()! < b.getTabIndex()!) {
                return -1;
            } else if (a.getTabIndex()! > b.getTabIndex()!) {
                return 1;
            }
            return 0;
        });
        prevProps.filesOpening.sort(function (a: File, b: File) {
            if (a.getTabIndex()! < b.getTabIndex()!) {
                return -1;
            } else if (a.getTabIndex()! > b.getTabIndex()!) {
                return 1;
            }
            return 0;
        });

        isTabOrderEqual = prevProps.filesOpening.every(
            (pf, index) =>
                pf.getPath() === currentProps.filesOpening[index].getPath()
        );
    }

    // console.log(
    //   `Will TabsAndActions rerender?: ${
    //     isEqualNumberOfFiles &&
    //     isSameSelectedFile &&
    //     isEqualWidth &&
    //     isTabOrderEqual
    //       ? "NO"
    //       : "YES"
    //   }`
    // );

    return (
        isEqualNumberOfFiles &&
        isSameSelectedFile &&
        isEqualWidth &&
        isTabOrderEqual
    );
};

export default React.memo(TabsAndActionsContainer, arePropsEqual);
