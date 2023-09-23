import React from 'react';
import FileExplorer from './FileExplorer';
import OpenEditor from './OpenEditors';
import DummyOfPaneSection from '../DummyOfPaneSection';
import { useFiles, useFilesDispatch } from '../../context/FilesContext';
import { generateTreeNodeData } from './generateTree';

const Explorer = () => {
    const files = useFiles();
    const filesDispatch = useFilesDispatch();
    const treeData = generateTreeNodeData(files, 'root');

    return (
        <>
            <span>EXPLORER</span>
            <OpenEditor files={files} filesDispatch={filesDispatch} tree={treeData} />
            <FileExplorer files={files} filesDispatch={filesDispatch} tree={treeData} />
            <DummyOfPaneSection title={'outline'} />
            <DummyOfPaneSection title={'timeline'} />
        </>
    );
};

export default Explorer;
