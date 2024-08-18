import React from 'react'
import EditorSection from './EditorSection'
import PreviewSection from './PreviewSection'
import HeaderSection from '../Header'
import MainContainer from '../MainContainer'
import SplitPane from '../SplitPane'
import PaneSection from '../PaneSection'
import FooterSection from '../FooterSection'
import Modal from '../../components/Modal'

const TabletMediaLayout = () => {
  return (
    <>
      <HeaderSection />
      <MainContainer>
        <SplitPane>
          <PaneSection />
          <EditorSection />
          <PreviewSection />
        </SplitPane>
      </MainContainer>
      <FooterSection />
      <Modal />
    </>
  )
}

export default TabletMediaLayout
