/***
 * To use multiple context in Editor component,
 *
 *
 * TODO: Rename this componet to `EditorContext.tsx`.
 * */
import React from 'react';
import { useFiles, useFilesDispatch } from './FilesContext';
import { useBundledCodeDispatch } from './BundleContext';
import { useDependencies, useDependencyDispatch } from './DependecyContext';
import EditorContainer from '../components/EditorContainer';

const EditorContext = () => {
    const files = useFiles();
    const dependencies = useDependencies();
    const dispatchFiles = useFilesDispatch();
    const dispatchBundledCode = useBundledCodeDispatch();
    const dispatchDependencies = useDependencyDispatch();
    // DEBUG:

    return (
        <EditorContainer
            files={files}
            dependencies={dependencies}
            dispatchFiles={dispatchFiles}
            dispatchBundledCode={dispatchBundledCode}
            dispatchDependencies={dispatchDependencies}
        />
    );
};

export default EditorContext;
