import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import FileExplorer from './Explorer';

const defaultWidth = 300;

const PaneSection = (): JSX.Element => {
    const [paneWidth, setPaneWidth] = useState<number>(defaultWidth);

    const onPaneResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        setPaneWidth(size.width);
    };

    return (
        <ResizableBox
            width={paneWidth}
            height={Infinity}
            minConstraints={[100, Infinity]}
            maxConstraints={[window.innerWidth * 0.4, Infinity]}
            onResize={onPaneResize}
            resizeHandles={['e']}
            handle={(h, ref) => (
                <span
                    className={`custom-handle custom-handle-${h}`}
                    ref={ref}
                />
            )}
        >
            <div className="pane" style={{ width: paneWidth }}>
                <FileExplorer />
            </div>
        </ResizableBox>
    );
};

export default PaneSection;
