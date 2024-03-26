/*******************************************************************************
 * Tree
 * *****************************************************************************/
import React, { useState } from 'react';
import ValidMessage from '../ValidMessage';
import DragNDrop from '../DragNDrop';
import { isFilenameValid, isFolderNameValid } from '../../../utils';
import type { iExplorer } from '../../../data/types';

import Action from '../Action';
import chevronRightIcon from '../../../assets/vscode/dark/chevron-right.svg';
import chevronDownIcon from '../../../assets/vscode/dark/chevron-down.svg';
import newFileIcon from '../../../assets/vscode/dark/new-file.svg';
import newFolderIcon from '../../../assets/vscode/dark/new-folder.svg';
import trashIcon from '../../../assets/vscode/dark/trash.svg';

// NOTE: new added.
import FormColumn from './FormColumn';
import {
    useFilesDispatch,
    Types as FilesActionTypes,
} from '../../../context/FilesContext';
import { getPathExcludeFilename } from '../../../utils';

interface iProps {
    nestDepth: number;
    explorer: iExplorer;
    handleInsertNode: (requiredPath: string, isFolder: boolean) => void;
    handleDeleteNode: (explorer: iExplorer) => void;
    handleReorderNode: (droppedId: string, draggableId: string) => void;
    handleOpenFile: (explorer: iExplorer) => void;
    handleSelectFile: (explorer: iExplorer) => void;
}

const defaultNewFileName = 'Untitled.file.js';
const defaultNewDirectoryName = 'Untitled';

