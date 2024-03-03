import React, { useState } from 'react';

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: '0',
    },
};

const EditorNoSelectedFile: React.FC<{}> = () => {
    return (
        <div className="editor-no-selected-file" style={styles.container}>
            <h3>No file opened.</h3>
            <div className="editor-no-selected-file__message">
                <span>{}</span>
            </div>
            <div className="editor-no-selected-file__message">
                <span>{}</span>
            </div>
            <div className="editor-no-selected-file__message">
                <span>{}</span>
            </div>
        </div>
    );
};

export default EditorNoSelectedFile;
