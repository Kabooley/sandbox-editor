import React, { useState, useRef } from 'react';
import { ResizableBox } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import {
    useLayoutState,
    useLayoutDispatch,
    Types as TypeOfLayoutAction,
} from '../context/LayoutContext';
import { useWindowSize } from '../hooks';
import type { ViewContexts } from '../context/LayoutContext';
import VSCodeExplorer from './VSCodeExplorer/VSCodeExplorer';
import SidebarTitle from './VSCodeExplorer/SidebarTitle';

/***
 * NOTE: Must be the same value as defined in the css definition file.
 *
 * minimumWidth: $pane-min-width
 * maximumWidth: $pane-max-width
 */
const defaultWidth = 240;
const minimumWidth = 190;
const maximumWidth = window.screen.width * 0.26;
// NOTE: cssと一致させること。
const heightOfSidebarTitle = 36;
// sass/layout/_main.scssより。
const heightOfHeader = 48;
const heightOfFooter = 22;

/***
 * windowのresizeに対応するために`useWindowSize`を使っている。
 * */
const PaneSection = (): JSX.Element => {
    const { paneWidth, currentContext } = useLayoutState();
    const dispatch = useLayoutDispatch();
    const { innerWidth, innerHeight } = useWindowSize();
    const paneHeight = innerHeight - heightOfHeader - heightOfFooter;
    const refThisPane = useRef<HTMLDivElement>(null);

    const onPaneResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        dispatch({
            type: TypeOfLayoutAction.UpdatePaneWidth,
            payload: {
                width: size.width,
            },
        });
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
                <div
                    className="sidebar-container"
                    ref={refThisPane}
                    style={{ height: '100%', width: '100%' }}
                >
                    <SidebarTitle width={paneWidth} title={'explorer'} />
                    <VSCodeExplorer
                        width={paneWidth}
                        height={paneHeight - heightOfSidebarTitle}
                    />
                </div>
            </ResizableBox>
        );
    }
};

export default PaneSection;
