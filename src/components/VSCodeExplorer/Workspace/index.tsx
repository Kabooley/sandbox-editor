/*******************************************************************************
 * Workspace stack of VSCodeExplorer
 * *****************************************************************************/
import React from 'react';
import Stack from '../Stack';
import Action from '../Action';
import closeIcon from '../../../assets/vscode/dark/close.svg';
import newFileIcon from '../../../assets/vscode/dark/new-file.svg';
import newFolderIcon from '../../../assets/vscode/dark/new-folder.svg';
import collapseAllIcon from '../../../assets/vscode/dark/collapse-all.svg';

import Tree from './Tree';
import {
    isNodeIncludedUnderExplorer,
    getNodeById,
    getAllDescendants,
    getParentNodeByChildId,
} from '../utils';
import type { iExplorer } from '../../../data/types';
import type { iFilesActions } from '../../../context/FilesContext';
import { File } from '../../../data/files';
import { Types } from '../../../context/FilesContext';

import { useFiles, useFilesDispatch } from '../../../context/FilesContext';
import { generateTreeNodeData } from './generateTree';

import {
    useLayoutDispatch,
    Types as LayoutContextActionType,
} from '../../../context/LayoutContext';
import { ModalTypes } from '../../../context/LayoutContext';

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
    const files = useFiles();
    const filesDispatch = useFilesDispatch();
    const dispatchLayoutContextAction = useLayoutDispatch();
    const treeData = generateTreeNodeData(files, 'root');
    const title = 'virtual folder';

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
        filesDispatch({
            type: Types.Add,
            payload: {
                requiredPath: requiredPath,
                isFolder: isFolder,
            },
        });
    };

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
            filesDispatch({
                type: Types.DeleteMultiple,
                payload: {
                    requiredPaths: deletionTargetFiles.map((d) => d.getPath()),
                },
            });

            // モーダルの解除
            dispatchLayoutContextAction({
                type: LayoutContextActionType.RemoveModal,
                payload: {
                    modalType: isDeletionTargetFolder
                        ? ModalTypes.DeleteAFolder
                        : ModalTypes.DeleteAFile,
                },
            });
        };

        dispatchLayoutContextAction({
            type: LayoutContextActionType.ShowModal,
            payload: {
                modalType: isDeletionTargetFolder
                    ? ModalTypes.DeleteAFolder
                    : ModalTypes.DeleteAFile,
                callback: callback,
                fileName: _explorer.name,
            },
        });
    };

    /**
     * pathを変更する対象をすべて取得する
     * pathがどう変更されるべきかを決定する
     * 変更リクエストをdispatchする
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

                // DEBUG:

                // By pushing item, no longer `descendantPaths` is not descendant paths.
                // But keep the name in this scope.
                descendantPaths.push(movingFile.getPath());
                const movingFilePathArr = movingFile.getPath().split('/');
                const reorderingFiles = files.filter((f) =>
                    descendantPaths.find((d) => d === f.getPath())
                );

                filesDispatch({
                    type: Types.ChangeMultiple,
                    payload: [
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
                    ],
                });
            } else {
                // In case movingItem is empty folder:

                filesDispatch({
                    type: Types.Change,
                    payload: {
                        targetFilePath: movingFile.getPath(),
                        changeProp: {
                            newPath:
                                appendPath +
                                movingFile.getPath().split('/').pop(),
                        },
                    },
                });
            }
        } else {
            // In case movingItem is not folder:

            filesDispatch({
                type: Types.Change,
                payload: {
                    targetFilePath: movingFile.getPath(),
                    changeProp: {
                        newPath:
                            appendPath + movingFile.getPath().split('/').pop(),
                    },
                },
            });
        }
    };

    /****************************************
     * Action handlers for Stack PaneHeader
     ****************************************/

    const handleNewItem = (isFolder: boolean) => {
        /***
         * TODO: Input form for new item must be place current focused folder. Implement this.
         *
         * */
        // setExpand(true);
        // setShowInput({
        //     visible: true,
        //     isFolder,
        // });
    };

    // const onAddItem = (
    //     e: React.KeyboardEvent<HTMLInputElement>,
    //     addTo: string
    // ) => {
    //     const requiredPath = addTo.length
    //         ? addTo + '/' + e.currentTarget.value
    //         : e.currentTarget.value;
    //     if (e.keyCode === 13 && requiredPath && isNameValid) {
    //         handleInsertNode(requiredPath, showInput.isFolder);
    //         // Clear states
    //         setShowInput({ ...showInput, visible: false });
    //         setIsInputBegun(false);
    //         setIsNameValid(false);
    //         setIsNameEmpty(false);
    //     }
    // };

    // const handleNewItemNameInput = (
    //     e: React.ChangeEvent<HTMLInputElement>,
    //     isFolder: boolean
    // ) => {
    //     // DEBUG:

    //     setIsInputBegun(true);

    //     // Check if input form is empty.
    //     e.currentTarget.value.length
    //         ? setIsNameEmpty(false)
    //         : setIsNameEmpty(true);

    //     // Check if value is valid
    //     if (isFolder && isFolderNameValid(e.currentTarget.value)) {
    //         setIsNameValid(true);
    //     } else if (isFilenameValid(e.currentTarget.value)) {
    //         setIsNameValid(true);
    //     } else {
    //         setIsNameValid(false);
    //     }
    // };

    const handleOpenFile = (explorer: iExplorer) => {
        filesDispatch({
            type: Types.Open,
            payload: {
                path: explorer.path,
            },
        });
    };

    /**
     * EXPERIMENTAL
     * */
    const handleSelectFile = (explorer: iExplorer) => {
        console.log(`[Workspace] on select ${explorer.path}`);

        filesDispatch({
            type: Types.ChangeSelectedFile,
            payload: {
                selectedFilePath: explorer.path,
            },
        });
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
            <Action handler={clickHandler} icon={newFileIcon} altMessage="" />
        );
    };

    const renderActionNewFolder = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            handleNewItem(true);
        };
        return (
            <Action handler={clickHandler} icon={newFolderIcon} altMessage="" />
        );
    };

    const renderActionCollapseAll = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            // TODO: implement this.
            // handleCollapseAllFolders(e)
        };
        return (
            <Action
                handler={clickHandler}
                icon={collapseAllIcon}
                altMessage=""
            />
        );
    };

    const renderActionCloseAFile = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
        };
        return <Action handler={clickHandler} icon={closeIcon} altMessage="" />;
    };

    return (
        <Stack
            id={id}
            title={title}
            collapse={collapse}
            onClick={onClick}
            height={height}
            width={width}
            actions={[
                renderActionNewFile,
                renderActionNewFolder,
                renderActionCollapseAll,
            ]}
            // listItems={listItems}
        >
            {treeData.items.map((exp: iExplorer, index: number) => {
                const nestDepth = 1;
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
                    />
                );
            })}
        </Stack>
    );
};

export default Workspace;
