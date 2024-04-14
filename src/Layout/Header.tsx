import React from 'react';
import { Icon as MDIcon } from '@mdi/react';
import { mdiMenuClose, mdiMenuOpen } from '@mdi/js';
import {
    useLayoutState,
    useLayoutDispatch,
    Types as LayoutActions,
} from '../context/LayoutContext';
// import { $heightOfHeader } from '../constants';

const $IconSize = '24px';

const Header = (): JSX.Element => {
    const { isSidebarDisplay } = useLayoutState();
    const dispatchLayoutAction = useLayoutDispatch();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        dispatchLayoutAction({
            type: LayoutActions.ToggleSidebar,
            payload: {},
        });
    };

    const iconPath = isSidebarDisplay ? mdiMenuOpen : mdiMenuClose;

    return (
        <div className="header-section">
            <nav>
                <div className="header-section nav--item">
                    <button onClick={handleClick}>
                        <MDIcon path={iconPath} size={$IconSize} />
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Header;
