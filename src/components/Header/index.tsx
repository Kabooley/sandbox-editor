import React from 'react';
import {
    useLayoutState,
    useLayoutDispatch,
    Types as LayoutActions,
} from '../../context/LayoutContext';
import menu from '../../assets/menu.svg';

// const $IconSize = '24px';

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

    return (
        <div className="header-section">
            <nav>
                <div className="header-section nav--item">
                    <button onClick={handleClick}>
                        <img src={menu} />
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Header;
