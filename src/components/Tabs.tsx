import React, { useRef, useState } from 'react';
import DragNDrop from './Explorer/DragNDrop';
import {
    Types as FilesContextType,
    useFiles,
    useFilesDispatch,
} from '../context/FilesContext';
import { getFilenameFromPath, moveInArray } from '../utils';
import type { File } from '../data/files';
import closeButton from '../assets/close-button.svg';

// NOTE: 無理やり型を合わせている。
// 本来`child: Node`でclassNameというpropertyを持たないが、iJSXNode.classNameをoptionalにすることによって
// 回避している
interface iJSXNode extends Node {
    className?: string;
}

interface iProps {
    path: string; // Selected file path
    onChangeSelectedTab: (path: string) => void;
}

// https://stackoverflow.com/a/1129270/22007575
const compareTabIndex = (a: File, b: File): number => {
    if (a.getTabIndex()! < b.getTabIndex()!) {
        return -1;
    }
    if (a.getTabIndex()! > b.getTabIndex()!) {
        return 1;
    }
    return 0;
};

/***
 *
 * */
const Tabs = ({ path, onChangeSelectedTab }: iProps) => {
    // const [selectedTabs, setSelectedTabs] = useState<string[]>([path]);
    const [dragging, setDragging] = useState<boolean>(false);
    const files = useFiles();
    const dispatch = useFilesDispatch();
    const _refTabArea = useRef<HTMLDivElement>(null);
    const _refTabs = useRef(files.map(() => React.createRef<HTMLDivElement>()));
    // File list to display
    const filesOpening = files
        .filter((f) => f.isOpening())
        .sort(compareTabIndex);

    const changeTab = (
        selectedTabNode: HTMLSpanElement,
        desiredFilePath: string
    ) => {
        // 一旦すべてのtabのclassNameを'tab'にする
        for (var i = 0; i < _refTabArea.current!.childNodes.length; i++) {
            var child: iJSXNode = _refTabArea.current!.childNodes[i];
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

        // DEBUG:
        // console.log(`[Tabs][handleReorderTab]`);
        // console.log(reorderedOpeningFiles.map((f) => f.getPath()));

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
     *
     * */
    const onDragStart = (e: React.DragEvent, id: number) => {
        // DEBUG:
        console.log(`[Tabs] on drag start ${id}`);

        setDragging(true);
        e.dataTransfer.setData('draggingId', '' + id);
    };

    /**
     * Fires when dragged item evnters a valid drop target.
     *
     * */
    const onDragEnter = (e: React.DragEvent) => {
        // DEBUG:
        console.log(`[Tabs] on drag enter`);
        // console.log(e);
    };

    /***
     * Fires when a draggaed item leaves a valid drop target.
     * */
    const onDragLeave = (e: React.DragEvent) => {
        // DEBUG:
        console.log(`[Tabs] on drag leave`);
        // console.log(e);
    };

    /**
     * Fires when a dragged item is being dragged over a valid drop target,
     * every handred milliseconds.
     *
     * */
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();

        // DEBUG:
        console.log(`[Tabs] on drag over`);
        // console.log(e);
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

    // DEBUG:
    console.log('[Tabs] rendering');
    // console.log(filesOpening.map((f) => f.getPath()));

    return (
        <div className="tabs-area" ref={_refTabArea}>
            {
                // Get opening files.
                filesOpening.map((f, index) => (
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
                            ref={_refTabs.current[index]}
                            onClick={() =>
                                changeTab(
                                    _refTabs.current[index].current!,
                                    f.getPath()
                                )
                            }
                            key={index}
                        >
                            <span>{getFilenameFromPath(f.getPath())}</span>
                            <div onClick={(e) => onClose(e, f.getPath())}>
                                <img src={closeButton} alt="close tab" />
                            </div>
                        </div>
                    </DragNDrop>
                ))
            }
        </div>
    );
};

export default Tabs;

// import React, { useRef, useState } from 'react';
// import { useFiles } from '../context/FilesContext';
// import { getFilenameFromPath } from '../utils';

// // NOTE: 無理やり型を合わせている。
// // 本来`child: Node`でclassNameというpropertyを持たないが、iJSXNode.classNameをoptionalにすることによって
// // 回避している
// interface iJSXNode extends Node {
//     className?: string;
// }

// interface iProps {
//     // Selected file path
//     path: string;
//     onChangeSelectedTab: (path: string) => void;
// }

// /***
//  *
//  * */
// const Tabs = ({ path, onChangeSelectedTab }: iProps) => {
//     const [selectedTabs, setSelectedTabs] = useState<string[]>([path]);
//     const files = useFiles();
//     const _refTabArea = useRef<HTMLDivElement>(null);
//     const _refTabs = useRef(
//         files.map(() => React.createRef<HTMLSpanElement>())
//     );

//     const changeTab = (
//         selectedTabNode: HTMLSpanElement,
//         desiredFilePath: string
//     ) => {
//         // 一旦すべてのtabのclassNameを'tab'にする
//         for (var i = 0; i < _refTabArea.current!.childNodes.length; i++) {
//             var child: iJSXNode = _refTabArea.current!.childNodes[i];
//             if (/tab/.test(child.className!)) {
//                 child.className = 'tab';
//             }
//         }
//         // 選択されたtabのみclassName='tab active'にする
//         selectedTabNode.className = 'tab active';
//         onChangeSelectedTab(desiredFilePath);
//     };

//     return (
//         <div className="tabs-area" ref={_refTabArea}>
//             {
//                 //
//                 files.map((file, index) => {
//                     const _path = file.getPath();
//                     return file.isFolder() ? null : (
//                         <span
//                             className={_path === path ? 'tab active' : 'tab'}
//                             ref={_refTabs.current[index]}
//                             onClick={() =>
//                                 changeTab(
//                                     _refTabs.current[index].current!,
//                                     _path
//                                 )
//                             }
//                             key={index}
//                         >
//                             {getFilenameFromPath(_path)}
//                         </span>
//                     );
//                 })
//             }
//         </div>
//     );
// };

// export default Tabs;
