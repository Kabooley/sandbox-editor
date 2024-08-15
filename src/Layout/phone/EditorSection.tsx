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
 * EditorSection specialized for MediaTypes.Phone
 * 
 * Things different to src/Layout/EditorSection.tsx
 * - Not resize
 * - width is always window.innerWidth
 * 
 * */ 
const EditorSection = () => {
  const [height, setHeight] = useState(
    window.innerHeight - $heightOfHeader - $heightOfFooter
  )
  const { mediaDesktopEditorWidth, isPreviewDisplay } =
    useAppSelector(selectLayoutState)
  const { innerHeight, innerWidth } = useWindowSize()

  useEffect(() => {
    setHeight(innerHeight - $heightOfHeader - $heightOfFooter)
  }, [innerHeight])

  return (
    <div
      className="editor-section"
      style={{
        width: `${innerWidth} + px`,
      }}
    >
      <div className="editor-container">
        <React.Suspense fallback={<EditorSkeleton />}>
          <EditorContainer width={innerWidth} />
        </React.Suspense>
      </div>
    </div>
  )
}

export default EditorSection
