import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import { useLayoutState } from '../context/LayoutContext';
import Explorer from './Explorer';

/***
 * NOTE: Must be the same value as defined in the css definition file.
 *
 * minimumWidth: $pane-min-width
 * maximumWidth: $pane-max-width
 */
const defaultWidth = 240;
const minimumWidth = 190;
const maximumWidth = 400;

const PaneSection = (): JSX.Element => {
    const [paneWidth, setPaneWidth] = useState<number>(defaultWidth);
    const { openExplorer } = useLayoutState();

    const onPaneResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        setPaneWidth(size.width);
    };

    if (openExplorer) {
        return (
            <ResizableBox
                width={paneWidth}
                height={Infinity}
                minConstraints={[minimumWidth, Infinity]}
                maxConstraints={[maximumWidth, Infinity]}
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
                    <Explorer />
                </div>
            </ResizableBox>
        );
    } else {
        return <></>;
    }
};

export default PaneSection;
