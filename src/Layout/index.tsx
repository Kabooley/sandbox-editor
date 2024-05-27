import React from 'react';
import EditorSection from './EditorSection';
import PreviewSection from './PreviewSection';
import HeaderSection from './Header';
import MainContainer from './MainContainer';
import SplitPane from './SplitPane';
import PaneSection from './PaneSection';
import FooterSection from './FooterSection';
import { FilesProvider } from '../context/FilesContext';
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
                    <FilesProvider>
                        <BundledCodeProvider>
                            <TypingLibsProvider>
                                <PaneSection />
                                <EditorSection />
                                <PreviewSection />
                            </TypingLibsProvider>
                        </BundledCodeProvider>
                    </FilesProvider>
                </SplitPane>
            </MainContainer>
            <FooterSection />
            <Modal />
        </>
    );
};

export default Layout;
