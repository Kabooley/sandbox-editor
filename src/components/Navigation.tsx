import React from 'react';
import folderIcon from '../assets/folder-for-activitybar.svg';
import { useLayoutDispatch, Types } from '../context/LayoutContext';

interface iProps {
    onOpenExplorer: () => void;
}

// TODO: Implement logic and pass correct data.
const dummy = [{ title: 'file explorer', alt: 'open or close file explorer' }];

// TODO: Rename this as "ActivityBar"
const Navigation = ({ onOpenExplorer }: iProps): JSX.Element => {
    const dispatch = useLayoutDispatch();

    const onClick = (e: React.MouseEvent<HTMLElement>, activity: string) => {
        e.stopPropagation();
        if (activity === 'file explorer') {
            // DEBUG:
            console.log('[Navigation] on toggle Explorer');

            dispatch({
                type: Types.SlideExplorer,
                payload: {},
            });
        }
    };

    return (
        <div className="navigation-contents">
            {dummy.map((d, index) => (
                <span
                    className="navigation-contents__content"
                    key={index}
                    onClick={(e) => onClick(e, d.title)}
                >
                    <img src={folderIcon} alt="" />
                </span>
            ))}
        </div>
    );
};

export default Navigation;
