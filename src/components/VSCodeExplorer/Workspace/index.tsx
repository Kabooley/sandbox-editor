/*******************************************************************************
 * Workspace stack of VSCodeExplorer
 * *****************************************************************************/
import React, { useState } from 'react';
import Stack from '../Stack';
import Action from '../Action';
import newFileIcon from '../../../assets/vscode/dark/new-file.svg';
import newFolderIcon from '../../../assets/vscode/dark/new-folder.svg';

import Tree from './Tree';
import TreeAsForm from './TreeAsForm';
import {
    isNodeIncludedUnderExplorer,
    getNodeById,
    getAllDescendants,
    getParentNodeByChildId,
} from '../utils';
import type { iExplorer } from '../../../data/types';
import { File } from '../../../data/files';
import { generateTreeNodeData } from './generateTree';
import { getAllDescendantsPath } from '../../../utils';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { layoutActions, ModalTypes } from '../../../slices/layoutSlice';
import { selectFiles, filesActions } from '../../../slices/filesSlice';


interface iProps {
    id: number;
    collapse: boolean;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    height: number;
    width: number;
}

/**
 *
 **/
const Workspace: React.FC<iProps> = ({
    id,
    collapse,
    onClick,
    height,
    width,
}) => {
    // Descides show form for new item.
    const [showInput, setShowInput] = useState<{
        visible: boolean;
        isFolder: boolean;
    }>({ visible: false, isFolder: false });
    const { files } = useAppSelector(selectFiles);
    const treeData = generateTreeNodeData(files, 'root');
    const title = 'virtual folder';
    const dispatch = useAppDispatch();

    /*****************************
     * Node handlers
     *
     * - handleInsertNode
     * - handleDeleteNode
     * - handleReorderNode
     * ***************************/
    const handleInsertNode = (
        requiredPath: string,
        isFolder: boolean
    ): void => {
        dispatch(filesActions.addFile({
            requiredPath: requiredPath,
            isFolder: isFolder,
        }));
    };

    /***
     * @param {iExplorer} _explorer - Explorer data about to delete.
     *
     * FilesContext.tsxのアクション`ShowModal`をディスパッチする。
     * ユーザに削除の確認をとって同意されれば`callback`が実行され、
     * `_explorer`に該当するFileは削除される。
     * */
    const handleDeleteNode = (_explorer: iExplorer) => {
        const isDeletionTargetFolder = _explorer.isFolder;
        const descendantPaths: string[] = getAllDescendants(_explorer).map(
            (d) => d.path
        ) as string[];

        const deletionTargetPathArr = _explorer.path.split('/');

        const deletionTargetFiles: File[] = files.filter((f) => {
            // In case deletion target is folder and f is also folder.
            if (f.isFolder() && isDeletionTargetFolder) {
                const comparandPathArr = f.getPath().split('/');
                if (deletionTargetPathArr.length > comparandPathArr.length)
                    return false;

                let completeMatch: boolean = true;
                deletionTargetPathArr.forEach((p, index) => {
                    completeMatch =
                        p === comparandPathArr[index] && completeMatch;
                });

                // return completeMatch ? false : true;
                return completeMatch ? true : false;
            }
            // In case deletion target is a file, not any folder.
            else if (!descendantPaths.length) {
                return f.getPath() === _explorer.path;
            }
            // In case deletion target is folder but f is not folder.
            return descendantPaths.find((d) => d === f.getPath())
                ? true
                : false;
        });

        const callback = () => {
            // やってほしいこと
            dispatch(filesActions.deleteMultipleFiles({
                        requiredPaths: deletionTargetFiles.map((d) => d.getPath()),
                    }));
            dispatch(layoutActions.RemoveModal());
        };

        dispatch(
            layoutActions.ShowModal({
                modalType: isDeletionTargetFolder
                    ? ModalTypes.DeleteAFolder
                    : ModalTypes.DeleteAFile,
                callback: callback,
                fileName: _explorer.name,
            })
        );
    };

    /**
     * Explorer/Workspace上でのファイルの並びを変更する。
     *
     * @param {string} droppedId - Explorer item's id which is dropped item.
     * @param {string} draggableId - Explorer item's id.
     *
     * pathを変更する対象をすべて取得する。
     * pathがどう変更されるべきかを決定する。
     * 変更リクエストをdispatchする。
     * type: Types.Change | Types.ChangeMultiple
     * */
    const handleReorderNode = (
        droppedId: string,
        draggableId: string
    ): void => {
        if (droppedId === draggableId) {
            return;
        }

        // Check if the dropped area is under dragging item
        if (isNodeIncludedUnderExplorer(treeData, droppedId, draggableId)) {
            return;
        }

        const movingItem: iExplorer | undefined = getNodeById(
            treeData,
            draggableId
        );
        const droppedArea: iExplorer | undefined = getNodeById(
            treeData,
            droppedId
        );
        const movingFile: File | undefined = files.find(
            (f) => f.getPath() === movingItem!.path
        );

        if (
            movingFile === undefined ||
            droppedArea === undefined ||
            movingItem === undefined
        )
            throw new Error(
                'Something went wrong but File/Explorer cannot be found by draggableId/droppedId.'
            );

        // NOTE: Dealing with two cases where droppedArea is folder or not.
        let appendPath = droppedArea.isFolder
            ? droppedArea.path
            : getParentNodeByChildId(treeData, droppedArea.id)!.path;
        if (appendPath.length) {
            appendPath = appendPath + '/';
        }

        // Dealing with three cases where movingItem is folder, empty folder, file.
        if (movingItem.isFolder) {
            let descendantPaths = getAllDescendants(movingItem).map(
                (d) => d.path
            ) as string[];
            const isFolderEmpty = descendantPaths.length ? false : true;

            if (!isFolderEmpty) {
                // In case movingItem is folder and not empty.

                // By pushing item, no longer `descendantPaths` is not descendant paths.
                // But keep the name in this scope.
                descendantPaths.push(movingFile.getPath());
                const movingFilePathArr = movingFile.getPath().split('/');
                const reorderingFiles = files.filter((f) =>
                    descendantPaths.find((d) => d === f.getPath())
                );

                dispatch(filesActions.changeMultipleFiles([
                    ...reorderingFiles.map((r) => {
                        return {
                            targetFilePath: r.getPath(),
                            changeProp: {
                                newPath:
                                    appendPath +
                                    r
                                        .getPath()
                                        .split('/')
                                        .slice(
                                            movingFilePathArr.length - 1,
                                            r.getPath().length
                                        )
                                        .join('/'),
                            },
                        };
                    }),
                ]));
            } else {
                // In case movingItem is empty folder:
                dispatch(filesActions.changeFile({
                    targetFilePath: movingFile.getPath(),
                    changeProp: {
                        newPath:
                            appendPath +
                            movingFile.getPath().split('/').pop(),
                    },
                }));
            }
        } else {
            // In case movingItem is not folder:
            dispatch(filesActions.changeFile({
                targetFilePath: movingFile.getPath(),
                changeProp: {
                    newPath:
                        appendPath + movingFile.getPath().split('/').pop(),
                },
            }))
        }
    };

    /***
     * Check if passed path is already exists in explorer.
     *
     * */
    const checkPathAlreadyExistsFromExplorer = (path: string): boolean => {
        const pathList = getAllDescendantsPath(treeData);
        let result = false;
        pathList.forEach((p) => {
            if (p === path) {
                result = true;
            }
        });
        return result;
    };

    /****************************************
     * Action handlers for Stack PaneHeader
     ****************************************/

    /**
     * - ペインヘッダのアクションは常に「開いているとき」に有効になるので、ペインを開く処理を行う必要はない
     * - FormColumnをどうやってどこに挿入するのか手だてがない
     *    --> Treeを一つ追加するのは？
     * - FormColumnを適切な位置に挿入したい
     *    --> explorerをいじれるか？
     *
     * new state: showInput
     *
     * */
    const handleNewItem = (isFolder: boolean) => {
        setShowInput({
            visible: true,
            isFolder,
        });
    };

    const handleOpenFile = (explorer: iExplorer) => {
        dispatch(filesActions.openFile({ path: explorer.path }));
    };

    /**
     *
     * */
    const handleSelectFile = (explorer: iExplorer) => {
        dispatch(filesActions.changeSelectedFile({ selectedFilePath: explorer.path }));
    };

    /************************
     * Action Renderers
     * **********************/

    const renderActionNewFile = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            handleNewItem(false);
        };
        return (
            <Action
                handler={clickHandler}
                icon={newFileIcon}
                altMessage="New file..."
            />
        );
    };

    const renderActionNewFolder = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            handleNewItem(true);
        };
        return (
            <Action
                handler={clickHandler}
                icon={newFolderIcon}
                altMessage="New folder..."
            />
        );
    };

    // const renderActionCollapseAll = () => {
    //     const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
    //         e.stopPropagation();
    //         e.preventDefault();
    //         // handleCollapseAllFolders(e)
    //     };
    //     return (
    //         <Action
    //             handler={clickHandler}
    //             icon={collapseAllIcon}
    //             altMessage="Collapse folders in explorer"
    //         />
    //     );
    // };

    if (showInput.visible) {
        treeData.items.unshift({
            id: '9999',
            name: '',
            isFolder: showInput.isFolder,
            items: [],
            path: '',
            isOpening: false,
            isSelected: false,
        });
    }

    return (
        <Stack
            id={id}
            title={title}
            collapse={collapse}
            onClick={onClick}
            height={height}
            width={width}
            actions={[renderActionNewFile, renderActionNewFolder]}
            // listItems={listItems}
        >
            {treeData.items.map((exp: iExplorer, index: number) => {
                const nestDepth = 1;
                if (exp.id === '9999') {
                    // 新規アイテム用の一時的なTreeの生成
                    return (
                        <TreeAsForm
                            key={index}
                            explorer={exp}
                            nestDepth={nestDepth}
                            handleInsertNode={handleInsertNode}
                            showInput={showInput}
                            setShowInput={setShowInput}
                            checkPathAlreadyExistsFromExplorer={
                                checkPathAlreadyExistsFromExplorer
                            }
                        />
                    );
                } else {
                    return (
                        <Tree
                            key={index}
                            explorer={exp}
                            nestDepth={nestDepth}
                            handleInsertNode={handleInsertNode}
                            handleDeleteNode={handleDeleteNode}
                            handleReorderNode={handleReorderNode}
                            handleOpenFile={handleOpenFile}
                            handleSelectFile={handleSelectFile}
                            checkPathAlreadyExistsFromExplorer={
                                checkPathAlreadyExistsFromExplorer
                            }
                        />
                    );
                }
            })}
        </Stack>
    );
};

export default Workspace;
