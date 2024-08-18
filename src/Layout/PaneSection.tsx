import React from 'react'
import Pane from '../components/Pane'
import SliderPane from '../components/SliderPane'
import { useAppSelector } from '../store/hooks'
import { selectLayoutState, MediaTypes } from '../slices/layoutSlice'

const PaneSection = (): JSX.Element => {
  const { mediaType } = useAppSelector(selectLayoutState)

  if (mediaType !== MediaTypes.Desktop) {
    return (
      <>
        <SliderPane />
      </>
    )
  } else {
    return (
      <>
        <Pane />
      </>
    )
  }
}

export default PaneSection
