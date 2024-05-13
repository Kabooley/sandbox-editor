import React from 'react';

// DEBUG:
import { useLoadingSurvey } from '../hooks/useLoadingSurvey';

interface iProps {
    children: any;
}

const SplitPane = ({ children }: iProps): JSX.Element => {
    // DEBUG:
    useLoadingSurvey('split-pane');

    return <div className="split-pane">{children}</div>;
};

export default SplitPane;
