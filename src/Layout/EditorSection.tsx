import React, { useState, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import type { ResizeCallbackData } from 'react-resizable';
import { useWindowSize } from '../hooks';
import EditorSkeleton from '../components/Skeletons/SkeletonEditor';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectLayoutState, layoutActions } from '../slices/layoutSlice';
import { $heightOfHeader, $heightOfFooter, $initialLayout } from '../constants';

const EditorContainer = React.lazy(
  () => import('../components/EditorContainer')
);

const EditorSection = (): JSX.Element => {
  const [height, setHeight] = useState(
    window.innerHeight - $heightOfHeader - $heightOfFooter
  );
  const { mediaDesktopEditorWidth, isPreviewDisplay } =
    useAppSelector(selectLayoutState);
  const dispatch = useAppDispatch();
  const { innerHeight } = useWindowSize();
  const { minimumWidth, maximumWidthRate } = $initialLayout.editorLayout;

  useEffect(() => {
    setHeight(innerHeight - $heightOfHeader - $heightOfFooter);
  }, [innerHeight]);

  const onEditorSecResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
    // NOTE: previewが非表示のときはリサイズ無効にする
    if (!isPreviewDisplay) return;
    dispatch(layoutActions.UpdateEditorWidth(size.width));
  };

  const _minimumWidth = isPreviewDisplay
    ? minimumWidth
    : mediaDesktopEditorWidth;
  const _maximumWidth = isPreviewDisplay
    ? maximumWidthRate * window.innerWidth
    : mediaDesktopEditorWidth;

  return (
    <Resizable
      width={mediaDesktopEditorWidth}
      height={height}
      minConstraints={[_minimumWidth, height]}
      maxConstraints={[_maximumWidth, height]}
      onResize={onEditorSecResize}
      resizeHandles={['e']}
      handle={(h, ref) => (
        <span className={`custom-handle custom-handle-${h}`} ref={ref} />
      )}
    >
      <div
        className="editor-section"
        style={{
          width: mediaDesktopEditorWidth,
        }}
      >
        <div className="editor-container">
          <React.Suspense fallback={<EditorSkeleton />}>
            <EditorContainer width={mediaDesktopEditorWidth} />
          </React.Suspense>
        </div>
      </div>
    </Resizable>
  );
};

export default EditorSection;
