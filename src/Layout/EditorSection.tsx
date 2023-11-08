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
    const { editorWidth, isPreviewDisplay } = useLayoutState();
    const dispatch = useLayoutDispatch();
    const { innerWidth } = useWindowSize();

    const onEditorSecResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        // NOTE: previewが非表示のときはリサイズ無効にする
        if (!isPreviewDisplay) return;
        dispatch({
            type: LayoutContextActionType.UpdateEditorWidth,
            payload: {
                width: size.width,
            },
        });
    };

    // TODO: 結局こいつらもLayoutContext管理になるのでは？
    //
    // previewが閉じているときは、ハンドルでリサイズさせない（リサイズ無効にする）
    // そのため最小値をeditorWidthにしている
    // これらの計算はLayoutContextで何が起こっているのか知っているという前提に立っている(よくないね)
    const _minimumWidth = isPreviewDisplay ? minimumWidth : editorWidth;
    const _maximumWidth = isPreviewDisplay ? innerWidth * 0.7 : editorWidth;

    // DEBUG:
    console.log(`_minimumWidth: ${_minimumWidth}`);
    console.log(`_maximumWidth: ${_maximumWidth}`);
    console.log(`editorWidth: ${editorWidth}`);

    return (
        <ResizableBox
            width={editorWidth}
            height={Infinity}
            minConstraints={[_minimumWidth, Infinity]}
            maxConstraints={[_maximumWidth, Infinity]}
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
                style={{
                    width: editorWidth,
                    backgroundColor: '#3e354b',
                }}
            >
                <EditorContext width={editorWidth} />
            </div>
        </ResizableBox>
    );
};

export default EditorSection;
