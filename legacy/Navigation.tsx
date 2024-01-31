import React from 'react';
import folderIcon from '../assets/folder-for-activitybar.svg';
import { useLayoutDispatch, Types } from '../context/LayoutContext';
import type { ViewContexts } from '../context/LayoutContext';

interface iProps {
    onOpenExplorer: () => void;
}

interface iActivity {
    title: ViewContexts;
    alt: string;
}

// TODO: Implement logic and pass correct data.
const dummy: iActivity[] = [
    { title: 'explorer', alt: 'open or close file explorer' },
    { title: 'dependencies', alt: 'open or close file explorer' },
];

// TODO: Rename this as "ActivityBar"
const Navigation = ({ onOpenExplorer }: iProps): JSX.Element => {
    const dispatch = useLayoutDispatch();

    const onClick = (
        e: React.MouseEvent<HTMLElement>,
        activity: ViewContexts
    ) => {
        e.stopPropagation();

        // DEBUG:
        console.log(`[Navigation] Selectedactivity: ${activity}`);

        dispatch({
            type: Types.ChangeContext,
            payload: {
                context: activity,
            },
        });
    };

    return (
        <div className="navigation-contents">
            {dummy.map((d, index) => (
                <span
                    className="navigation-contents__content"
                    key={index}
                    onClick={(e) => onClick(e, d.title)}
                >
                    <img src={folderIcon} alt={d.alt} />
                </span>
            ))}
        </div>
    );
};

export default Navigation;
