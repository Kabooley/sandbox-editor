import React from 'react';
import Preview from '../components/Preview';
import { useAppSelector } from '../store/hooks';
import { selectLayoutState } from '../slices/layoutSlice';

// DEBUG:
import { useLoadingSurvey } from '../hooks/useLoadingSurvey';

const PreviewSection = (): JSX.Element => {
    const { isPreviewDisplay } = useAppSelector(selectLayoutState);

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
