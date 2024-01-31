import React from 'react';
import { Editor } from './Editor';
import { files } from '../data/files';
import { TypingLibsProvider } from '../context/TypingLibsContext';

const Container = () => {
    return (
        <div className="container">
            <TypingLibsProvider>
                <Editor files={files} />
            </TypingLibsProvider>
        </div>
    );
};

export default Container;
