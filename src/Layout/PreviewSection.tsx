import React from 'react';
import Preview from '../components/Preview';
import { useLayoutState } from '../context/LayoutContext';

const PreviewSection = (): JSX.Element => {
    const { isPreviewDisplay } = useLayoutState();

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
