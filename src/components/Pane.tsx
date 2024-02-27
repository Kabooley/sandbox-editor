import React, { useState, useRef } from "react";
import { Resizable } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";
import {
  useLayoutState,
  useLayoutDispatch,
  Types as TypeOfLayoutAction,
} from "../context/LayoutContext";
import { useWindowSize } from "../hooks";
import VSCodeExplorer from "./VSCodeExplorer/VSCodeExplorer";
import SidebarTitle from "./VSCodeExplorer/SidebarTitle";
import {
  $heightOfPaneTitle,
  $heightOfHeader,
  $heightOfFooter,
  $minConstraintsOfPaneWidth,
  $maxConstraintsOfPaneWidth,
} from "../constants";

/***
 * windowのresizeに対応するために`useWindowSize`を使っている。
 * */
const PaneSection = (): JSX.Element => {
  const { paneWidth, isSidebarDisplay } = useLayoutState();
  const dispatch = useLayoutDispatch();
  const { innerHeight } = useWindowSize();
  const paneHeight = innerHeight - $heightOfHeader - $heightOfFooter;

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

  if (isSidebarDisplay) {
    return (
      <Resizable
        width={paneWidth}
        height={paneHeight}
        minConstraints={[$minConstraintsOfPaneWidth, paneHeight]}
        maxConstraints={[$maxConstraintsOfPaneWidth, paneHeight]}
        onResize={onPaneResize}
        resizeHandles={["e"]}
        handle={(h, ref) => (
          <span className={`custom-handle custom-handle-${h}`} ref={ref} />
        )}
      >
        <div className="pane-container">
          <SidebarTitle width={paneWidth} title={"explorer"} />
          <VSCodeExplorer
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

export default PaneSection;
