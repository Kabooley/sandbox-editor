import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import {
    useLayoutState,
    useLayoutDispatch,
    Types as TypeOfLayoutAction,
} from '../context/LayoutContext';
import type { ViewContexts } from '../context/LayoutContext';
import Explorer from './Explorer';
import DependencyList from './DependencyList';

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
    // const [paneWidth, setPaneWidth] = useState<number>(defaultWidth);
    const { currentContext, paneWidth } = useLayoutState();
    const dispatch = useLayoutDispatch();

    const onPaneResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        // setPaneWidth(size.width);
        dispatch({
            type: TypeOfLayoutAction.UpdatePaneWidth,
            payload: {
                width: size.width,
            },
        }); 
    };

    const renderContext = (context: ViewContexts) => {
        switch (context) {
            case 'explorer': {
                return <Explorer />;
            }
            case 'dependencies': {
                return <DependencyList />;
            }
            case 'none': {
                return null;
            }
            default: {
                throw new Error('Unexpexted context has been received.');
            }
        }
    };

    if (currentContext === 'none') {
        return <></>;
    } else {
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
                    {renderContext(currentContext)}
                </div>
            </ResizableBox>
        );
    }
};

export default PaneSection;
