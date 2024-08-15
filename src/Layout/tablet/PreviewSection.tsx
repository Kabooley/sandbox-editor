import React from 'react'
import Preview from '../../components/Preview'
import { useAppSelector } from '../../store/hooks'
import { selectLayoutState } from '../../slices/layoutSlice'

const PreviewSection = (): JSX.Element => {
  const { isTabletPreviewDisplay } = useAppSelector(selectLayoutState)

  if (isTabletPreviewDisplay) {
    return (
      <div className="preview-section">
        <Preview />
      </div>
    )
  } else {
    return <></>
  }
}

export default PreviewSection
