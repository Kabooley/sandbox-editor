import React from 'react'
import menu from '../../assets/menu.svg'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import {
  selectLayoutState,
  layoutActions,
  MediaTypes,
} from '../../slices/layoutSlice'

// const $IconSize = '24px';

const Header = (): JSX.Element => {
  const { isPhonePreviewDisplay, mediaType } = useAppSelector(selectLayoutState)
  const dispatch = useAppDispatch()

  const handleClickMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (mediaType !== MediaTypes.Desktop) {
      dispatch(layoutActions.ToggleSliderPane())
    } else {
      dispatch(layoutActions.ToggleSidebar())
    }
  }

  const handleClickSelectEditor = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[Header] select Editor')
    if (isPhonePreviewDisplay) {
      dispatch(layoutActions.TogglePhonePreview())
    }
  }

  const handleClickSelectPreview = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[Header] select Preview')
    if (!isPhonePreviewDisplay) {
      dispatch(layoutActions.TogglePhonePreview())
    }
  }

  const isEditorSelected = isPhonePreviewDisplay ? '' : 'selected'
  const isPreviewSelected = isPhonePreviewDisplay ? 'selected' : ''

  return (
    <div className="header-section">
      <nav>
        <div className="header-section nav--item">
          <button onClick={handleClickMenu}>
            <img src={menu} />
          </button>
        </div>
        {mediaType === MediaTypes.Phone && (
          <div className="header-section nav--item">
            <button
              className={isEditorSelected}
              onClick={handleClickSelectEditor}
            >
              <span>Editor</span>
            </button>
            <button
              className={isPreviewSelected}
              onClick={handleClickSelectPreview}
            >
              <span>Preview</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Header
