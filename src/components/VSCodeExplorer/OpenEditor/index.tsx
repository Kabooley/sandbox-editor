import React from 'react';
import Stack from '../Stack';
import Action from '../Action';
import closeAllIcon from '../../../assets/vscode/dark/close-all.svg';
import saveAllIcon from '../../../assets/vscode/dark/save-all.svg';
import closeIcon from '../../../assets/vscode/dark/close.svg';
import chevronRightIcon from '../../../assets/vscode/dark/chevron-right.svg';

import {
    useFiles,
    useFilesDispatch,
    Types as FilesActionTypes,
} from '../../../context/FilesContext';
import { File } from '../../../data/files';
import { getFilenameFromPath } from '../../../utils';

interface iProps {
    id: number;
    collapse: boolean;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    height: number;
    width: number;
}

/****************************************************************
 * TODO:
 * - `div.stack-body-list__item`の中身の順番をaction --> titleにする
 * - 上記に合わせてcssも対応させる
 *
 *
 ****************************************************************/
const OpenEditor: React.FC<iProps> = ({
    id,
    collapse,
    onClick,
    height,
    width,
}) => {
    const files = useFiles();
    const filesDispatch = useFilesDispatch();
    const filesOpening = files.filter((f) => f.isOpening());
    const title = 'open editor';

    /************************************************
     *  Handlers
     *
     *
     ************************************************/
    const handleClickFile = (
        e: React.MouseEvent<HTMLDivElement>,
        file: File
    ) => {
        e.stopPropagation();
        // Ignore if the file is selected already
        if (file.isSelected()) return;
        filesDispatch({
            type: FilesActionTypes.ChangeSelectedFile,
            payload: {
                selectedFilePath: file.getPath(),
            },
        });
    };
    /************************************************
     *  Action handlers
     *
     *
     ************************************************/
    const closeFile = (file: File) => {
        filesDispatch({
            type: FilesActionTypes.Close,
            payload: {
                path: file.getPath(),
            },
        });
    };

    /************************************************
     *  Action renderers
     *
     *
     ************************************************/
    const renderActionCloseAllEditors = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();

            console.log("clicked 'close all editors icon'");
        };
        return (
            <Action handler={clickHandler} icon={closeAllIcon} altMessage="" />
        );
    };

    const renderActionSaveAllFiles = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();

            console.log("clicked 'save all files icon'");
        };
        return (
            <Action handler={clickHandler} icon={saveAllIcon} altMessage="" />
        );
    };

    const renderActionCloseAFile = (file: File) => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            closeFile(file);

            console.log("clicked 'close a file icon'");
        };
        return <Action handler={clickHandler} icon={closeIcon} altMessage="" />;
    };

    const nestDepth = 1;

    return (
        <Stack
            id={id}
            title={title}
            collapse={collapse}
            onClick={onClick}
            height={height}
            width={width}
            actions={[renderActionSaveAllFiles, renderActionCloseAllEditors]}
        >
            {filesOpening.map((f, index) => (
                <div
                    className="stack-body-list__item open-editor"
                    key={index}
                    onClick={(e) => handleClickFile(e, f)}
                >
                    <div
                        className="indent"
                        style={{ paddingLeft: `${nestDepth * 1.6}rem` }}
                    ></div>
                    <div className="actions always-appear">
                        <div className="actions-bar">
                            <ul className="actions-container">
                                {renderActionCloseAFile(f)}
                            </ul>
                        </div>
                    </div>
                    <div className="codicon">
                        <img src={chevronRightIcon} />
                    </div>
                    <h3 className="item-label">
                        {getFilenameFromPath(f.getPath())}
                    </h3>
                    <span>{f.getPath()}</span>
                </div>
            ))}
        </Stack>
    );
};

export default OpenEditor;
