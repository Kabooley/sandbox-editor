import React from 'react';
import type * as monaco from 'monaco-editor';

interface iProps {
    isLoading: boolean;
    markers: monaco.editor.IMarkerData[];
}

const Statusbar = ({ isLoading, markers }: iProps) => {
    
    // collect errors or warnings
    const errors = markers.filter(m => m.severity >= 5);
    const warnings = markers.filter(m => m.severity === 4);
    // create error and warning messages
    
    let text: any;
    if(isLoading) {
        text = isLoading ? "loading" : "";
    }
    else {
    }
    return (
        <div className="statu-bar">

        </div>
    )
};

export default Statusbar;