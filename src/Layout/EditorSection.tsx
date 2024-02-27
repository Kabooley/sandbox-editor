import React, { useState, useEffect } from "react";
import { Resizable } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";
import { useWindowSize } from "../hooks";
import EditorContext from "../context/EditorContext";
import { useLayoutDispatch, useLayoutState } from "../context/LayoutContext";
import { Types as LayoutContextActionType } from "../context/LayoutContext";
import { $heightOfHeader, $heightOfFooter, $initialLayout } from "../constants";

const EditorSection = (): JSX.Element => {
  const [height, setHeight] = useState(
    window.innerHeight - $heightOfHeader - $heightOfFooter
  );
  const { editorWidth, isPreviewDisplay } = useLayoutState();
  const dispatch = useLayoutDispatch();
  const { innerHeight } = useWindowSize();
  const { minimumWidth, maximumWidth } = $initialLayout.editorLayout;

  useEffect(() => {
    setHeight(innerHeight - $heightOfHeader - $heightOfFooter);
  }, [innerHeight]);

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

  const _minimumWidth = isPreviewDisplay ? minimumWidth : editorWidth;
  const _maximumWidth = isPreviewDisplay ? maximumWidth : editorWidth;

  return (
    <Resizable
      width={editorWidth}
      height={height}
      minConstraints={[_minimumWidth, height]}
      maxConstraints={[_maximumWidth, height]}
      onResize={onEditorSecResize}
      resizeHandles={["e"]}
      handle={(h, ref) => (
        <span className={`custom-handle custom-handle-${h}`} ref={ref} />
      )}
    >
      <div
        className="editor-section"
        style={{
          width: editorWidth,
        }}
      >
        <EditorContext width={editorWidth} />
      </div>
    </Resizable>
  );
};

export default EditorSection;
