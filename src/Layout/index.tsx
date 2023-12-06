import React from 'react';
import EditorSection from './EditorSection';
import PreviewSection from './PreviewSection';
import Header from './Header';
import MainContainer from './MainContainer';
import NavigationSection from './NavigationSection';
import SplitPane from './SplitPane';
import PaneSection from './PaneSection';
import FooterSection from './FooterSection';
import { FilesProvider } from '../context/FilesContext';
import { BundledCodeProvider } from '../context/BundleContext';
import { TypingLibsProvider } from '../context/TypingLibsContext3';
import { LayoutStateProvider } from '../context/LayoutContext';

const Layout = (): JSX.Element => {
    return (
        <>
            <LayoutStateProvider>
                <Header />
                <MainContainer>
                    <NavigationSection />
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
            </LayoutStateProvider>
        </>
    );
};

export default Layout;
