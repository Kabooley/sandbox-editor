import React from 'react';
import { Editor } from './Editor';
import { files } from '../data/files';

const Container = () => {
    return (
        <div className="container">
            <Editor files={files} />
        </div>
    );
};

export default Container;
