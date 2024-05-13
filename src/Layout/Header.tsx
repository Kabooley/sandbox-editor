import React from 'react';
import Header from '../components/Header';

// DEBUG:
import { useLoadingSurvey } from '../hooks/useLoadingSurvey';

const HeaderSection = (): JSX.Element => {
    // DEBUG:
    useLoadingSurvey('header-section');

    return (
        <>
            <Header />
        </>
    );
};

export default HeaderSection;
