import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import { useWindowSize } from '../hooks';
import EditorContext from '../context/EditorContext';
import { useLayoutDispatch, useLayoutState } from '../context/LayoutContext';
import { Types as LayoutContextActionType } from '../context/LayoutContext';

// cssと異なる値にしないこと
const defaultWidth = 600;
const minimumWidth = 100;

const EditorSection = (): JSX.Element => {
    const { editorWidth } = useLayoutState();
    const dispatch = useLayoutDispatch();

    const { innerWidth } = useWindowSize();
    const onEditorSecResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        dispatch({
            type: LayoutContextActionType.UpdateEditorWidth,
            payload: {
                width: size.width,
            },
        });
    };

    return (
        <ResizableBox
            width={editorWidth}
            height={Infinity}
            minConstraints={[minimumWidth, Infinity]}
            maxConstraints={[innerWidth * 0.8, Infinity]}
            onResize={onEditorSecResize}
            resizeHandles={['e']}
            handle={(h, ref) => (
                <span
                    className={`custom-handle custom-handle-${h}`}
                    ref={ref}
                />
            )}
        >
            <div className="editor-section" style={{ width: editorWidth }}>
                <EditorContext width={editorWidth} />
            </div>
        </ResizableBox>
    );
};

export default EditorSection;
