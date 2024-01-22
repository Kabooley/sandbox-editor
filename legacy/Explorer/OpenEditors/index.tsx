import React, { useState } from 'react';
import SectionTitle from '../SectionTitle';
import type { iExplorer } from '../../../data/types';
import { File } from '../../../data/files';
import type { iFilesActions } from '../../../context/FilesContext';
import { Types as FilesActionTypes } from '../../../context/FilesContext';
import fileIcon from '../../../assets/text-file.svg';
import closeButton from '../../../assets/close-button.svg';
import { getFilenameFromPath } from '../../../utils';

interface iProps {
    files: File[];
    filesDispatch: React.Dispatch<iFilesActions>;
    tree: iExplorer; // いらないかも
}

const sectionTitle = 'open editor';

const OpenEditors = ({ files, filesDispatch, tree }: iProps) => {
    const [collapse, setCollapse] = useState<boolean>(true);
    const filesOpening = files.filter((f) => f.isOpening());

    // --- Functions for each opening file column ---

    /**
     * Set isSelected as true.
     **/
    const handleClickFilename = (
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

    const closeFileFromEditor = (
        e: React.MouseEvent<HTMLSpanElement>,
        file: File
    ) => {
        e.stopPropagation();

        filesDispatch({
            type: FilesActionTypes.Close,
            payload: {
                path: file.getPath(),
            },
        });
    };

    // --- Functions for SectionTitle ---

    const addUntitledFile = () => {
        console.log('[OpenEditors] add untitled file');
    };

    const saveAllFilesOnEditor = () => {
        console.log('[OpenEditors] save all files');
    };

    const closeAllFilesOnEditor = () => {
        console.log('[OpenEditors] close all files');
    };

    const renderAddUntitledFileFunction = () => {
        return (
            <div onClick={addUntitledFile}>
                <img src={fileIcon} alt="Add untitled file to explorer" />
            </div>
        );
    };

    const renderSaveAllFilesOnEditor = () => {
        return (
            <div onClick={saveAllFilesOnEditor}>
                <img src={fileIcon} alt="Add untitled file to explorer" />
            </div>
        );
    };

    const renderCloseAllFilesOnEditor = () => {
        return (
            <div onClick={closeAllFilesOnEditor}>
                <img src={fileIcon} alt="Add untitled file to explorer" />
            </div>
        );
    };

    const renderColumn = (file: File, key: number): JSX.Element => {
        return (
            <div className="treeColumn" key={key}>
                <div className="columnItem">
                    <div className="columnItem--function">
                        <div onClick={(e) => closeFileFromEditor(e, file)}>
                            <img src={closeButton} alt="close file on Editor" />
                        </div>
                    </div>
                    <div
                        className="treeColumn-icon-name"
                        onClick={(e) => handleClickFilename(e, file)}
                    >
                        <img src={fileIcon} alt="file icon" />
                        <span className="treeColumn-icon-name--name">
                            {getFilenameFromPath(file.getPath())}
                        </span>
                        <span className="treeColumn-icon-name--name path">
                            {file.getPath()}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="pane-section">
            <SectionTitle
                title={sectionTitle}
                collapse={collapse}
                setCollapse={setCollapse}
                treeItemFunctions={[
                    renderAddUntitledFileFunction,
                    renderSaveAllFilesOnEditor,
                    renderCloseAllFilesOnEditor,
                ]}
            />
            <div className={collapse ? 'collapsible collapse' : 'collapsible'}>
                {filesOpening.map((f, index) => renderColumn(f, index))}
            </div>
        </section>
    );
};

export default OpenEditors;
