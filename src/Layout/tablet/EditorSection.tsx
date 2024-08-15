import React, { useState, useEffect } from 'react'
import { Resizable } from 'react-resizable'
import type { ResizeCallbackData } from 'react-resizable'
import { useWindowSize } from '../../hooks'
import EditorSkeleton from '../../components/Skeletons/SkeletonEditor'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { selectLayoutState, layoutActions } from '../../slices/layoutSlice'
import {
  $heightOfHeader,
  $heightOfFooter,
  $initialLayout,
} from '../../constants'

const EditorContainer = React.lazy(() =>
  import('../../components/EditorContainer')
)

/***
 * @media Tablet
 *
 * */
const EditorSection = (): JSX.Element => {
  const [height, setHeight] = useState(
    window.innerHeight - $heightOfHeader - $heightOfFooter
  )
  const { mediaTabletEditorWidth, isTabletPreviewDisplay } =
    useAppSelector(selectLayoutState)
  const dispatch = useAppDispatch()
  const { innerHeight } = useWindowSize()
  const { minimumWidth, maximumWidthRate } = $initialLayout.editorLayout

  useEffect(() => {
    setHeight(innerHeight - $heightOfHeader - $heightOfFooter)
  }, [innerHeight])

  const onEditorSecResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
    // NOTE: previewが非表示のときはリサイズ無効にする
    if (!isTabletPreviewDisplay) return
    dispatch(layoutActions.UpdateEditorWidth(size.width))
  }

  const _minimumWidth = isTabletPreviewDisplay
    ? minimumWidth
    : mediaTabletEditorWidth
  const _maximumWidth = isTabletPreviewDisplay
    ? maximumWidthRate * window.innerWidth
    : mediaTabletEditorWidth

  return (
    <Resizable
      width={mediaTabletEditorWidth}
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
          width: mediaTabletEditorWidth,
        }}
      >
        <div className="editor-container">
          <React.Suspense fallback={<EditorSkeleton />}>
            <EditorContainer width={mediaTabletEditorWidth} />
          </React.Suspense>
        </div>
      </div>
    </Resizable>
  )
}

export default EditorSection
