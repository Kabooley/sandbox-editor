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

    const handleNewItem = (isFolder: boolean) => {
        setExpand(true);
        setShowInput({
            visible: true,
            isFolder,
        });
    };

    const onAddItem = (
        e: React.KeyboardEvent<HTMLInputElement>,
        addTo: string
    ) => {
        const requiredPath = addTo.length
            ? addTo + '/' + e.currentTarget.value
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

    const handleNewItemNameInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        isFolder: boolean
    ) => {
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
    ];
    const fileTreeActions = [renderDeleteFunction];
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

    if (explorer.isFolder) {
        return (
            <div>
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
                                    expand ? chevronDownIcon : chevronRightIcon
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
                                onKeyDown={(e) => onAddItem(e, explorer.path)}
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
