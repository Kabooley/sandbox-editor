import React, { useState } from 'react';

interface iProps {
    children: any;
}

const SplitPane = ({ children }: iProps): JSX.Element => {
    return <div className="split-pane">{children}</div>;
};

export default SplitPane;
