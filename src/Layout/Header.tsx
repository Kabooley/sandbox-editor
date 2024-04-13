import React from 'react';
import { Icon as MDIcon } from '@mdi/react';
import { mdiMenuClose, mdiMenuOpen } from '@mdi/js';
import {
    useLayoutState,
    useLayoutDispatch,
    Types as LayoutActions,
} from '../context/LayoutContext';

const styleOfNav: React.CSSProperties = {
    alignItems: 'center',
    // backgroundColor: "",
    // color: "",
    display: 'flex',
    flexShrink: '0',
    height: '100%',
    width: '100%',
    // z-index: 100"",
    // -webkit-app-region: drag;
};

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
            <nav style={styleOfNav}>
                <div className="header-sction nav--item">
                    <button onClick={handleClick}>
                        <MDIcon path={iconPath} size={'36px'} />
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Header;
