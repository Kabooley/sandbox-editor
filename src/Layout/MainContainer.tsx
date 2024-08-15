import React from 'react'
import useKey from 'react-use/lib/useKey'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  layoutActions,
  selectLayoutState,
  MediaTypes,
} from '../slices/layoutSlice'

interface iProps {
  children: any
}

const KEYCODES_FOR_CHROME = {
  ctrl: 17,
  shift: 16,
  d: 68,
  b: 66,
}

const MainContainer = ({ children }: iProps) => {
  const { mediaType } = useAppSelector(selectLayoutState)
  const dispatch = useAppDispatch()

  useKey(
    (e) => e.ctrlKey && e.keyCode === KEYCODES_FOR_CHROME.d && e.shiftKey,
    (e) => {
      e.preventDefault()
      if (mediaType === MediaTypes.Tablet) {
        dispatch(layoutActions.ToggleTabletPreview())
      } else if (mediaType === MediaTypes.Phone) {
        dispatch(layoutActions.TogglePhonePreview())
      } else {
        dispatch(layoutActions.TogglePreview())
      }
    }
  )
  useKey(
    (e) => e.ctrlKey && e.keyCode === KEYCODES_FOR_CHROME.b,
    (e) => {
      e.preventDefault()
      if (mediaType !== MediaTypes.Desktop) {
        dispatch(layoutActions.ToggleSliderPane())
      } else {
        dispatch(layoutActions.ToggleSidebar())
      }
    }
  )

  return <div className="main-container">{children}</div>
}

export default MainContainer
