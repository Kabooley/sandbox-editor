import React from 'react';
import FooterContainer from '../components/Footer';

// DEBUG:
import { useLoadingSurvey } from '../hooks/useLoadingSurvey';

//
const FooterSection = () => {
    // DEBUG:
    useLoadingSurvey('footer-section');

    return (
        <div className="footer-section">
            <FooterContainer />
        </div>
    );
};

export default FooterSection;
