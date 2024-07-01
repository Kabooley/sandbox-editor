import React from 'react';
import { Resizable } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import { useWindowSize } from '../hooks';
import SidebarTitle from './VSCodeExplorer/SidebarTitle';
import {
    $heightOfPaneTitle,
    $heightOfHeader,
    $heightOfFooter,
    $minConstraintsOfPaneWidth,
    $maxConstraintsOfPaneWidth,
} from '../constants';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectLayoutState, layoutActions } from '../slices/layoutSlice';
import SkeletonExplorer from './Skeletons/SkeletonExplorer';
// import VSCodeExplorer from './VSCodeExplorer/VSCodeExplorer';

const VSCodeExplorer = React.lazy(
    () => import('./VSCodeExplorer/VSCodeExplorer')
);

/***
 * windowのresizeに対応するために`useWindowSize`を使っている。
 * */
const Pane = (): JSX.Element => {
    const { paneWidth, isSidebarDisplay } = useAppSelector(selectLayoutState);
    const dispatch = useAppDispatch();
    const { innerHeight } = useWindowSize();
    const paneHeight = innerHeight - $heightOfHeader - $heightOfFooter;

    const onPaneResize: (
        e: React.SyntheticEvent,
        data: ResizeCallbackData
    ) => any = (event, { node, size, handle }) => {
        dispatch(layoutActions.UpdatePaneWidth(size.width));
    };

    if (isSidebarDisplay) {
        return (
            <Resizable
                width={paneWidth}
                height={paneHeight}
                minConstraints={[$minConstraintsOfPaneWidth, paneHeight]}
                maxConstraints={[$maxConstraintsOfPaneWidth, paneHeight]}
                onResize={onPaneResize}
                resizeHandles={['e']}
                handle={(h, ref) => (
                    <span
                        className={`custom-handle custom-handle-${h}`}
                        ref={ref}
                    />
                )}
            >
                <div className="pane-container">
                    <SidebarTitle width={paneWidth} title={'explorer'} />
                    {/* <React.Suspense
                        fallback={
                            <SkeletonExplorer
                                width={paneWidth}
                                height={paneHeight - $heightOfPaneTitle}
                            />
                        }
                    >
                        <VSCodeExplorer
                            width={paneWidth}
                            height={paneHeight - $heightOfPaneTitle}
                        />
                    </React.Suspense> */}
                    <SkeletonExplorer
                        width={paneWidth}
                        height={paneHeight - $heightOfPaneTitle}
                    />
                </div>
            </Resizable>
        );
    } else {
        return <></>;
    }
};

export default Pane;
