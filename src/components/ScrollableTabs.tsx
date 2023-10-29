import React, { useRef, useState, useEffect, useMemo } from 'react';
import DragNDrop from './Explorer/DragNDrop';
import {
    Types as FilesContextType,
    useFilesDispatch,
} from '../context/FilesContext';
import { getFilenameFromPath, moveInArray } from '../utils';
import type { File } from '../data/files';
import SimpleSlider from './SimpleSlider';
import closeButton from '../assets/close-button.svg';

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

const ScrollableTabs = ({
    path,
    onChangeSelectedTab,
    width,
    filesOpening,
}: iProps) => {
    // const [selectedTabs, setSelectedTabs] = useState<string[]>([path]);
    // Position of slider x coordinate on scrollable range.
    const [position, setPosition] = useState<number>(0);
    // Width of this container
    const [scrollableWidth, setScrollableWidth] = useState<number>(width);
    // Width of this container dom scrollWidth
    const [scrollWidth, setScrollWidth] = useState<number>(width);
    // Dragging Tab. Not slider.
    const [dragging, setDragging] = useState<boolean>(false);
    const dispatch = useFilesDispatch();
    const refTabArea = useRef<HTMLDivElement>(null);
    const refTabs = useRef<HTMLDivElement[]>([]);

    /**
     * Update scrollableWidth, scrollWidth, refTabs array length.
     * */

    useEffect(() => {
        if (refTabArea.current) {
            setScrollableWidth(
                refTabArea.current.getBoundingClientRect().width
            );
            setScrollWidth(refTabArea.current.scrollWidth);
        }
        if (refTabs.current) {
            refTabs.current = refTabs.current.slice(0, filesOpening.length);
        }
    }, []);

    /**
     * Update scrollableWidth, scrollWidth, refTabs array length.
     * */

    useEffect(() => {
        if (refTabArea.current) {
            setScrollableWidth(
                refTabArea.current.getBoundingClientRect().width
            );
            setScrollWidth(refTabArea.current.scrollWidth);
        }
        if (refTabs.current) {
            refTabs.current = refTabs.current.slice(0, filesOpening.length);
        }
    }, [width, filesOpening]);

    /**
     * Handle clicking on tab.
     * */

    const changeTab = (
        selectedTabNode: HTMLSpanElement,
        desiredFilePath: string
    ) => {
        console.log('[ScrollableTabs] change tab. selected tab node:');
        console.log(selectedTabNode);

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

    const onClose = (e: React.MouseEvent<HTMLDivElement>, path: string) => {
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

        dispatch({
            type: FilesContextType.ChangeMultiple,
            payload: payloads,
        });
    };

    // --- dnd ---
    /***
     * Fires when the user starts dragging an item.
     * */
    const onDragStart = (e: React.DragEvent, id: number) => {
        // DEBUG:
        console.log(`[Tabs] on drag start ${id}`);

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

        // DEBUG:
        console.log(`[Tabs] on dropped ${draggedItemId} on ${droppedId}`);

        handleReorderTab(Number(draggedItemId), droppedId);
        setDragging(false);
    };

    // Calcurate values which related to scrolling tabs
    const ratioOfScrollableWidth = scrollableWidth / scrollWidth;
    const sliderWidth = scrollableWidth * ratioOfScrollableWidth;
    const scrollLeft = position * (scrollWidth - scrollableWidth);

    if (refTabArea.current) {
        refTabArea.current.scrollLeft = scrollLeft;
    }

    return (
        <div className="scrollable-tabs" style={{ width: width + 'px' }}>
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
                                changeTab(refTabs.current[index], f.getPath())
                            }
                            key={index}
                        >
                            <span>{getFilenameFromPath(f.getPath())}</span>
                            <div onClick={(e) => onClose(e, f.getPath())}>
                                <img src={closeButton} alt="close tab" />
                            </div>
                        </div>
                    </DragNDrop>
                ))}
            </div>
            <SimpleSlider
                stylesOfContainer={{
                    width: width,
                    // Temporary expand. Easy to find
                    height: 6,
                    left: 0,
                    bottom: 0,
                }}
                setCurrentPosition={setPosition}
                sliderWidth={sliderWidth}
            />
        </div>
    );
};

/**
 * NOTE: Pasing second arguments of React.memo() means
 * that you should check all props are equal to previous props.
 * */
const arePropsEqual = (
    prevProps: Readonly<iProps>,
    currentProps: Readonly<iProps>
): boolean => {
    const isEqualNumberOfFiles =
        prevProps.filesOpening.length !== currentProps.filesOpening.length
            ? false
            : true;
    // 0: exact match,
    // -1, 1: unmatch
    const isSameSelectedFile = prevProps.path
        .toLocaleLowerCase()
        .localeCompare(currentProps.path.toLocaleLowerCase())
        ? false
        : true;

    const isEqualWidth = prevProps.width === currentProps.width ? true : false;

    return isEqualNumberOfFiles && isSameSelectedFile && isEqualWidth;
};

export default React.memo(ScrollableTabs, arePropsEqual);