const Tree: React.FC<iProps> = ({
    explorer,
    nestDepth,
    handleInsertNode,
    handleDeleteNode,
    handleReorderNode,
    handleOpenFile,
    handleSelectFile,
}) => {
    const [expand, setExpand] = useState<boolean>(false);
    const [showInput, setShowInput] = useState({
        visible: false,
        isFolder: false,
    });
    // Use this state while being input form for new item.
    const [isInputBegun, setIsInputBegun] = useState<boolean>(false);
    const [isNameValid, setIsNameValid] = useState<boolean>(false);
    const [isNameEmpty, setIsNameEmpty] = useState<boolean>(false);
    const [dragging, setDragging] = useState<boolean>(false);

    // NOTE: new added.
    const [renaming, setRenaming] = useState<boolean>(false);
    const dispatchFilesAction = useFilesDispatch();

    const handleNewItem = (isFolder: boolean) => {
        setExpand(true);
        setShowInput({
            visible: true,
            isFolder,
        });
    };

    const onAddItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const requiredPath = explorer.path.length
            ? explorer.path + '/' + e.currentTarget.value
            : e.currentTarget.value;
        if (e.keyCode === 13 && requiredPath && isNameValid) {
            handleInsertNode(requiredPath, showInput.isFolder);
            // Clear states
            setShowInput({ ...showInput, visible: false });
            setIsInputBegun(false);
            setIsNameValid(false);
            setIsNameEmpty(false);
        }
    };

    // // TODO: 引数でexplorer.pathを受け取る必要がない
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

    const handleNewItemNameInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        isFolder: boolean
    ) => {
        console.log('[Tree] handleNewItemNameInput');

        setIsInputBegun(true);

        // Check if input form is empty.
        e.currentTarget.value.length
            ? setIsNameEmpty(false)
            : setIsNameEmpty(true);

        // Check if value is valid
        if (isFolder && isFolderNameValid(e.currentTarget.value)) {
            setIsNameValid(true);
        } else if (isFilenameValid(e.currentTarget.value)) {
            setIsNameValid(true);
        } else {
            setIsNameValid(false);
        }
    };

    const onDelete = () => {
        handleDeleteNode(explorer);
    };

    // 既に開いているファイルをクリックする場合もあるので
    // その場合は該当のファイルをselected:trueにすること
    const handleClickFileColumn = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        handleOpenFile(explorer);
        handleSelectFile(explorer);
    };

    const handleClickFolderColumn = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setExpand(!expand);
    };

    /***
     * @param {string} newName - New name for this Tree explorer.
     *
     * Dispatch change action to FilexContext to change path of the File.
     * - renamingの時にonKeyDownで呼び出されるはず
     *
     * TODO: path情報が欠けている。完全なpathの取得
     *  explorerデータの生成方法の改善か、treeのpropsを増やすか
     * 
     *  --> explorer.pathは完全なpathであった
     * 
     * TODO: isFolder: trueだと、リネームするのはpath文字列のうち中間の文字列なのでnewPathの生成方法を修正すること
     * 
     * TODO: folder名の変更だとTypes.MultipleCangesになるので、そのフォルダのすべての連なるアイテムのpathを更新しなくてはならない
     * 
     *  --> explorer.itemsからたどることができる
     * 

     *
     * */
    const handleRename = (newName: string) => {
        // create new path
        const _path = getPathExcludeFilename(explorer.path);
        const newPath = (_path ? _path : '') + newName;

        console.log(
            `[Tree] handleRename: newPath: ${newPath} from ${explorer.path}`
        );

        dispatchFilesAction({
            type: FilesActionTypes.Change,
            payload: {
                targetFilePath: explorer.path,
                changeProp: {
                    newPath: newPath,
                },
            },
        });

        setIsInputBegun(false);
        setIsNameValid(false);
        setIsNameEmpty(false);
        setRenaming(false);
    };

    /****************************************************
     * Drag and Drop handlers
     ****************************************************/

    /***
     * Fires when the user starts dragging an item.
     *
     * */
    const onDragStart = (e: React.DragEvent, id: string) => {
        setDragging(true);
        e.dataTransfer.setData('draggingId', id);
    };

    /**
     * Fires when dragged item evnters a valid drop target.
     *
     * */
    const onDragEnter = (e: React.DragEvent) => {};

    /***
     * Fires when a draggaed item leaves a valid drop target.
     *
     * */
    const onDragLeave = (e: React.DragEvent) => {};

    /**
     * Fires when a dragged item is being dragged over a valid drop target,
     * every handred milliseconds.
     *
     * */
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    /***
     * Fires when a item is dropped on a valid drop target.
     * */
    const onDrop = (e: React.DragEvent, droppedId: string) => {
        const draggedItemId = e.dataTransfer.getData('draggingId') as string;
        e.dataTransfer.clearData('draggingId');
        handleReorderNode(droppedId, draggedItemId);
        setDragging(false);
    };

    /******************************************************
     * Action Renderes
     ******************************************************/

    const renderAddFolderFunction = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            handleNewItem(true);
        };
        return (
            <Action handler={clickHandler} icon={newFolderIcon} altMessage="" />
        );
    };

    const renderAddFileFunction = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            handleNewItem(false);
        };
        return (
            <Action handler={clickHandler} icon={newFileIcon} altMessage="" />
        );
    };

    const renderRenameFunction = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            setRenaming(true);

            console.log('[Tree] Clicked Rename action');
        };
        return (
            <Action
                handler={clickHandler}
                icon={newFileIcon}
                altMessage="Rename item"
            />
        );
    };

    const renderDeleteFunction = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
        };
        return <Action handler={clickHandler} icon={trashIcon} altMessage="" />;
    };

    const folderTreeActions = [
        renderAddFileFunction,
        renderAddFolderFunction,
        renderDeleteFunction,
        renderRenameFunction,
    ];
    const fileTreeActions = [renderDeleteFunction, renderRenameFunction];
    const columnIndent = `${nestDepth * 1.6}rem`;
    // input.inputContainer--inputの動的style
    let inputStyle = {};
    if (isInputBegun && isNameValid) {
        // 入力（フォーカス）中且つ入力内容に問題ない
        inputStyle = { border: '1px solid cyan' };
    } else if (isInputBegun && !isNameValid) {
        // 入力（フォーカス）中且つ入力内容に問題あり
        inputStyle = { border: '1px solid red' };
    }
    // DEBUG:
    // const debug = true;

    // DEBUG:
    console.log(`[Tree] rendering ${explorer.path}`);
    console.log(explorer);

    if (explorer.isFolder) {
        return (
            <div>
                {renaming ? (
                    <FormColumn
                        id={explorer.id}
                        columnIndent={columnIndent}
                        isFolder={explorer.isFolder}
                        name={explorer.name}
                        isNameEmpty={isNameEmpty}
                        isInputBegun={isInputBegun}
                        isNameValid={isNameValid}
                        handleNewItemNameInput={handleNewItemNameInput}
                        callbackOnKeyDown={handleRename}
                        setIsInputBegun={setIsInputBegun}
                        displayForm={setRenaming}
                        inputStyle={inputStyle}
                    />
                ) : (
                    <DragNDrop
                        key={explorer.id}
                        id={explorer.id}
                        index={Number(explorer.id)}
                        isDraggable={true}
                        onDragStart={(e) => onDragStart(e, explorer.id)}
                        onDragEnter={onDragEnter}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, explorer.id)}
                        onDragOver={onDragOver}
                    >
                        <div
                            className="stack-body-list__item virtual-folder"
                            key={explorer.id}
                            onClick={handleClickFolderColumn}
                        >
                            <div
                                className="indent"
                                style={{ paddingLeft: columnIndent }}
                            ></div>
                            <div className="codicon">
                                <img
                                    src={
                                        expand
                                            ? chevronDownIcon
                                            : chevronRightIcon
                                    }
                                />
                            </div>
                            <h3 className="item-label">{explorer.name}</h3>
                            <div className="actions hover-to-appear">
                                <div className="actions-bar">
                                    <ul className="actions-container">
                                        {folderTreeActions.map((action) =>
                                            action()
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </DragNDrop>
                )}
                <div style={{ display: expand ? 'block' : 'none' }}>
                    {showInput.visible && (
                        <div
                            className="stack-body-list__item inputContainer"
                            key={explorer.id}
                            onClick={handleClickFolderColumn}
                        >
                            <div
                                className="indent"
                                style={{ paddingLeft: columnIndent }}
                            ></div>
                            <div className="codicon">
                                {showInput.isFolder ? (
                                    <img
                                        src={chevronRightIcon}
                                        alt="folder icon"
                                    />
                                ) : (
                                    <img
                                        src={chevronRightIcon}
                                        alt="file icon"
                                    />
                                )}
                            </div>
                            <input
                                type="text"
                                className={
                                    'inputContainer--input' +
                                    ' ' +
                                    (isNameValid ? '__valid' : '__invalid')
                                }
                                onKeyDown={onAddItem}
                                // onKeyDown={(e) => onAddItem(e, explorer.path)}
                                onBlur={() => {
                                    setIsInputBegun(false);
                                    setShowInput({
                                        ...showInput,
                                        visible: false,
                                    });
                                }}
                                onChange={(e) =>
                                    handleNewItemNameInput(e, explorer.isFolder)
                                }
                                autoFocus
                                placeholder={
                                    explorer.isFolder
                                        ? defaultNewDirectoryName
                                        : defaultNewFileName
                                }
                                style={inputStyle}
                            />
                            {/* margin-left: indent + codicon */}
                            <ValidMessage
                                isNameEmpty={isNameEmpty}
                                isInputBegun={isInputBegun}
                                isNameValid={isNameValid}
                                marginLeft={`calc(${columnIndent} + 20px)`}
                                width={`calc(100% - ${columnIndent} - 20px)`}
                            />
                        </div>
                    )}
                    {/* In case test input Container. */}
                    {/* {debug && (
            <div
              className="stack-body-list__item inputContainer"
              key={explorer.id}
              onClick={handleClickFolderColumn}
            >
              <div
                className="indent"
                style={{ paddingLeft: columnIndent }}
              ></div>
              <div className="codicon">
                {showInput.isFolder ? (
                  <img src={chevronRightIcon} alt="folder icon" />
                ) : (
                  <img src={chevronRightIcon} alt="file icon" />
                )}
              </div>
              <input
                type="text"
                className={
                  "inputContainer--input" +
                  " " +
                  (isNameValid ? "__valid" : "__invalid")
                }
                onKeyDown={(e) => onAddItem(e, explorer.path)}
                onBlur={() => {
                  setIsInputBegun(false);
                  setShowInput({ ...showInput, visible: false });
                }}
                onChange={(e) => handleNewItemNameInput(e, explorer.isFolder)}
                autoFocus
                placeholder={
                  explorer.isFolder
                    ? defaultNewDirectoryName
                    : defaultNewFileName
                }
                style={inputStyle}
              />
              <ValidMessage
                isNameEmpty={isNameEmpty}
                isInputBegun={isInputBegun}
                isNameValid={isNameValid}
                marginLeft={`calc(${columnIndent} + 20px)`}
                width={`calc(100% - ${columnIndent} - 20px)`}
              />
            </div>
          )}*/}
                    {explorer.items.map((exp: iExplorer) => {
                        const nd = nestDepth + 1;
                        return (
                            <Tree
                                key={exp.id}
                                handleInsertNode={handleInsertNode}
                                handleDeleteNode={handleDeleteNode}
                                handleReorderNode={handleReorderNode}
                                handleOpenFile={handleOpenFile}
                                handleSelectFile={handleSelectFile}
                                explorer={exp}
                                nestDepth={nd}
                            />
                        );
                    })}
                </div>
            </div>
        );
    } else {
        return (
            <DragNDrop
                key={explorer.id}
                id={explorer.id}
                index={Number(explorer.id)}
                isDraggable={true}
                onDragStart={(e) => onDragStart(e, explorer.id)}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, explorer.id)}
                onDragOver={onDragOver}
            >
                <div
                    className="stack-body-list__item virtual-folder"
                    key={explorer.id}
                    onClick={handleClickFileColumn}
                >
                    <div
                        className="indent"
                        style={{ paddingLeft: columnIndent }}
                    ></div>
                    <div className="codicon">
                        <img src={chevronRightIcon} />
                    </div>
                    <h3 className="item-label">{explorer.name}</h3>
                    <div className="actions hover-to-appear">
                        <div className="actions-bar">
                            <ul className="actions-container">
                                {fileTreeActions.map((action) => action())}
                            </ul>
                        </div>
                    </div>
                </div>
            </DragNDrop>
        );
    }
};

export default Tree;
