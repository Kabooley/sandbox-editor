/***
 * To get context values so that EditorContainer can use
 * multilpe context values.
 * */
import React from 'react';
import { useFiles, useFilesDispatch } from './FilesContext';
import { useBundledCodeDispatch } from './BundleContext';
import EditorContainer from '../components/EditorContainer';
import { TypingLibsContext } from './TypingLibsContext';

interface iProps {
    width: number;
}

const EditorContext = ({ width }: iProps) => {
    const files = useFiles();
    const addTypings = React.useContext(TypingLibsContext);
    const dispatchFiles = useFilesDispatch();
    const dispatchBundledCode = useBundledCodeDispatch();
    // DEBUG:

    return (
        <EditorContainer
            files={files.filter((f) => !f.isFolder())}
            addTypings={addTypings}
            dispatchFiles={dispatchFiles}
            dispatchBundledCode={dispatchBundledCode}
            width={width}
        />
    );
};

export default EditorContext;
