import React, { useState } from 'react';
import Tree from './Tree';
import SectionTitle from '../SectionTitle';
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

// Icons
import addFolder from '../../../assets/add-folder.svg';
import addFile from '../../../assets/add-file.svg';

interface iProps {
    files: File[];
    filesDispatch: React.Dispatch<iFilesActions>;
    tree: iExplorer;
}

/***
 * Top component of FileExplorer Section.
 * 
 * `handleXXXX` methods treats tree data to dispatch action to FilesContext.
 * `renderXXXX` methods returns JSX which is Functionalityof tree column.
 *
 * */
export default function FileExplorer({ files, filesDispatch, tree }: iProps) {
    const [collapse, setCollapse] = useState<boolean>(true);

    /***
     *
     * */
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

        filesDispatch({
            type: Types.DeleteMultiple,
            payload: {
                requiredPaths: deletionTargetFiles.map((d) => d.getPath()),
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
        if (isNodeIncludedUnderExplorer(tree, droppedId, draggableId)) {
            return;
        }
        const movingItem: iExplorer | undefined = getNodeById(
            tree,
            draggableId
        );
        const droppedArea: iExplorer | undefined = getNodeById(tree, droppedId);
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
            : getParentNodeByChildId(tree, droppedArea.id)!.path;
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

    // --- functions ---

    const handleNewItem = (
        e: React.MouseEvent<HTMLDivElement>,
        isFolder: boolean
    ) => {
        e.stopPropagation();
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
    // -- renderer --

    const renderAddFolderFunction = () => {
        return (
            <div
                onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                    handleNewItem(e, true)
                }
            >
                <img src={addFolder} alt="add folder" />
            </div>
        );
    };

    const renderAddFileFunction = () => {
        return (
            <div
                onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                    handleNewItem(e, false)
                }
            >
                <img src={addFile} alt="add file" />
            </div>
        );
    };

    const renderCollapseAllFilesFunction = () => {
        return (
            <div
            // onClick={(e: React.MouseEvent<HTMLDivElement>) =>
            //      // TODO: implement this.
            //     handleCollapseAllFolders(e)
            // }
            >
                <img src={addFile} alt="collapse all folders" />
            </div>
        );
    };

    // if (tree.name !== 'root' || !tree.isFolder) {
    //     throw new Error('Error: tree root is not exist');
    // }

    return (
        <section className="file-explorer">
            <SectionTitle
                title={tree.name}
                collapse={collapse}
                setCollapse={setCollapse}
                treeItemFunctions={[
                    renderAddFolderFunction,
                    renderAddFileFunction,
                    renderCollapseAllFilesFunction,
                ]}
            />
            <div
                className={
                    collapse
                        ? 'collapsible collapse'
                        : 'collapsible vertical-edge-spaces'
                }
            >
                {collapse
                    ? null
                    : tree.items.map((exp: iExplorer, index) => {
                          const nestDepth = 0;
                          return (
                              <Tree
                                  key={index}
                                  explorer={exp}
                                  nestDepth={nestDepth}
                                  handleInsertNode={handleInsertNode}
                                  handleDeleteNode={handleDeleteNode}
                                  handleReorderNode={handleReorderNode}
                                  handleOpenFile={handleOpenFile}
                              />
                          );
                      })}
            </div>
        </section>
    );
}
