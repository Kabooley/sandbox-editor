import React from 'react';
import Pane from '../components/Pane';

// DEBUG:
import { useLoadingSurvey } from '../hooks/useLoadingSurvey';

const PaneSection = (): JSX.Element => {
    // DEBUG:
    useLoadingSurvey('pane-section');

    return (
        <>
            <Pane />
        </>
    );
};

export default PaneSection;
