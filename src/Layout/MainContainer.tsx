import React from 'react';
import useKey from 'react-use/lib/useKey';
import { useAppDispatch } from '../store/hooks';
import { layoutActions } from '../slices/layoutSlice';

// DEBUG:
import { useLoadingSurvey } from '../hooks/useLoadingSurvey';

interface iProps {
    children: any;
}

const KEYCODES_FOR_CHROME = {
    ctrl: 17,
    shift: 16,
    d: 68,
    b: 66,
};

const MainContainer = ({ children }: iProps) => {
    const dispatch = useAppDispatch();
    useKey(
        (e) => e.ctrlKey && e.keyCode === KEYCODES_FOR_CHROME.d && e.shiftKey,
        (e) => {
            e.preventDefault();
            dispatch(layoutActions.TogglePreview());
        }
    );
    useKey(
        (e) => e.ctrlKey && e.keyCode === KEYCODES_FOR_CHROME.b,
        (e) => {
            e.preventDefault();
            dispatch(layoutActions.ToggleSidebar());
        }
    );

    // DEBUG:
    useLoadingSurvey('main-container');

    return <div className="main-container">{children}</div>;
};

export default MainContainer;
