/***
 * To get context values so that EditorContainer can use
 * multilpe context values.
 * */
import React from 'react';
import { useBundledCodeDispatch } from './BundleContext';
import LoadingEditor from '../components/LoadingEditor';
import { useAppSelector, useAppDispatch } from '../store/hooks';

interface iProps {
    width: number;
}

const EditorContainer = React.lazy(
    () => import('../components/EditorContainer')
);

/***
 * class componentが複数のcontextの値を自身で扱えないことを解決するために
 * 存在するEditorContainerのラッパーコンポーネント。
 *
 * TODO: reduxの導入が問題なく完了したらこのコンポーネントを削除してその機能を
 * EditorContainer.tsxへ移動すること。
 *
 * */
const EditorContext = ({ width }: iProps) => {
    const dispatchBundledCode = useBundledCodeDispatch();
    const dispatch = useAppDispatch();

    return (
        <div className="editor-container">
            <React.Suspense fallback={<LoadingEditor />}>
                <EditorContainer
                    dispatchBundledCode={dispatchBundledCode}
                    width={width}
                    dispatch={dispatch}
                />
            </React.Suspense>
        </div>
    );
};

export default EditorContext;
