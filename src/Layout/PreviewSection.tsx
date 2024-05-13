import React from 'react';
import Preview from '../components/Preview';
import { useLayoutState } from '../context/LayoutContext';

// DEBUG:
import { useLoadingSurvey } from '../hooks/useLoadingSurvey';

const PreviewSection = (): JSX.Element => {
    const { isPreviewDisplay } = useLayoutState();

    // DEBUG:
    useLoadingSurvey('preview-section', false, isPreviewDisplay);

    if (isPreviewDisplay) {
        return (
            <div className="preview-section">
                <Preview />
            </div>
        );
    } else {
        return <></>;
    }
};

export default PreviewSection;
