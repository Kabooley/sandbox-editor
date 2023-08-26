import React, { useState } from 'react';
import EditorSection from './EditorSection';
import PreviewSection from './PreviewSection';
import Header from './Header';
import MainContainer from './MainContainer';
import NavigationSection from './NavigationSection';
import SplitPane from './SplitPane';
import Pane from './PaneSection';
import { FilesProvider } from '../context/FilesContext';
import { BundledCodeProvider } from '../context/BundleContext';
import { DependenciesProvider } from '../context/DependecyContext';
import { TypingLibsProvider } from '../context/TypingLibsContext';

/***
 * FilesProvider provides `files` and its action `dispatch`.
 *
 *
 * */
const Layout = (): JSX.Element => {
    return (
        <>
            <Header />
            <MainContainer>
                <NavigationSection />
                <SplitPane>
                    <FilesProvider>
                        <BundledCodeProvider>
                            <TypingLibsProvider>
                                <DependenciesProvider>
                                    <Pane />
                                    <EditorSection />
                                    <PreviewSection />
                                </DependenciesProvider>
                            </TypingLibsProvider>
                        </BundledCodeProvider>
                    </FilesProvider>
                </SplitPane>
            </MainContainer>
        </>
    );
};

export default Layout;
