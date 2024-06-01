import React from 'react';
import Stack from '../Stack';
import Action from '../Action';
import type { iFile } from '../../../data/types';
import { getFilenameFromPath, getFileIconName } from '../../../utils';
import { Icon } from '../../Icon';
import closeAllIcon from '../../../assets/vscode/dark/close-all.svg';
import closeIcon from '../../../assets/vscode/dark/close.svg';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { selectFiles, filesActions } from '../../../slices/filesSlice';

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
    const { files } = useAppSelector(selectFiles);
    const dispatch = useAppDispatch();
    const filesOpening = files.filter((f) => f.opening);
    const title = 'open editor';

    /************************************************
     *  Handlers
     *
     *
     ************************************************/
    const handleClickFile = (
        e: React.MouseEvent<HTMLDivElement>,
        file: iFile
    ) => {
        e.stopPropagation();
        // Ignore if the file is selected already
        if (file.selected) return;
        dispatch(
            filesActions.changeSelectedFile({
                selectedFilePath: file.path,
            })
        );
    };
    /************************************************
     *  Action handlers
     *
     *
     ************************************************/
    const closeFile = (file: iFile) => {
        dispatch(filesActions.closeFile({ path: file.path }));
    };

    const handleCloseAllEditors = () => {
        dispatch(filesActions.closeAllFiles());
    };

    /************************************************
     *  Action renderers
     *
     *
     ************************************************/
    const renderActionCloseAllEditors = () => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            handleCloseAllEditors();
        };
        return (
            <Action
                handler={clickHandler}
                icon={closeAllIcon}
                altMessage="Close editor"
            />
        );
    };

    // const renderActionSaveAllFiles = () => {
    //     const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
    //         e.stopPropagation();
    //         e.preventDefault();
    //     };
    //     return (
    //         <Action
    //             handler={clickHandler}
    //             icon={saveAllIcon}
    //             altMessage="Save all"
    //         />
    //     );
    // };

    const renderActionCloseAFile = (file: iFile) => {
        const clickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            e.preventDefault();
            closeFile(file);
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
            actions={[renderActionCloseAllEditors]}
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
                        <Icon name={getFileIconName(f.path)} size="16px" />
                    </div>
                    <h3 className="item-label">
                        {getFilenameFromPath(f.path)}
                    </h3>
                    <span>{f.path}</span>
                </div>
            ))}
        </Stack>
    );
};

export default OpenEditor;
