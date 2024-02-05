import React from 'react';
import type { iExplorer } from '../../../data/types';
import textFileIcon from '../../../assets/text-file.svg';
import folderIcon from '../../../assets/folder.svg';

// svg
// https://www.svgrepo.com/svg/486222/file-backup-2

const TreeColumnIconName = ({ explorer }: { explorer: iExplorer }) => {
    return (
        <div className="treeColumn-icon-name">
            {explorer.isFolder ? (
                <img src={folderIcon} alt="folder icon" />
            ) : (
                <img src={textFileIcon} alt="folder icon" />
            )}
            <span className="treeColumn-icon-name--name">{explorer.name}</span>
        </div>
    );
};

export default TreeColumnIconName;
