import React from 'react';
import EditorSection from './EditorSection';
import PreviewSection from './PreviewSection';
import HeaderSection from './Header';
import MainContainer from './MainContainer';
import SplitPane from './SplitPane';
import PaneSection from './PaneSection';
import FooterSection from './FooterSection';
import { BundledCodeProvider } from '../context/BundleContext';
import Modal from '../components/Modal2';

const Layout = (): JSX.Element => {
    return (
        <>
            <HeaderSection />
            <MainContainer>
                <SplitPane>
                    <BundledCodeProvider>
                        <PaneSection />
                        <EditorSection />
                        <PreviewSection />
                    </BundledCodeProvider>
                </SplitPane>
            </MainContainer>
            <FooterSection />
            <Modal />
        </>
    );
};

export default Layout;
