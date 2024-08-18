import React, { useEffect } from 'react'
import HeaderSection from '../Header'
import MainContainer from '../MainContainer'
import SplitPane from '../SplitPane'
import FooterSection from '../FooterSection'
import Modal from '../../components/Modal'
import PreviewSection from '../PreviewSection'
import EditorSection from './EditorSection'
import PaneSection from './PaneSection'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { selectLayoutState, layoutActions } from '../../slices/layoutSlice'

const PhoneMediaLayout = () => {
  const { isPhonePreviewDisplay } = useAppSelector(selectLayoutState)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isPhonePreviewDisplay) {
      dispatch(layoutActions.TogglePhonePreview())
    }
  }, [])

  return (
    <>
      <HeaderSection />
      <MainContainer>
        <SplitPane>
          <PaneSection />
          {isPhonePreviewDisplay ? <PreviewSection /> : <EditorSection />}
        </SplitPane>
      </MainContainer>
      <FooterSection />
      <Modal />
    </>
  )
}

export default PhoneMediaLayout
