import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import { useWindowSize } from '../hooks';
import EditorContext from '../context/EditorContext';

// cssと異なる値にしないこと
const defaultWidth = 600;
const minimumWidth = 100;

const EditorSection = (): JSX.Element => {
    const [editorSectionWidth, setEditorSectionWidth] =
        useState<number>(defaultWidth);
    const { innerWidth } = useWindowSize();

    const onEditorSecResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        setEditorSectionWidth(size.width);
    };

    return (
        <ResizableBox
            width={editorSectionWidth}
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
            <div
                className="editor-section"
                style={{ width: editorSectionWidth }}
            >
                <EditorContext />
            </div>
        </ResizableBox>
    );
};

export default EditorSection;
