import React from 'react';
import EditorSection from './EditorSection';
import PreviewSection from './PreviewSection';
import HeaderSection from './Header';
import MainContainer from './MainContainer';
import SplitPane from './SplitPane';
import PaneSection from './PaneSection';
import FooterSection from './FooterSection';
import { BundledCodeProvider } from '../context/BundleContext';
import { TypingLibsProvider } from '../context/TypingLibsContext';
import Modal from '../components/Modal';

// DEBUG:
import { useLoadingSurvey } from '../hooks/useLoadingSurvey';

const Layout = (): JSX.Element => {
    useLoadingSurvey('layout-index.tsx');

    return (
        <>
            <HeaderSection />
            <MainContainer>
                <SplitPane>
                    <BundledCodeProvider>
                        <TypingLibsProvider>
                            <PaneSection />
                            <EditorSection />
                            <PreviewSection />
                        </TypingLibsProvider>
                    </BundledCodeProvider>
                </SplitPane>
            </MainContainer>
            <FooterSection />
            <Modal />
        </>
    );
};

export default Layout;
