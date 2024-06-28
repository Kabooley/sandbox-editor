import React from 'react';
import { ToggleSwitch } from '../../common';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectLayoutState, layoutActions } from '../../slices/layoutSlice';
// import { useLayoutDispatch, useLayoutState } from '../../context/LayoutContext';
// import { Types as LayoutContextActionType } from '../../context/LayoutContext';

// https://github.com/expo/snack/blob/main/website/src/client/components/EditorFooter.tsx
// https://github.com/expo/snack/blob/main/website/src/client/components/shared/ToggleSwitch.tsx#L14
const StatusBar = () => {
    const { isPreviewDisplay } = useAppSelector(selectLayoutState);
    const dispatch = useAppDispatch();

    const onTogglePreview = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(layoutActions.TogglePreview());
    };

    return (
        <div className="status-bar">
            <div className="status-bar-item">
                <div>
                    <div
                        className="status-bar-item__editor-status"
                        title="prettier-format"
                    >
                        <button title="prettier-format">Prettier</button>
                    </div>
                    <div
                        className="status-bar-item__editor-status"
                        title="Go to line"
                    >
                        Ln 11, Col 49
                    </div>
                    <div
                        className="status-bar-item__editor-status"
                        title="Select indentation"
                    >
                        Spaces: 2
                    </div>
                    <div
                        className="status-bar-item__editor-status"
                        title="Language mode"
                    >
                        TypeScript
                    </div>
                    <div
                        className="status-bar-item__editor-status"
                        title="Toggle preview"
                    >
                        {/* <label className="toggle-switch">
                            <span>Preview</span>
                            <span className="toggle-switch__slider"></span>
                            <input type="checkbox" />
                        </label> */}
                        <ToggleSwitch
                            checked={isPreviewDisplay}
                            onChange={onTogglePreview}
                            label={'Preview'}
                            classNames={{
                                container: 'toggle-switch',
                                label: '',
                                switch: 'toggle-switch__slider',
                                input: '',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
