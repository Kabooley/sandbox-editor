/***
 * To get context values so that EditorContainer can use
 * multilpe context values.
 * */
import React from 'react';
import { useFiles, useFilesDispatch } from './FilesContext';
import { useBundledCodeDispatch } from './BundleContext';
// import EditorContainer from '../components/EditorContainer';
import LoadingEditor from '../components/LoadingEditor';

const EditorContainer = React.lazy(
    () => import('../components/EditorContainer')
);

// TODO: 結局adExtraLibsを提供しないといけない？もしくはEditorContainerは独自にaddExtraLibsをやるか...どちらか選ぶ感じ。
// import { TypingLibsContext } from './TypingLibsContext';

interface iProps {
    width: number;
}

const EditorContext = ({ width }: iProps) => {
    const files = useFiles();
    // const addTypings = React.useContext(TypingLibsContext);
    const dispatchFiles = useFilesDispatch();
    const dispatchBundledCode = useBundledCodeDispatch();
    // DEBUG:

    return (
        <div className="editor-container">
            <React.Suspense fallback={<LoadingEditor />}>
                <EditorContainer
                    files={files.filter((f) => !f.isFolder())}
                    // addTypings={addTypings}
                    dispatchFiles={dispatchFiles}
                    dispatchBundledCode={dispatchBundledCode}
                    width={width}
                />
            </React.Suspense>
        </div>
    );
};

export default EditorContext;
