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
import { DependenciesProvider } from '../context/DependecyContext';
import { TypingLibsProvider } from '../context/TypingLibsContext';
import { LayoutStateProvider } from '../context/LayoutContext';

/***
 * FilesProvider provides `files` and its action `dispatch`.
 *
 *
 * */
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
                                    <DependenciesProvider>
                                        <PaneSection />
                                        <EditorSection />
                                        <PreviewSection />
                                    </DependenciesProvider>
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
